<div align="center">
  <img src="https://img.shields.io/badge/AI-Interviewer-blue?style=for-the-badge&logo=openai" alt="AI Interviewer Logo">
  <h1>🚀 Advanced AI Interview Platform</h1>
  <p>A comprehensive, professional-grade assessment tool built with the MERN stack.</p>
</div>

---

## 📖 Table of Contents
- [🎯 Purpose](#-purpose)
- [✨ Key Features](#-key-features)
- [💻 Tech Stack](#-tech-stack)
- [🛠️ Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [📸 Screenshots](#-screenshots)

---

## 🎯 Purpose
The **Advanced AI Interview Platform** is designed to revolutionize the technical hiring process. It provides a seamless, robust environment for taking professional-grade coding assessments. By combining a live interactive coding environment, secure AI-driven test case evaluations, and comprehensive video/screen recording, this platform ensures a fair, thorough, and analytical interview experience.

It enables recruiters and candidates to engage in a simulated interview environment with an AI interviewer assessing technical skills, followed by deep post-interview analytics.

---

## ✨ Key Features
- **🤖 AI-Driven Interviews:** Intelligent, conversational AI that acts as a technical interviewer using the Gemini API.
- **💻 Interactive Code Editor:** Integrated Monaco Editor for a VS Code-like coding experience supporting multiple languages.
- **🎥 Video & Screen Recording:** Robust local video and screen-sharing recording functionality, allowing comprehensive review of the candidate's session.
- **📊 Analytics Dashboard:** Post-interview data visualization and detailed feedback using Recharts.
- **🛡️ Secure Authentication:** JWT-based user authentication and authorization.

---

## 💻 Tech Stack

### 🎨 Frontend (Client)
- **Framework:** [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Code Editor:** [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Charts:** [Recharts](https://recharts.org/)
- **Media/Camera:** [React Webcam](https://www.npmjs.com/package/react-webcam)
- **Icons:** [Lucide React](https://lucide.dev/)

### 🛠️ Backend (Server)
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication:** [JWT (JSON Web Tokens)](https://jwt.io/) & [BcryptJS](https://www.npmjs.com/package/bcryptjs)
- **File Uploads:** [Multer](https://www.npmjs.com/package/multer) (for storing video recordings)
- **AI Integration:** [Google GenAI / Gemini](https://www.npmjs.com/package/@google/genai)

---

## 🛠️ Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas URI)
- Git

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd ai-interviewer
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

### Environment Variables

You need to set up your environment variables for both the frontend and backend. 

#### Backend (`backend/.env`)
Create a `.env` file in the `backend` directory and add the following:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key
```

#### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend` directory for Vite environment variables:
```env
VITE_API_URL=http://localhost:5000
```

### Running the App

You will need two separate terminal windows to run the frontend and backend simultaneously.

**Terminal 1: Start the Backend Server**
```bash
cd backend
npm run dev
```
*(Runs on [http://localhost:5000](http://localhost:5000))*

**Terminal 2: Start the Frontend React App**
```bash
cd frontend
npm run dev
```
*(Runs on [http://localhost:5173](http://localhost:5173) or the port specified by Vite)*

---

## 📸 Screenshots

*(You can add your real project screenshots in this section by replacing the image links below)*

<div align="center">
  <img src="https://via.placeholder.com/800x400.png?text=Interview+Dashboard+Screenshot" alt="Dashboard" width="800"/>
  <br/>
  <i>Dashboard Overview showing Analytics</i>
</div>
<br/>
<div align="center">
  <img src="https://via.placeholder.com/800x400.png?text=Interactive+Code+Editor+and+Video" alt="Coding Room" width="800"/>
  <br/>
  <i>Live Interview Room with Code Editor and Video Recording</i>
</div>

---

<p align="center">Made with ❤️ for modern technical hiring.</p>