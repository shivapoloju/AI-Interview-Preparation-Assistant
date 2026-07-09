import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

const models = [
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-latest'
];

async function checkModel(model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  console.log(`Sending direct HTTP POST request to test model: "${model}"...`);
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 6000);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Say 'Hello' in one word." }] }]
      }),
      signal: controller.signal
    });
    
    clearTimeout(id);
    const data = await res.json();
    
    console.log(`   Response Status: ${res.status} ${res.statusText}`);
    if (res.ok) {
      console.log(`   ✅ SUCCESS: Response text:`, data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || JSON.stringify(data));
      return true;
    } else {
      console.log(`   ❌ FAILED: Error:`, data.error?.message || JSON.stringify(data));
      return false;
    }
  } catch (err) {
    clearTimeout(id);
    console.log(`   ❌ TIMEOUT/ERROR:`, err.message);
    return false;
  }
}

async function run() {
  for (const m of models) {
    const success = await checkModel(m);
    if (success) {
      console.log(`\n🎉 WE HAVE A WINNER: "${m}" is fully functional!`);
      break;
    }
    console.log("");
  }
}

run();
