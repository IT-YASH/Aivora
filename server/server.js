import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import aiRouter from "./routes/aiRoutes.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

// ✅ Safe Cloudinary connection for Lambda
(async () => {
  try {
    await connectCloudinary();
    console.log("✅ Cloudinary connected");
  } catch (err) {
    console.error("❌ Cloudinary connection failed:", err.message);
  }
})();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.get("/", (req, res) => res.send("Server is live"));

app.use(requireAuth());

app.use("/api/ai", aiRouter);
app.use("/api/user", userRouter);

export default app;

const isLocal = process.env.IS_LOCAL === "true";
const isVercel = process.env.VERCEL === "1";
const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

if (isLocal) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log("Server running locally on port", PORT));
} else if (isVercel) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log("Server running on Vercel on port", PORT));
} else if (isLambda) {
  console.log("Running on Lambda (no listen needed)");
}
