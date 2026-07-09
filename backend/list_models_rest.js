// Use global native fetch support in Node 22
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function run() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  console.log("Fetching available models via REST API...");
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (res.ok) {
      console.log("\n✅ SUCCESS! Models available to your key:\n");
      if (data.models && data.models.length > 0) {
        data.models.forEach(m => {
          console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
          console.log(`  Supported Actions: ${m.supportedGenerationMethods.join(', ')}`);
          console.log("");
        });
      } else {
        console.log("No models returned in response.");
      }
    } else {
      console.log("\n❌ FAILED:");
      console.error(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Error making REST request:", error);
  }
}

run();
