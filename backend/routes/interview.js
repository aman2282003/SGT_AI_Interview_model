const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const InterviewSession = require('../models/InterviewSession');
const User = require('../models/User');
const Groq = require('groq-sdk');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cloudinary Storage for Videos
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ai-interviewer-recordings',
    resource_type: 'video',
    format: async (req, file) => 'webm', // Keep webm format
    public_id: (req, file) => `${req.user.id}-${Date.now()}-${file.fieldname}`
  },
});
const upload = multer({ storage: storage });

// Local Storage for temporary audio transcription
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `temp-${Date.now()}-${file.originalname}`);
  }
});
const localUpload = multer({ storage: localStorage });

// Helper to get a Groq client (validates key first)
function getGroqClient() {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === 'your_groq_api_key_here') {
    return null;
  }
  return new Groq({ apiKey: key });
}

// Submit interview transcript
router.post('/submit', auth, localUpload.fields([{ name: 'cameraVideo', maxCount: 1 }, { name: 'screenVideo', maxCount: 1 }]), async (req, res) => {
  try {
    const { techStack, transcript } = req.body;

    // Use local file paths temporarily - we will replace these with Cloudinary URLs in the background
    let cameraVideoUrl = null;
    let screenVideoUrl = null;

    if (!techStack || !transcript) {
      // Cleanup local files if request is invalid
      if (req.files) {
        Object.values(req.files).forEach(fileArr => {
          fileArr.forEach(f => { if (fs.existsSync(f.path)) fs.unlinkSync(f.path); });
        });
      }
      return res.status(400).json({ message: 'Tech stack and transcript are required' });
    }

    console.log("==== INCOMING INTERVIEW SUBMISSION (OPTIMIZED) ====");
    
    // 1. Create and Save the session immediately
    const session = new InterviewSession({
      user: req.user.id,
      techStack,
      transcript,
      cameraVideoUrl: null, // Will be updated in background
      screenVideoUrl: null, // Will be updated in background
      aiMarks: null, 
      aiFeedback: "AI is currently evaluating your interview answers and processing your recordings. Please wait a moment..."
    });

    await session.save();

    // 2. Respond to the client immediately (VERY FAST now because files are only moved to local disk)
    res.status(201).json(session);

    // 3. Perform Cloudinary upload and AI evaluation in the background (PARALLELIZED)
    const groq = getGroqClient();
    
    // Track A: AI Evaluation (Fast)
    (async () => {
      try {
        if (!groq) {
          console.error("[AI] Configuration missing.");
          await InterviewSession.findByIdAndUpdate(session._id, { aiFeedback: "AI configuration missing." });
          return; 
        }

        console.log(`[AI] Starting fast-track evaluation for session: ${session._id}`);
        const prompt = `You are an expert technical interviewer. Evaluate the candidate for the ${techStack} role.
Transcript:
"${transcript}"

Requirements:
- Score 0-100. Constructive feedback.
- MUST respond with raw JSON: {"marks": 85, "feedback": "..."}
- No markdown. Escape special characters.`;

        const completion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 1500,
        });

        let responseText = completion.choices[0]?.message?.content?.trim() || '';
        let evaluation = { marks: 0, feedback: "Evaluation processing failed." };

        try {
          let cleanedResponse = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
          const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) cleanedResponse = jsonMatch[0];
          evaluation = JSON.parse(cleanedResponse);
        } catch (e) {
          // Fallback manual extraction
          const marksMatch = responseText.match(/"marks":\s*(\d+)/);
          const feedbackMatch = responseText.match(/"feedback":\s*"([\s\S]*?)"(?=\s*}|\s*,)/);
          if (marksMatch) evaluation.marks = parseInt(marksMatch[1]);
          if (feedbackMatch) evaluation.feedback = feedbackMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
        }

        await InterviewSession.findByIdAndUpdate(session._id, {
          aiMarks: evaluation.marks,
          aiFeedback: evaluation.feedback
        });
        console.log(`[AI] SUCCESS: Score updated for session ${session._id}`);
      } catch (err) {
        console.error(`[AI] ERROR for session ${session._id}:`, err.message);
        await InterviewSession.findByIdAndUpdate(session._id, { aiFeedback: `AI Evaluation failed: ${err.message}` });
      }
    })();

    // Track B: Cloudinary Uploads (Slow)
    (async () => {
      try {
        let finalCameraUrl = null;
        let finalScreenUrl = null;

        if (req.files && req.files['cameraVideo']) {
          const file = req.files['cameraVideo'][0];
          console.log(`[UPLOAD] Camera video starting for session ${session._id}...`);
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'ai-interviewer-recordings',
            resource_type: 'video',
          });
          finalCameraUrl = result.secure_url;
        }

        if (req.files && req.files['screenVideo']) {
          const file = req.files['screenVideo'][0];
          console.log(`[UPLOAD] Screen video starting for session ${session._id}...`);
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'ai-interviewer-recordings',
            resource_type: 'video',
          });
          finalScreenUrl = result.secure_url;
        }

        await InterviewSession.findByIdAndUpdate(session._id, {
          cameraVideoUrl: finalCameraUrl,
          screenVideoUrl: finalScreenUrl
        });
        console.log(`[UPLOAD] SUCCESS: Videos linked for session ${session._id}`);
      } catch (err) {
        console.error(`[UPLOAD] ERROR for session ${session._id}:`, err.message);
      } finally {
        // Cleanup ALL local files after upload track finishes (success or fail)
        try {
          if (req.files) {
            Object.values(req.files).forEach(fileArr => {
              fileArr.forEach(f => { if (f.path && fs.existsSync(f.path)) fs.unlinkSync(f.path); });
            });
            console.log(`[CLEANUP] Temp files cleared for session ${session._id}`);
          }
        } catch (e) {
          console.error(`[CLEANUP] Error:`, e.message);
        }
      }
    })();

  } catch (err) {
    console.error("Submission Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// Transcribe audio fallback (Groq Whisper)
router.post('/transcribe', auth, localUpload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file provided' });
    }
    
    const groq = getGroqClient();
    if (!groq) {
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ message: 'AI configuration is missing.' });
    }

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: "whisper-large-v3",
      response_format: "json",
      language: "en"
    });

    fs.unlinkSync(req.file.path);
    res.json({ text: transcription.text });
  } catch (err) {
    console.error("Transcription failed:", err.message);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Failed to transcribe audio' });
  }
});

// Get all sessions (Admin only)
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Basic admin check (requires isAdmin field in User model)
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const sessions = await InterviewSession.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(sessions);
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

// Generate dynamic questions for custom topics
router.post('/generate-questions', auth, async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    const groq = getGroqClient();
    if (!groq) {
      return res.status(500).json({ message: 'AI configuration is missing. Add your GROQ_API_KEY in backend/.env and restart the server.' });
    }

    // [STRENGTHENED PROMPT]
    const prompt = `You are a professional technical interviewer. The candidate has chosen the following custom topic for their interview practice: "${topic}".
Generate exactly 5 focused interview questions related to this topic.
You MUST respond with a valid JSON array of 5 strings.
Example: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]
DO NOT include any markdown code blocks, prefixes, or suffixes. Just the raw JSON.`;

    // [FAIL-SAFE DEFAULT QUESTIONS]
    const failSafeQuestions = [
      `What are the most fundamental concepts one must master in ${topic}?`,
      `Could you explain a real-world scenario where ${topic} is critical to success?`,
      `What are the most common mistakes beginners make when working with ${topic}?`,
      `In terms of performance and scalability, what are the best practices for ${topic}?`,
      `How do you stay current with the rapidly evolving ecosystem of ${topic}?`
    ];

    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 1024,
      });

      let responseText = completion.choices[0]?.message?.content?.trim() || '';
      console.log("Raw AI Response for Questions:", responseText);

      // [ROBUST EXTRACTION]
      let questionsRaw = [];
      try {
        const startIndex = responseText.indexOf('[');
        const endIndex = responseText.lastIndexOf(']');
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            const jsonSubstring = responseText.slice(startIndex, endIndex + 1);
            questionsRaw = JSON.parse(jsonSubstring);
        } else {
            const cleaned = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
            questionsRaw = JSON.parse(cleaned);
        }
      } catch (parseError) {
          console.warn("AI Question Parsing Failed. Using fail-safe.", parseError.message);
          questionsRaw = failSafeQuestions;
      }

      const formattedQuestions = (Array.isArray(questionsRaw) ? questionsRaw : failSafeQuestions).slice(0, 5).map(q => ({
        type: 'text',
        prompt: typeof q === 'string' ? q : JSON.stringify(q)
      }));

      res.json({ questions: formattedQuestions });

    } catch (aiErr) {
      console.error('Groq API Error, falling back to fail-safe:', aiErr.message || aiErr);
      // Even if the API call fails COMPLETELY, we send back-up questions to avoid a frontend crash
      const formattedQuestions = failSafeQuestions.map(q => ({ type: 'text', prompt: q }));
      res.json({ questions: formattedQuestions, note: "AI Service temporarily unavailable, using fallback questions." });
    }

  } catch (err) {
    console.error("Server Error in Question Gen:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
