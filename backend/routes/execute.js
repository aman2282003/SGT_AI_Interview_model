const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { GoogleGenAI } = require('@google/genai');

router.post('/run', auth, async (req, res) => {
  try {
    const { language, code, testCases } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Code is required for execution' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(500).json({ message: 'AI configuration missing' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Using Gemini to explicitly simulate code execution safely, including React DOM resolution.
    const prompt = `You are a strict, purely deterministic Code Execution Engine. 
    The user has submitted code in the language: ${language}.
    
    Code:
    ---
    ${code}
    ---
    
    Run the following test cases against their code:
    ${testCases || 'None provided. Just analyze for syntax and execution success.'}
    
    Requirements:
    1. If the language is React, analyze the component structure and what it would render.
    2. If there are syntax errors, specify them.
    3. Output the exact stdout, test case results, and overall pass status.
    
    Provide your response STRICTLY in the following JSON format:
    {
      "output": "<Simulated stdout or compiler errors>",
      "passed": <boolean, true if all tests pass or no syntax errors>
    }`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    let responseText = result.text.trim();
    if (responseText.startsWith('```json')) {
       responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    } else if (responseText.startsWith('```')) {
       responseText = responseText.replace(/```/g, '').trim();
    }

    const executionResult = JSON.parse(responseText);
    res.json(executionResult);

  } catch (err) {
    console.error('Code Execution Failed:', err);
    res.status(500).json({ output: 'Execution Engine Error / Timeout', passed: false });
  }
});

module.exports = router;
