# AI SaaS Platform

<p float="left">
  <img src="./client/src/assets/HomePage.png" alt="HomePage" width="400" />
  <img src="./client/src/assets/Dashboard.png" alt="Dashboard" width="400" />
</p>

<p float="left">
  <img src="./client/src/assets/WriteArticle.png" alt="WriteArticle" width="400" />
  <img src="./client/src/assets/GenerateImages.png" alt="GenerateImages" width="400" />
</p>

<p float="left">
  <img src="./client/src/assets/RemoveBackground.png" alt="RemoveBackground" width="400" />
  <img src="./client/src/assets/ReviewResume.png" alt="ReviewResume" width="400" />
</p>

---

## 🌟 Project Overview

**AI SaaS Platform** is a full-stack web application providing AI-powered tools for content generation and image processing. Users can:

- Generate articles and blog titles
- Generate AI-based images
- Remove backgrounds or objects from images
- Review resumes with AI feedback
- Interact with a community section to view published content

The platform uses **React.js** for frontend, **Node.js/Express.js** for backend, and **Neon PostgreSQL** as the database. **Clerk** handles authentication, and **Cloudinary** manages image uploads.

The project is deployed on **Vercel (frontend)** and **serverless backend** for fast, scalable operations.

---

## 💻 Technology Stack

**Frontend:**
- React.js with Vite
- Tailwind CSS
- Clerk React for authentication
- Axios for API calls
- React Router DOM
- React Hot Toast for notifications

**Backend:**
- Node.js with Express.js
- Neon Serverless (PostgreSQL)
- Clerk for user authentication
- OpenAI API for AI features
- Cloudinary for image storage
- Multer for file uploads
- pdf-parse for PDF parsing

---

## ⚡ Features

- **User Authentication** – Signup/login with Clerk
- **Dashboard** – View AI tools and user creations
- **AI Article & Blog Generation**
- **Image Generation**
- **Image Editing** – Remove backgrounds/objects
- **Resume Review** – AI-driven feedback
- **Community Section** – View & like creations
- **Admin Features (Optional)** – Monitor users and creations

---

## Run Project

### 1️⃣ Frontend
1. Navigate to frontend folder:
- cd client
- npm i
- npm run dev

### 2️⃣ Backend
2.Navigate to backend folder:
- cd server
- npm i
- npm run server
