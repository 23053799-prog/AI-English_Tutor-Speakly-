require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/* =========================
   CHAT WITH AVA
========================= */

app.post("/api/chat", async (req, res) => {
  try {
    const { message, conversation } = req.body;

    console.log("User message:", message);

    const conversationText = (conversation || [])
      .map((item) => {
        const speaker =
          item.role === "user" ? "Student" : "Ava";

        return `${speaker}: ${item.content}`;
      })
      .join("\n");

    const prompt = `
You are Ava, a friendly AI English speaking partner.

You are helping a college student practice conversational English.

Your personality:
- Friendly
- Natural
- Encouraging
- Casual
- Patient

Rules:
- Respond naturally like a real conversation partner.
- Keep your response short, usually 1-3 sentences.
- Do not sound robotic or overly formal.
- Do not correct every grammar mistake during the conversation.
- Ask a natural follow-up question when appropriate.
- Encourage the student to keep speaking.
- Do not make the conversation feel like an exam.
- Focus on communication and confidence.

Conversation so far:

${conversationText}

The student's latest message is:

Student: ${message}

Respond as Ava.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const reply = response.text;

    console.log("Ava:", reply);

    res.json({
      reply: reply,
    });
  } catch (error) {
    console.error("========== GEMINI ERROR ==========");
    console.error(error);
    console.error("==================================");

    res.status(500).json({
      error:
        error?.message ||
        "Something went wrong while talking to Ava.",
    });
  }
});


/* =========================
   SESSION FEEDBACK
========================= */

app.post("/api/feedback", async (req, res) => {
  try {
    const { conversation } = req.body;

    if (!conversation || conversation.length === 0) {
      return res.status(400).json({
        error: "No conversation was provided.",
      });
    }

    const conversationText = conversation
      .map((item) => {
        const speaker =
          item.sender === "user" ? "Student" : "Ava";

        return `${speaker}: ${item.text}`;
      })
      .join("\n");

    console.log("Generating feedback...");

    const prompt = `
You are an English speaking coach reviewing a student's
casual English conversation.

Analyze ONLY what the student actually said.

Conversation:

${conversationText}

Return your response as valid JSON with exactly these fields:

{
  "summary": "A short encouraging summary of the student's performance.",
  "strength": "One specific thing the student did well.",
  "grammar": [
    {
      "original": "A sentence or phrase the student actually used.",
      "better": "A more natural/correct version.",
      "explanation": "A short explanation."
    }
  ],
  "vocabulary": [
    {
      "used": "A simple word or phrase from the student.",
      "better": "A more natural or useful alternative.",
      "example": "An example sentence."
    }
  ],
  "nextStep": "One specific thing the student should focus on in their next conversation."
}

Important rules:

- Do not invent mistakes the student did not make.
- If there are very few grammar mistakes, return fewer grammar items.
- Do not force corrections.
- Keep the feedback encouraging.
- Focus on practical conversational English.
- Do not give a numerical English proficiency score.
- Do not claim to measure pronunciation because this transcript does not contain audio pronunciation information.
- Keep each explanation concise.
- Return ONLY valid JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const feedback = JSON.parse(response.text);

    console.log("Feedback generated successfully.");

    res.json(feedback);
  } catch (error) {
    console.error("========== FEEDBACK ERROR ==========");
    console.error(error);
    console.error("====================================");

    res.status(500).json({
      error:
        error?.message ||
        "Something went wrong while generating feedback.",
    });
  }
});


/* =========================
   START SERVER
========================= */

app.listen(3001, () => {
  console.log(
    "Speakly AI server running on http://localhost:3001"
  );
});