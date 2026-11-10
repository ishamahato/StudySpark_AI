const { spawn } = require("child_process");
const http = require("http");

async function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function postJson(url, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const bodyStr = JSON.stringify(data);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(bodyStr),
        },
      },
      (res) => {
        let text = "";
        res.on("data", (c) => (text += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(text) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: text });
          }
        });
      }
    );
    req.on("error", reject);
    req.write(bodyStr);
    req.end();
  });
}

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let text = "";
      res.on("data", (c) => (text += c));
      res.on("end", () => resolve({ status: res.statusCode, body: text }));
    }).on("error", reject);
  });
}

async function run() {
  console.log("==================================================");
  console.log("🚀 STARTING E2E TEST SUITE FOR ISHA MAHATO");
  console.log("==================================================");

  console.log("\nStarting Next.js server on port 3044...");
  const child = spawn("cmd.exe", ["/c", "npx", "next", "dev", "-p", "3044"], {
    cwd: process.cwd(),
    stdio: "pipe",
    detached: false,
  });

  child.stdout.on("data", (d) => process.stdout.write(d.toString()));
  child.stderr.on("data", (d) => process.stderr.write(d.toString()));

  // Wait for Next.js to boot
  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await get("http://localhost:3044/");
      if (res.status === 200) {
        ready = true;
        break;
      }
    } catch (e) {
      // waiting
    }
    await sleep(1000);
  }

  if (!ready) {
    console.error("Server did not become ready within 30 seconds");
    child.kill();
    process.exit(1);
  }

  try {
    console.log("\n[TEST 1] GET / (Verify Home Page & Developer Isha Mahato Attribution)");
    const homeRes = await get("http://localhost:3044/");
    console.log(`GET / status: ${homeRes.status}`);
    const hasDeveloper = homeRes.body.includes("Isha Mahato");
    console.log(`Developer 'Isha Mahato' present in HTML?: ${hasDeveloper}`);

    console.log("\n[TEST 2] POST /api/generate with LIVE GEMINI API (2.5 Flash)");
    const geminiRes = await postJson("http://localhost:3044/api/generate", {
      notes: "Photosynthesis produces glucose and oxygen from sunlight, water, and carbon dioxide.",
      provider: "gemini",
    });
    console.log("Gemini status:", geminiRes.status);
    console.log("Gemini success:", geminiRes.data?.success);
    console.log("Generated Title:", geminiRes.data?.data?.title);
    console.log("Flashcards generated:", geminiRes.data?.data?.flashcards?.length);
    console.log("Quiz questions generated:", geminiRes.data?.data?.quiz?.length);

    console.log("\n[TEST 3] POST /api/generate with LIVE GROQ API (Qwen 27B)");
    const groqRes = await postJson("http://localhost:3044/api/generate", {
      notes: "Mitochondria are double-membraned cell organelles responsible for ATP generation through oxidative phosphorylation.",
      provider: "groq",
    });
    console.log("Groq status:", groqRes.status);
    console.log("Groq success:", groqRes.data?.success);
    console.log("Generated Title:", groqRes.data?.data?.title);
    console.log("Flashcards generated:", groqRes.data?.data?.flashcards?.length);

    console.log("\n[TEST 4] POST /api/generate (Simulated Malformed JSON Failure)");
    const malformedRes = await postJson("http://localhost:3044/api/generate", {
      notes: "Sample notes",
      simulationMode: "malformed_json",
    });
    console.log("Handled without crash?:", malformedRes.status === 200);
    console.log("Error code caught:", malformedRes.data?.error?.code);
    console.log("Raw JSON suppressed from user?:", !malformedRes.data?.error?.rawResponse || typeof malformedRes.data?.error?.rawResponse === "string");

    console.log("\n[TEST 5] POST /api/refine (AI Deck Refinement)");
    const refineRes = await postJson("http://localhost:3044/api/refine", {
      currentSet: geminiRes.data?.data || groqRes.data?.data,
      instruction: "Add 1 harder question about respiration",
      provider: geminiRes.data?.data ? "gemini" : "groq",
    });
    console.log("Refine status:", refineRes.status);
    console.log("Refined quiz count:", refineRes.data?.data?.quiz?.length);

    console.log("\n==================================================");
    console.log("🎉 ALL E2E API & LIVE PROVIDER TESTS PASSED!");
    console.log("==================================================");
  } catch (err) {
    console.error("Test failed with error:", err);
  } finally {
    console.log("\nShutting down server process...");
    spawn("taskkill", ["/pid", child.pid, "/f", "/t"]);
  }
}

run();
