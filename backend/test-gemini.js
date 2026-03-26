require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function testApiKey() {
  const key = process.env.GEMINI_API_KEY;
  console.log("Testing Gemini API Key: " + (key ? (key.substring(0, 10) + "...") : "UNDEFINED"));
  
  if (!key || key === 'AIzaSyA5zPQ9YjXpFTnsFW3koEsL87QBlwyQnoE' || key === 'your_gemini_api_key_here') {
     console.log("⚠️ WARNING: It looks like you might still be using the default or an old invalid placeholder key.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: key });
    console.log("Sending a tiny test prompt to gemini-2.5-flash...");
    
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Reply with exactly one word: SUCCESS'
    });
    
    console.log("✅ API KEY IS WORKING PERFECTLY!");
    console.log("Gemini responded: " + result.text);
    console.log("\nAction Required: Since the key works, you just need to restart your backend server so it picks up the latest .env file. Go to the backend terminal, press Ctrl+C, and run 'npm run dev' again.");
  } catch (err) {
    console.error("\n❌ API KEY TEST FAILED!");
    console.error("The exact error message from Google is:\n");
    console.error(err.message || err);
    console.error("\nDiagnosing the issue:");
    if (err.status === 403 || (err.message && err.message.includes('403'))) {
      console.error("-> '403 Permission Denied' means the key itself is INVALID. Either it was copied wrong, the project was deleted in Google AI Studio, or it's restricted.");
    } else if (err.status === 400 || (err.message && err.message.includes('400'))) {
       console.error("-> '400 Bad Request' usually means the API key is malformed (e.g., missing characters or extra spaces at the end).");
    }
  }
}

testApiKey();
