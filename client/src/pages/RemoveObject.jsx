import React, { useState } from "react";
import { Eraser, Scissors, Sparkles, Download } from "lucide-react"; // ✅ Added Download here
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObject = () => {
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState(""); // ✅ for preview
  const [object, setObject] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const { getToken } = useAuth();

  // ✅ show preview immediately after file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setInput(file);
    setPreview(URL.createObjectURL(file)); // instant preview
  };

  // ✅ send image + object name to backend
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (object.split(" ").length > 1) {
        setLoading(false);
        return toast.error("Please enter only one object name");
      }

      const formData = new FormData();
      formData.append("image", input);
      formData.append("object", object);

      const { data } = await axios.post(
        "/api/ai/remove-image-object",
        formData,
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        setContent(data.content);
        toast.success("Object removed successfully!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  // ✅ download the processed image
  const downloadImage = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");

      // auto-name file based on object name
      const fileName = object
        ? `${object.toLowerCase().replace(/\s+/g, "-")}-removed.png`
        : "object-removed.png";

      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
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
      {/* LEFT SIDE - Upload Form */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Scissors className="w-6 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Object Removal</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Upload Image</p>
        <input
          onChange={handleFileChange}
          type="file"
          accept="image/*"
          className="w-full text-gray-600 p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          required
        />

        {/* ✅ Image Preview Section */}
        {preview && (
          <div className="mt-4">
            <p className="text-sm mb-1 text-gray-500">Preview:</p>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto rounded-lg border border-gray-200"
            />
          </div>
        )}

        <p className="mt-6 text-sm font-medium">
          Describe object name to remove
        </p>
        <textarea
          rows={4}
          onChange={(e) => setObject(e.target.value)}
          value={object}
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="e.g., Watch or spoon (only single object name)"
          required
        />

        <p className="text-xs text-gray-500 font-light mt-1">
          Supports JPG, PNG and other image formats
        </p>

        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-linear-to-r from-[#417DF6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Scissors className="w-5" />
          )}
          Remove Object
        </button>
      </form>

      {/* RIGHT SIDE - Result */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-100">
        <div className="flex items-center gap-3">
          <Scissors className="w-5 h-5 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Processed Image</h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Scissors className="w-9 h-9" />
              <p>Upload an image and click "Remove Object" to get started</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center mt-3">
            <img
              src={content}
              alt="Processed"
              className="w-full h-auto rounded-lg shadow-md"
            />

            {/* ✅ Download Button */}
            <button
              onClick={() => downloadImage(content)}
              className="mt-4 w-full flex justify-center items-center gap-2 bg-[#4A7AFF] hover:bg-[#3b68d4] text-white px-4 py-2 text-sm rounded-md font-medium transition-all"
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

export default RemoveObject;
