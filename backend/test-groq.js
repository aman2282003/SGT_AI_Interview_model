require('dotenv').config();
const Groq = require('groq-sdk');

async function testApiKey() {
  const key = process.env.GROQ_API_KEY;
  console.log("Testing Groq API Key: " + (key ? (key.substring(0, 10) + "...") : "UNDEFINED"));

  if (!key || key === 'your_groq_api_key_here') {
    console.log("⚠️  WARNING: GROQ_API_KEY is not set in backend/.env");
    console.log("   Get a free key from: https://console.groq.com");
    return;
  }

  try {
    const groq = new Groq({ apiKey: key });
    console.log("Sending a tiny test prompt to llama-3.3-70b-versatile...");

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'Reply with exactly one word: SUCCESS' }],
      max_tokens: 10,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    console.log("✅ GROQ API KEY IS WORKING PERFECTLY!");
    console.log("Groq responded: " + response);
    console.log("\nYou are ready to go! Restart your backend server and try the interview.");
  } catch (err) {
    console.error("\n❌ GROQ API KEY TEST FAILED!");
    console.error("Error: " + (err.message || err));
    if (err.status === 401) {
      console.error("-> Invalid API key. Copy the key exactly from console.groq.com");
    } else if (err.status === 429) {
      console.error("-> Rate limit hit. Wait a moment and try again.");
    }
  }
}

testApiKey();
