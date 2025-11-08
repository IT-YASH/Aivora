import React, { useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import WriteArticle from "./pages/WriteArticle";
import GenerateImages from "./pages/GenerateImages";
import RemoveBackgorund from "./pages/RemoveBackgorund";
import RemoveObject from "./pages/RemoveObject";
import ReviewResume from "./pages/ReviewResume";
import Community from "./pages/Community";
import BlogTiltles from "./pages/BlockTiltles";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await getToken();
        console.log("🔑 Clerk JWT Token:", token);
        console.log("🙍 User Info:", user);
      } catch (err) {
        console.error("Failed to get Clerk token:", err);
      }
    };
    fetchToken();
  }, [getToken, user]);
  return (
    <div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ai" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="write-article" element={<WriteArticle />} />
          <Route path="blog-titles" element={<BlogTiltles />} />
          <Route path="generate-images" element={<GenerateImages />} />
          <Route path="remove-background" element={<RemoveBackgorund />} />
          <Route path="remove-object" element={<RemoveObject />} />
          <Route path="review-resume" element={<ReviewResume />} />
          <Route path="community" element={<Community />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
