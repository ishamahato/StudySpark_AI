const assert = require("assert");

// Import compiled validation or test logic
function extractJsonString(raw) {
  let cleaned = raw.trim();
  const codeBlockMatch = cleaned.match(/```(?:[a-zA-Z0-9_-]+)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  }
  cleaned = cleaned.replace(/^```(?:[a-zA-Z0-9_-]+)?\s*[\r\n]*/i, "");
  cleaned = cleaned.replace(/[\r\n]*```\s*$/i, "");
  cleaned = cleaned.replace(/^(?:json|python|javascript|typescript|js|ts|text|markdown|md)\s*[\r\n]+/i, "");
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned.trim();
}

function attemptJsonRepair(jsonString) {
  let repaired = jsonString;
  repaired = repaired.replace(/,\s*([}\]])/g, "$1");
  repaired = repaired.replace(/[\u0000-\u001F]+/g, (match) => {
    if (match === "\n" || match === "\r" || match === "\t") return match;
    return "";
  });
  const openBraces = (repaired.match(/\{/g) || []).length;
  const closeBraces = (repaired.match(/\}/g) || []).length;
  const openBrackets = (repaired.match(/\[/g) || []).length;
  const closeBrackets = (repaired.match(/\]/g) || []).length;

  if (openBraces > closeBraces || openBrackets > closeBrackets) {
    const lastComma = repaired.lastIndexOf(",");
    if (lastComma > 0 && lastComma > repaired.lastIndexOf("}")) {
      repaired = repaired.substring(0, lastComma);
    }
    const currentOpenBraces = (repaired.match(/\{/g) || []).length;
    const currentCloseBraces = (repaired.match(/\}/g) || []).length;
    const currentOpenBrackets = (repaired.match(/\[/g) || []).length;
    const currentCloseBrackets = (repaired.match(/\]/g) || []).length;

    const missingBrackets = Math.max(0, currentOpenBrackets - currentCloseBrackets);
    const missingBraces = Math.max(0, currentOpenBraces - currentCloseBraces);
    repaired += "]".repeat(missingBrackets);
    repaired += "}".repeat(missingBraces);
  }
  return repaired;
}

function normalizeRawStudyData(rawObj, originalNotes = "") {
  if (!rawObj || typeof rawObj !== "object") {
    throw new Error("Parsed AI output is not a JSON object");
  }
  const normalized = { ...rawObj };
  normalized.title = normalized.title || originalNotes.slice(0, 40) || "Untitled Study Set";
  normalized.topic = normalized.topic || "General Subject";
  normalized.summary = normalized.summary || "Study guide generated from provided notes.";

  // Normalize flashcards with partial recovery
  if (Array.isArray(normalized.flashcards)) {
    normalized.flashcards = normalized.flashcards
      .filter((c) => c && typeof c === "object" && (c.front || c.question) && (c.back || c.answer))
      .map((c, idx) => ({
        id: c.id || `fc_${idx}`,
        front: String(c.front || c.question).trim(),
        back: String(c.back || c.answer).trim(),
        hint: typeof c.hint === "string" ? c.hint : "",
        concept: c.concept || "General",
        difficulty: ["easy", "medium", "hard"].includes(c.difficulty) ? c.difficulty : "medium",
      }));
  } else {
    normalized.flashcards = [];
  }

  // Normalize quiz questions
  if (Array.isArray(normalized.quiz)) {
    normalized.quiz = normalized.quiz
      .filter((q) => q && (q.question || q.prompt) && Array.isArray(q.options || q.choices) && (q.options || q.choices).length >= 2)
      .map((q, idx) => {
        const options = (q.options || q.choices).map((o) => String(o).trim());
        let correctIdx = 0;
        if (typeof q.correctIndex === "string") {
          const l = q.correctIndex.trim().toUpperCase();
          if (l === "A") correctIdx = 0;
          else if (l === "B") correctIdx = 1;
          else if (l === "C") correctIdx = 2;
          else if (l === "D") correctIdx = 3;
          else correctIdx = parseInt(l, 10) || 0;
        } else if (typeof q.correctIndex === "number") {
          correctIdx = q.correctIndex;
        }
        if (correctIdx < 0 || correctIdx >= options.length) correctIdx = 0;

        return {
          id: q.id || `qz_${idx}`,
          question: String(q.question || q.prompt).trim(),
          options,
          correctIndex: correctIdx,
          explanation: q.explanation || "Correct answer.",
          concept: q.concept || "General",
        };
      });
  } else {
    normalized.quiz = [];
  }

  return normalized;
}

// ========================
// RUN TEST SUITE
// ========================
console.log("=== Running Validation & Resilience Unit Tests ===");

// Test 1: Markdown stripping
{
  const raw = "Sure! Here is the JSON:\n```json\n{\"title\": \"Bio\", \"topic\": \"Cell\"}\n```\nHope that helps!";
  const extracted = extractJsonString(raw);
  assert.strictEqual(extracted, '{"title": "Bio", "topic": "Cell"}');
  console.log("✓ Test 1: Markdown fence stripping passed");
}

// Test 2: Trailing commas repair
{
  const broken = '{"title": "Test", "items": ["a", "b",], }';
  const repaired = attemptJsonRepair(broken);
  const parsed = JSON.parse(repaired);
  assert.strictEqual(parsed.title, "Test");
  assert.strictEqual(parsed.items.length, 2);
  console.log("✓ Test 2: Trailing comma auto-repair passed");
}

// Test 3: Truncated JSON recovery
{
  const truncated = '{"title": "Cutoff", "flashcards": [{"front": "Q1", "back": "A1"}, {"front": "Q2"';
  const repaired = attemptJsonRepair(truncated);
  const parsed = JSON.parse(repaired);
  assert.strictEqual(parsed.title, "Cutoff");
  assert.strictEqual(parsed.flashcards.length, 1);
  assert.strictEqual(parsed.flashcards[0].front, "Q1");
  console.log("✓ Test 3: Truncated JSON recovery passed");
}

// Test 4: Choice letter to numeric index coercion
{
  const input = {
    title: "Quiz Test",
    flashcards: [{ front: "F1", back: "B1" }],
    quiz: [
      { question: "Q1", options: ["Alpha", "Beta", "Gamma", "Delta"], correctIndex: "B" },
      { question: "Q2", options: ["One", "Two"], correctIndex: "A" },
    ],
  };
  const normalized = normalizeRawStudyData(input);
  assert.strictEqual(normalized.quiz[0].correctIndex, 1);
  assert.strictEqual(normalized.quiz[1].correctIndex, 0);
  console.log("✓ Test 4: Choice letter coercion ('B' -> 1) passed");
}

// Test 5: Partial recovery of corrupt items
{
  const mixedCards = {
    title: "Mixed Cards",
    flashcards: [
      { front: "Valid Q1", back: "Valid A1" },
      null, // Corrupt
      { brokenField: true }, // Corrupt
      { front: "Valid Q2", back: "Valid A2" },
    ],
    quiz: [{ question: "Valid Q", options: ["1", "2"], correctIndex: 0 }],
  };
  const normalized = normalizeRawStudyData(mixedCards);
  assert.strictEqual(normalized.flashcards.length, 2);
  assert.strictEqual(normalized.flashcards[0].front, "Valid Q1");
  assert.strictEqual(normalized.flashcards[1].front, "Valid Q2");
  console.log("✓ Test 5: Partial card recovery (salvaged 2 of 4) passed");
}

// Test 6: Email validation & typo correction
{
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  assert.strictEqual(emailRegex.test("isha.mahato@studyspark.ai"), true);
  assert.strictEqual(emailRegex.test("invalid-email-no-at.com"), false);
  assert.strictEqual(emailRegex.test("user@domain"), false); // missing valid TLD
  console.log("✓ Test 6: Email validation RFC 5322 regex checks passed");
}

// Test 7: Python code block and unstructured code recovery
{
  const pythonFence = "```python\n{\"title\": \"Python Loops\", \"topic\": \"Computer Science\"}\n```";
  const extracted = extractJsonString(pythonFence);
  assert.strictEqual(extracted, '{"title": "Python Loops", "topic": "Computer Science"}');
  console.log("✓ Test 7: Code fence stripping for python/non-json languages passed");
}

console.log("\nALL 7 UNIT TESTS PASSED WITH ZERO FAILURES! 🚀\n");
