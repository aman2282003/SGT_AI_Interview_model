const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const InterviewSession = require('../models/InterviewSession');
const { GoogleGenAI } = require('@google/genai');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.id}-${Date.now()}-${file.fieldname}.webm`);
  }
});
const upload = multer({ storage: storage });

// Submit interview transcript
router.post('/submit', auth, upload.fields([{ name: 'cameraVideo', maxCount: 1 }, { name: 'screenVideo', maxCount: 1 }]), async (req, res) => {
  try {
    const { techStack, transcript } = req.body;
    
    let cameraVideoUrl = null;
    let screenVideoUrl = null;
    
    if (req.files && req.files['cameraVideo']) {
      cameraVideoUrl = `/uploads/${req.files['cameraVideo'][0].filename}`;
    }
    if (req.files && req.files['screenVideo']) {
      screenVideoUrl = `/uploads/${req.files['screenVideo'][0].filename}`;
    }
    
    if (!techStack || !transcript) {
      return res.status(400).json({ message: 'Tech stack and transcript are required' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(500).json({ message: 'AI configuration is missing. Add GEMINI_API_KEY in backend/.env then restart the server.' });
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Call Gemini API
    const prompt = `You are a strict technical interviewer. The candidate took an interview for the following tech stack: ${techStack}. 
    They were asked multiple questions. Here is the transcript of the interview questions and their recorded answers:
    
    "${transcript}"
    
    Evaluate their combined answers. Consider technical accuracy, depth of knowledge, and communication. 
    Provide your response strictly in the following JSON format:
    {
      "marks": <a number out of 100 representing their overall score>,
      "feedback": "<detailed feedback on their overall performance, what they answered correctly, and what they got wrong across all questions>"
    }`;

    let evaluation;
    try {
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      // Extract JSON from response
      let responseText = result.text.trim();
      // Remove any markdown code block formatting if Gemini adds it
      if (responseText.startsWith('```json')) {
         responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      } else if (responseText.startsWith('```')) {
         responseText = responseText.replace(/```/g, '').trim();
      }
      evaluation = JSON.parse(responseText);
    } catch (aiErr) {
      console.error('Gemini API Error:', aiErr);
      return res.status(500).json({ message: 'Failed to evaluate interview via AI' });
    }

    const session = new InterviewSession({
      user: req.user.id,
      techStack,
      transcript,
      cameraVideoUrl,
      screenVideoUrl,
      aiMarks: evaluation.marks,
      aiFeedback: evaluation.feedback
    });
    
    await session.save();
    res.status(201).json(session);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get user interview history
router.get('/history', auth, async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get specific session
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await InterviewSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    if (session.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(session);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
