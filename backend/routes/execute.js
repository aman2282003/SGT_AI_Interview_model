const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Groq = require('groq-sdk');

router.post('/run', auth, async (req, res) => {
  try {
    const { language, code, testCases } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Code is required for execution' });
    }

    const key = process.env.GROQ_API_KEY;
    if (!key || key === 'your_groq_api_key_here') {
      return res.status(500).json({ message: 'AI configuration missing (GROQ_API_KEY)' });
    }

    const groq = new Groq({ apiKey: key });

    // Using Groq Llama 3 to simulate code execution safely
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

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1, // Low temperature for deterministic output
      max_tokens: 1024,
    });

    let responseText = completion.choices[0]?.message?.content?.trim() || '';
    
    // Clean up response to ensure valid JSON
    responseText = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) responseText = jsonMatch[0];

    const executionResult = JSON.parse(responseText);
    res.json(executionResult);

  } catch (err) {
    console.error('Code Execution Failed (Groq):', err);
    res.status(500).json({ output: 'Execution Engine Error / Timeout', passed: false });
  }
});

module.exports = router;
