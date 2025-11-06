import OpenAI from "openai";
import sql from "../config/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import FormData from "form-data";
import fs from "fs";
import pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
const { getDocument } = pdfjsLib;

pdfjsLib.GlobalWorkerOptions.workerSrc = null;

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// generate article
export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    if (!prompt || prompt.trim().length < 5) {
      return res.json({
        success: false,
        message: "Please enter a longer prompt.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: length,
    });

    const content = response.choices[0].message.content;

    await sql`
  INSERT INTO creations (user_id, prompt, content, type)
  VALUES (${userId}, ${prompt}, ${content}, 'article')
`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    return res.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error("Error generating article:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while generating the article.",
    });
  }
};

//generate blocktitle
export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    if (!prompt || prompt.trim().length < 5) {
      return res.json({
        success: false,
        message: "Please enter a longer prompt.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;

    await sql`
  INSERT INTO creations (user_id, prompt, content, type)
  VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    return res.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error("Error generating article:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while generating the article.",
    });
  }
};

//generate image
export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    if (!prompt || prompt.trim().length < 3) {
      return res.json({
        success: false,
        message: "Please provide a valid image prompt.",
      });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);

    const response = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: {
          "x-api-key": process.env.CLIPDROP_API_KEY,
          ...formData.getHeaders(), // <-- critical!
        },
        responseType: "arraybuffer",
      }
    );

    if (!response.data || response.data.byteLength === 0) {
      throw new Error("Empty image data received from ClipDrop");
    }

    const base64Image = `data:image/png;base64,${Buffer.from(
      response.data
    ).toString("base64")}`;

    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      resource_type: "image",
    });

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish)
      VALUES (${userId}, ${prompt}, ${uploadResult.secure_url}, 'image', ${
      publish ?? false
    })
    `;

    return res.json({
      success: true,
      content: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("Error generating image:", error.response?.data || error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while generating the image.",
    });
  }
};

//remove imagebackground
export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const file = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    if (!file || !file.path) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded.",
      });
    }

    // Upload to Cloudinary with background removal
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      resource_type: "image",
      transformation: [
        {
          effect: "background_removal",
          background_removal: "remove_the_background",
        },
      ],
    });

    // Save record in DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Remove background from image', ${uploadResult.secure_url}, 'image')
    `;

    // Send success response
    return res.json({
      success: true,
      content: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("Error removing background:", error.response?.data || error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while removing the background from the image.",
    });
  }
};

//remove image object
export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const file = req.file; // multer file object
    const { object } = req.body; // object name to remove
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    if (!file || !file.path) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded.",
      });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      resource_type: "image",
    });

    // Generate Cloudinary URL with object removal transformation
    const imageUrl = cloudinary.url(uploadResult.public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });

    // Save record in DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${`Removed ${object} from image`}, ${
      uploadResult.secure_url
    }, 'image')
    `;

    // Return success response
    return res.json({
      success: true,
      content: imageUrl,
    });
  } catch (error) {
    console.error("Error removing object:", error.response?.data || error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while removing object from the image.",
    });
  }
};

//review resume
export const reviewResume = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    if (!resume || !resume.path) {
      return res.status(400).json({
        success: false,
        message: "No resume file uploaded.",
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume file size exceeds allowed size (5MB).",
      });
    }

    const dataBuffer = fs.readFileSync(resume.path);
    const loadingTask = pdfjsLib.getDocument({ data: dataBuffer });
    const pdfDoc = await loadingTask.promise;

    let pdfText = "";
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const content = await page.getTextContent();
      pdfText += content.items.map((item) => item.str).join(" ") + "\n";
    }

    // AI prompt
    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume content:\n\n${pdfText}`;

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')
    `;

    return res.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error("Error reviewing resume:", error.response?.data || error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while reviewing the resume.",
      details: error.message,
    });
  }
};
