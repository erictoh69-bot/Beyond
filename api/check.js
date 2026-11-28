/* BEYOND AI Check (pilot): grade a student's handwritten answer from a photo.
   POST /api/check with JSON { set, q, image, mime }.
   - set "physics-sq": q is 1..10, one short Physics question, graded 0 / 0.5 / 1.
   - set "bangla-cq": the আম-আঁটির ভেঁপু creative question, parts ক/খ/গ/ঘ graded 1/2/3/4.
   The answer keys live ONLY here, on the server. They are never sent to the
   browser. The Gemini key comes from the GEMINI_API_KEY environment variable
   (set in the Vercel dashboard). Never put a key in this file or the repo.
   Vercel Hobby functions stop at 10 seconds, so the prompt is kept tight and
   the model is the fast flash preview. */

const MODEL = "gemini-3-flash-preview";
const API = "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent";

const PHYSICS_SQ = [
  { q: "What is electric induction?", a: "The process of charging an uncharged body by bringing a charged body near it, without touching it, merely by its presence, is electric induction." },
  { q: "What is meant by electric potential?", a: "The amount of work done in bringing a unit positive charge from infinity to a point in an electric field is called the electric potential of that point." },
  { q: "What is meant by potential difference?", a: "The amount of work done in bringing a unit positive charge from one point to another point in an electric field is called the potential difference of that point." },
  { q: "What is meant by a capacitor?", a: "The mechanical technique of storing energy in the form of electric charge by placing an insulating material in the space between two conductors placed close to each other is an electric capacitor." },
  { q: "What is meant by electric intensity?", a: "The force experienced by a unit positive charge placed at a point in an electric field is called the electric intensity of that point." },
  { q: "What is meant by electric field lines?", a: "When a free positive charge is placed in an electric field, the path along which it moves is called an electric field line." },
  { q: "What is meant by electric field?", a: "The region around a charged body over which the influence of electricity extends is called the electric field of that body." },
  { q: "What is meant by measurement?", a: "Determining the measurement of anything measurable is measurement." },
  { q: "What is meant by fundamental quantity?", a: "Those quantities which are independent, that is, do not depend on other quantities, but other quantities depend on them, are called fundamental quantities." },
  { q: "What is meant by the unit of measurement?", a: "The definite quantity with which all physical quantities are measured by comparison is called the unit of measurement." },
];

/* Bangla CQ 1, from the story আম-আঁটির ভেঁপু. Part ঘ compares the story with
   the উদ্দীপক (Rifat and Tania); the উদ্দীপক text is not stored here, so the
   prompt judges that part only on the story side and says so. */
const BANGLA_CQ = {
  title: "আম-আঁটির ভেঁপু — সৃজনশীল ১নং প্রশ্ন",
  parts: [
    { part: "ক", outOf: 1, q: "দুর্গার বয়স কত?", a: "দুর্গার বয়স দশ-এগারো বছর।" },
    { part: "খ", outOf: 2, q: "‘হাবা একটা কোথাকার – যদি একটু বুদ্ধি থাকে!’ — উক্তিটি কে কাকে, কেন বলেছিল?", a: "কথাটি দুর্গা তার ভাই অপুকে বলেছিল। কারণ তাদের মা সর্বজয়া দুপুরবেলা লুকিয়ে আমের কুচি খাওয়ার ঘটনাটি বুঝে ফেলেছিল।" },
    { part: "গ", outOf: 3, q: "দুর্গা ও অপুর আমের কুচি খাওয়ার ঘটনাটি ব্যাখ্যা করো।", a: "দুর্গা ও অপু মা-বাবার অনুপস্থিতিতে দুপুরে আমের কুচি খায়। বিষয়টি যেন মা না জানে, সেজন্য দুর্গা অপুকে সতর্ক করে। তবু অপু মায়ের কাছে ধরা পড়ে যায়, তখন দুর্গা অপুকে উক্ত কথাটি বলে।" },
    { part: "ঘ", outOf: 4, q: "উদ্দীপকের রিফাত ও তানিয়ার জীবনযাপনের সাথে অপু ও দুর্গার জীবনযাপনের সাদৃশ্য বিশ্লেষণ করো।", a: "অপু ও দুর্গার জীবনযাপনে শৈশবের আনন্দ ও প্রকৃতির সাথে ঘনিষ্ঠতা আছে; উদ্দীপকের চরিত্রদের জীবনযাপনের সাথে এই দিক থেকে মিল রয়েছে।" },
  ],
};

function json(res, status, obj) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(obj));
}

async function callGemini(key, prompt, image, mime) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 9000);
  try {
    const r = await fetch(API + "?key=" + encodeURIComponent(key), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: mime, data: image } }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
      signal: ctrl.signal,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = (data.error && data.error.message) || ("Gemini error " + r.status);
      const err = new Error(msg);
      err.status = r.status;
      throw err;
    }
    const text = data.candidates && data.candidates[0] && data.candidates[0].content
      && data.candidates[0].content.parts && data.candidates[0].content.parts[0]
      ? data.candidates[0].content.parts[0].text : "";
    return JSON.parse(text);
  } finally {
    clearTimeout(timer);
  }
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return json(res, 405, { error: "method" });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return json(res, 503, { error: "not_configured" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  const image = typeof body.image === "string" ? body.image.replace(/^data:image\/\w+;base64,/, "") : "";
  const mime = body.mime === "image/png" ? "image/png" : "image/jpeg";
  if (!image || image.length > 4 * 1024 * 1024) return json(res, 400, { error: "bad_image" });

  try {
    if (body.set === "bangla-cq") {
      const keyText = BANGLA_CQ.parts.map((p) => p.part + " (" + p.outOf + " নম্বর) " + p.q + " উত্তর: " + p.a).join("\n");
      const prompt = "তুমি SSC বাংলা ১ম পত্রের একজন পরীক্ষক। গল্প: আম-আঁটির ভেঁপু। নিচের উত্তরমালা (answer key) অনুযায়ী ছবির হাতের লেখা উত্তরটি যাচাই করো। হাতের লেখা পড়তে না পারলে অনুমান কোরো না, feedback-এ লেখো। (ঘ) অংশের উদ্দীপক তোমার কাছে নেই, তাই শুধু গল্পের দিক থেকে বিচার করো। শুধু JSON দাও: {\"parts\": [{\"part\": \"ক\", \"marks\": 1, \"out_of\": 1, \"feedback\": \"...\"}, {\"part\": \"খ\", \"marks\": 2, \"out_of\": 2, \"feedback\": \"...\"}, {\"part\": \"গ\", \"marks\": 3, \"out_of\": 3, \"feedback\": \"...\"}, {\"part\": \"ঘ\", \"marks\": 4, \"out_of\": 4, \"feedback\": \"...\"}]}। ফিডব্যাক বাংলায় এক বাক্যে। ছোটখাটো বানান ভুলে নম্বর কাটবে না।\nউত্তরমালা:\n" + keyText;
      const out = await callGemini(key, prompt, image, mime);
      return json(res, 200, { set: "bangla-cq", title: BANGLA_CQ.title, parts: out.parts || [] });
    }
    const n = parseInt(body.q, 10);
    if (body.set !== "physics-sq" || !n || n < 1 || n > PHYSICS_SQ.length) return json(res, 400, { error: "bad_question" });
    const item = PHYSICS_SQ[n - 1];
    const prompt = "You check a student's short answer (SQ) for an SSC exam in Bangladesh.\nQuestion: " + item.q + "\nCorrect answer (answer key): " + item.a + "\nThe photo shows the student's handwritten answer. Read the handwriting carefully. If any word is unreadable, say so in the feedback instead of guessing. Compare with the answer key only. Reply with JSON only: {\"verdict\": \"correct\" or \"partial\" or \"wrong\", \"marks\": 1 or 0.5 or 0, \"feedback\": \"one short sentence in simple English\"}.";
    const out = await callGemini(key, prompt, image, mime);
    return json(res, 200, { set: "physics-sq", question: item.q, verdict: out.verdict || "partial", marks: out.marks == null ? 0 : out.marks, feedback: out.feedback || "" });
  } catch (err) {
    if (err && err.name === "AbortError") return json(res, 504, { error: "timeout" });
    return json(res, 502, { error: "ai_error", message: String((err && err.message) || err) });
  }
};
