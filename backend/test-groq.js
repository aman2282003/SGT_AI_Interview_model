require('dotenv').config();
const Groq = require('groq-sdk');

async function testGroq() {
  const key = process.env.GROQ_API_KEY;
  console.log("Testing Groq API Key: " + (key ? (key.substring(0, 7) + "...") : "UNDEFINED"));
  
  if (!key || key === 'your_groq_api_key_here') {
     console.error("❌ ERROR: GROQ_API_KEY is missing or using placeholder in backend/.env");
     return;
  }

  try {
    const groq = new Groq({ apiKey: key });
    console.log("Sending a test prompt to llama-3.3-70b-versatile...");
    
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'Say hello!' }],
    });
    
    console.log("✅ GROQ API KEY IS WORKING!");
    console.log("Response: " + completion.choices[0]?.message?.content);
  } catch (err) {
    console.error("\n❌ GROQ API KEY TEST FAILED!");
    console.error("Error from Groq: " + (err.message || err));
    if (err.status === 401) {
      console.error("-> '401 Unauthorized' means the API key is INVALID. Please check for typos or if the key has expired.");
    }
  }
}

testGroq();
