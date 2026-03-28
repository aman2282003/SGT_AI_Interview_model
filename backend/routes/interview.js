const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const InterviewSession = require('../models/InterviewSession');
const User = require('../models/User');
const Groq = require('groq-sdk');
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

// Helper to get a Groq client (validates key first)
function getGroqClient() {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === 'your_groq_api_key_here') {
    return null;
  }
  return new Groq({ apiKey: key });
}

// Submit interview transcript
router.post('/submit', auth, upload.fields([{ name: 'cameraVideo', maxCount: 1 }, { name: 'screenVideo', maxCount: 1 }]), async (req, res) => {
  try {
    const { techStack, transcript } = req.body;

    let cameraVideoUrl = null;
    let screenVideoUrl = null;

    console.log("Files received:", req.files);
    console.log("Body received:", req.body);

    if (req.files && req.files['cameraVideo'] && req.files['cameraVideo'][0].filename) {
      cameraVideoUrl = `/uploads/${req.files['cameraVideo'][0].filename}`;
      console.log("Camera video URL set:", cameraVideoUrl);
    }
    if (req.files && req.files['screenVideo'] && req.files['screenVideo'][0].filename) {
      screenVideoUrl = `/uploads/${req.files['screenVideo'][0].filename}`;
      console.log("Screen video URL set:", screenVideoUrl);
    }

    if (!techStack || !transcript) {
      return res.status(400).json({ message: 'Tech stack and transcript are required' });
    }

    console.log("==== INCOMING INTERVIEW SUBMISSION (ASYNC AI) ====");
    
    // 1. Create and Save the session immediately (without AI marks yet)
    const session = new InterviewSession({
      user: req.user.id,
      techStack,
      transcript,
      cameraVideoUrl,
      screenVideoUrl,
      aiMarks: null, // Still evaluating
      aiFeedback: "AI is currently evaluating your interview answers. Please wait a moment..."
    });

    await session.save();

    // 2. Respond to the client immediately to prevent timeout
    res.status(201).json(session);

    // 3. Perform AI evaluation in the background
    const groq = getGroqClient();
    if (!groq) {
      console.error("AI configuration missing for background evaluation.");
      return; 
    }

    (async () => {
      try {
        console.log(`Starting background AI evaluation for session: ${session._id}`);
        const prompt = `You are a professional technical interviewer. The candidate took an interview for the following tech stack: ${techStack}.
They were asked multiple questions. Here is the transcript of the interview questions and their recorded answers:

"${transcript}"

Evaluate their combined answers. Be encouraging but fair with the scoring. 
- If the candidate provided absolutely zero meaningful content, or if most answers are "No answer provided.", you MUST give 0 marks.
- For basic or beginner attempts, you can be friendly and give some marks, but ensure the score reflects their actual knowledge.
- Within your feedback, you MUST include a specific section called "Suggestions for Improvement" telling them exactly what they can do better next time.
You MUST respond with ONLY valid JSON. No extra text, no markdown, no code blocks. Just the raw JSON object:
{"marks": <integer 0-100>, "feedback": "<detailed friendly feedback, including Suggestions for Improvement at the end>"}`;

        const completion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.4,
          max_tokens: 1024,
        });

        let responseText = completion.choices[0]?.message?.content?.trim() || '';
        responseText = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) responseText = jsonMatch[0];

        const evaluation = JSON.parse(responseText);

        await InterviewSession.findByIdAndUpdate(session._id, {
          aiMarks: evaluation.marks,
          aiFeedback: evaluation.feedback
        });
        console.log(`Background AI evaluation complete for session: ${session._id}`);
      } catch (aiErr) {
        console.error(`Background AI error for session ${session._id}:`, aiErr.message);
        await InterviewSession.findByIdAndUpdate(session._id, {
          aiFeedback: "Evaluation failed: " + (aiErr.message || "Unknown error")
        });
      }
    })();

  } catch (err) {
    console.error("Submission Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// Transcribe audio fallback (Groq Whisper)
router.post('/transcribe', auth, upload.single('audio'), async (req, res) => {
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

    const prompt = `You are an expert interviewer. The candidate has chosen the following custom topic for their interview: "${topic}".
Generate exactly 5 interview questions related to this topic.
You MUST respond with ONLY a valid JSON array of strings. No extra text, no markdown, no code blocks:
["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]`;

    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 512,
      });

      let responseText = completion.choices[0]?.message?.content?.trim() || '';

      // Strip markdown code fences
      responseText = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

      // Extract JSON array if there is surrounding text
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        responseText = jsonMatch[0];
      }

      const parsedQuestions = JSON.parse(responseText);

      // Format to match the expected frontend structure
      const formattedQuestions = parsedQuestions.map(q => ({
        type: 'text',
        prompt: q
      }));

      res.json({ questions: formattedQuestions });

    } catch (aiErr) {
      console.error('Groq API Error in generating questions:', aiErr.message || aiErr);
      return res.status(500).json({ message: 'Failed to generate questions via AI. Error: ' + (aiErr.message || 'Unknown') });
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
