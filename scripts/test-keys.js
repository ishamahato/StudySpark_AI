const fs = require("fs");
const envContent = fs.readFileSync(".env.local", "utf8");
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    process.env[key] = value.trim();
  }
});

async function testGemini() {
  const key = process.env.GEMINI_API_KEY;
  console.log("Testing Gemini API Key (starts with " + key.slice(0, 8) + "...)...");
  // Try gemini-1.5-flash and gemini-2.5-flash / gemini-2.0-flash
  const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"];
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Respond ONLY with JSON: {\"status\": \"ok\", \"model\": \"" + model + "\"}" }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`✓ Gemini SUCCESS with model [${model}]:`, data.candidates[0].content.parts[0].text.trim());
        return model;
      } else {
        const err = await res.text();
        console.log(`✕ Gemini [${model}] status ${res.status}:`, err.slice(0, 150));
      }
    } catch (e) {
      console.log(`✕ Gemini [${model}] error:`, e.message);
    }
  }
}

async function testGroq() {
  const key = process.env.GROQ_API_KEY;
  console.log("\nTesting Groq API Key (starts with " + key.slice(0, 8) + "...)...");
  const models = ["llama-3.1-8b-instant", "llama3-8b-8192", "llama3-70b-8192", "mixtral-8x7b-32768", "gemma2-9b-it"];
  for (const model of models) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "Respond ONLY with JSON: {\"status\": \"ok\", \"model\": \"" + model + "\"}" }],
          response_format: { type: "json_object" },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`✓ Groq SUCCESS with model [${model}]:`, data.choices[0].message.content.trim());
        return model;
      } else {
        const err = await res.text();
        console.log(`✕ Groq [${model}] status ${res.status}:`, err.slice(0, 100));
      }
    } catch (e) {
      console.log(`✕ Groq [${model}] error:`, e.message);
    }
  }
}

async function listGroqModels() {
  const key = process.env.GROQ_API_KEY;
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
    const data = await res.json();
    console.log("Available Groq Models:", data.data?.map((m) => m.id));
  } catch (e) {
    console.log("Error listing Groq models:", e.message);
  }
}

async function testGroqQwen() {
  const key = process.env.GROQ_API_KEY;
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "qwen/qwen3.8-27b",
      messages: [{ role: "user", content: "Respond ONLY with JSON: {\"status\": \"ok\", \"model\": \"qwen\"}" }],
      response_format: { type: "json_object" },
    }),
  });
  if (res.ok) {
    const data = await res.json();
    console.log("✓ Groq Qwen SUCCESS:", data.choices[0].message.content.trim());
  } else {
    console.log("✕ Groq Qwen error:", await res.text());
  }
}

async function main() {
  await testGemini();
  await testGroqQwen();
}

main();
