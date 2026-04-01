require('dotenv').config();
const cloudinary = require('cloudinary').v2;

async function testCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  console.log("Testing Cloudinary Config: " + (cloudName ? (cloudName.substring(0, 5) + "...") : "UNDEFINED"));
  
  if (!cloudName || !apiKey || !apiSecret) {
     console.error("❌ ERROR: Cloudinary configuration is missing in backend/.env");
     return;
  }

  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });

    console.log("Sending a ping to Cloudinary API...");
    const result = await cloudinary.api.ping();
    
    console.log("✅ CLOUDINARY API IS WORKING!");
  } catch (err) {
    console.error("\n❌ CLOUDINARY API TEST FAILED!");
    console.error("The exact error from Cloudinary is:\n");
    console.error(err.message || err);
  }
}

testCloudinary();
