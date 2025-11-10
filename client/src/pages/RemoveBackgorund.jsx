import React, { useState } from "react";
import { Eraser, Sparkles, Download } from "lucide-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveBackgorund = () => {
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const { getToken } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setInput(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", input);

      const { data } = await axios.post(
        "/api/ai/remove-image-background",
        formData,
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const downloadImage = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "background-removed.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  return (
    <div className="h-full flex overflow-y-scroll p-6 items-start flex-wrap gap-4 text-slate-700">
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#FF4938]" />
          <h1 className="text-xl font-semibold">Background Removal</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Upload Image</p>
        <input
          onChange={handleFileChange}
          type="file"
          accept="image/*"
          className="w-full text-gray-600 p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          required
        />

        <p className="text-xs text-gray-500 font-light mt-1">
          Supports JPG, PNG and other Image Formats
        </p>

        {/* 🆕 Preview of uploaded image */}
        {preview && (
          <div className="mt-4">
            <p className="text-sm mb-1 text-gray-500">Preview:</p>
            <div className="w-full h-64 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50">
              <img
                src={preview}
                alt="Preview"
                className="object-contain w-full h-full"
              />
            </div>
          </div>
        )}

        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-linear-to-r from-[#F6AB41] to-[#FF4938] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Eraser className="w-5" />
          )}
          Remove Background
        </button>
      </form>

      {/* Right Col */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex  flex-col border border-gray-200 min-h-96">
        <div className="flex items-center gap-3">
          <Eraser className="w-5 h-5 text-[#FF4938]" />
          <h1 className="text-xl font-semibold">Processed Image</h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Eraser className="w-9 h-9" />
              <p>
                Upload an image and click "Remove Background" to get Started
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full mt-3 flex flex-col items-center">
            {/* ✅ Fixed Height Image Box */}
            <div className="w-full h-64 rounded-lg shadow-md overflow-hidden flex items-center justify-center bg-gray-50">
              <img
                src={content}
                alt="Processed"
                className="object-contain w-full h-full"
              />
            </div>

            {/* ✅ Download Button */}
            <button
              onClick={() => downloadImage(content)}
              className="mt-4 w-full flex justify-center items-center gap-2 bg-[#FF4938] hover:bg-[#e73f2d] text-white px-4 py-2 text-sm rounded-md font-medium transition-all duration-200 transform hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" />
              <span>Download Image</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemoveBackgorund;
