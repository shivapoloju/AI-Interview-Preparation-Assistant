import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("ERROR: GEMINI_API_KEY is not defined in backend/.env!");
  process.exit(1);
}

console.log("Using API Key beginning with:", apiKey.substring(0, 12) + "...\n");

const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTest = [
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-flash-latest'
];

async function testModel(modelName) {
  console.log(`Testing model: "${modelName}"...`);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: "Say 'Hello' in one word." }] }]
    });
    console.log(`✅ Success with "${modelName}":`, result.response.text().trim());
    return true;
  } catch (error) {
    console.log(`❌ Failed with "${modelName}":`);
    console.error(`   Message: ${error.message}`);
    if (error.status) console.error(`   Status: ${error.status}`);
    return false;
  }
}

async function runTests() {
  for (const m of modelsToTest) {
    const ok = await testModel(m);
    if (ok) {
      console.log(`\n🎉 Found working model: "${m}"! We should configure this in our server.`);
      break;
    }
    console.log("");
  }
}

runTests();
