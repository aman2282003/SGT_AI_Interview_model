<div align="center">
  <img src="https://img.shields.io/badge/AI--Powered-Interviewer-blue?style=for-the-badge&logo=openai" alt="AI Interviewer Logo">
  <img src="https://img.shields.io/badge/MERN-Stack-green?style=for-the-badge&logo=mongodb" alt="MERN Stack">
  <img src="https://img.shields.io/badge/Vite-React%2019-646CFF?style=for-the-badge&logo=vite" alt="Vite React">
  
  <h1>🚀 Advanced AI Interview Platform</h1>
  <p><b>The future of technical hiring.</b> A professional-grade, AI-integrated assessment tool designed for scale, consistency, and depth.</p>
</div>

<br />

> [!IMPORTANT]
> **Revolutionizing Technical Hiring:** This platform automates the initial screening process by providing a live, AI-driven technical interview environment. It combines real-time coding, conversational AI, and synchronized media recording.

---

## 🎯 Purpose & Impact

Manual technical interviews are time-consuming and often biased. This platform provides a robust, standardized environment where:
- **Recruiters** can screen hundreds of candidates simultaneously without engineering overhead.
- **Candidates** can showcase their skills in a professional, VS Code-like environment.
- **Analytics** provide data-driven insights into candidate logic, syntax, and communication.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **🤖 AI Interviewer** | A conversational agent powered by **Google Gemini API** that conducts technical dialogues. |
| **💻 Interactive Code Editor** | Integrated **Monaco Editor** supporting multiple languages with syntax highlighting. |
| **🧠 Smart Execution** | A clever **Simulated Code Execution Engine** using **Groq (Llama 3)** to analyze and "run" code without server-side risk. |
| **🎥 Multi-Stream Recording** | Robust capture of **webcam, audio, and screen sharing** for complete transparency. |
| **📊 Visual Analytics** | Performance metrics and post-interview feedback visualized with **Recharts**. |
| **🛡️ Secure Auth** | Industrial-standard **JWT** based authentication and hashed storage. |

---

## 💻 Tech Stack

### Frontend (Client)
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS 4 (Next-gen utility-first CSS)
- **Routing:** React Router v7
- **Editor:** @monaco-editor/react
- **Charts:** Recharts
- **Media:** React Webcam + MediaStream API

### Backend (Server)
- **Runtime:** Node.js + Express.js
- **Database:** MongoDB + Mongoose ODM
- **AI Integrations:** Google Generative AI (Gemini) & Groq (Llama 3.3)
- **Storage:** Multer (Local) & Cloudinary (Cloud Media Storage)
- **Auth:** JWT & BcryptJS

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18.x or higher)
- MongoDB (Atlas or Local)
- API Keys for Google Gemini (GenAI) and Groq.

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/yourusername/ai-interviewer.git
cd ai-interviewer

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 2. Environment Setup
Create a `.env` file in both directories:

**Backend (`/backend/.env`)**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_key
GROQ_API_KEY=your_groq_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend (`/frontend/.env`)**
```env
VITE_API_URL=http://localhost:5000
```

### 3. Run the Application
You need two terminals running:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

---

## 📸 Project Gallery

<div align="center">
  <img src="https://via.placeholder.com/800x400.png?text=Dashboard+Visuals" alt="Dashboard" width="800">
  <br />
  <i>The Analytics Dashboard: Insights at a glance</i>
</div>

<br />

<div align="center">
  <img src="https://via.placeholder.com/800x400.png?text=AI+Interview+Room" alt="Interview Room" width="800">
  <br />
  <i>The Live Interview Room: Code, Video, and AI Chat</i>
</div>

---

<p align="center">Made with ❤️ by <b>Amani</b></p>