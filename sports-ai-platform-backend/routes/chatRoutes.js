require('dotenv').config();
const express = require('express');
const router = express.Router();
const axios = require('axios');
const Event = require('../models/Event');
const multer = require('multer');
const fs = require('fs');

// ================= CONFIG =================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const upload = multer({ dest: 'uploads/' });

// =================================================
// 1️⃣ TEXT CHAT — INTENT AWARE, APP ONLY
// =================================================
router.post('/', async (req, res) => {
  const { message } = req.body;

  try {
    const events = await Event.find().sort({ date: 1 }).limit(15);

    const eventSummary = events.map(ev => ({
      name: ev.name,
      sport: ev.sport,
      date: ev.date,
      location: ev.location,
      fee: ev.fee,
      feeCurrency: ev.feeCurrency,
      eventType: ev.eventType,
      teamSize: ev.teamSize || null,
      registerLink: `/register/${ev._id}`,
    }));

    const prompt = `
You are a chatbot that is PART OF A SPORTS EVENTS APPLICATION.

You MUST follow the rules below exactly.

====================
ALLOWED INTENTS
====================

1. GREETING
If the user says greetings such as:
hi, hello, hey, vanakkam, namaste

→ Reply politely.
→ Mention that you can help with sports events available in this app.
→ Reply in the SAME language as the user.

2. EVENT-RELATED QUESTION
If the user asks about sports events, dates, locations, fees, or registration:

→ Answer ONLY using the events data below.
→ Use the EXACT structured format provided.
→ Do NOT add extra information.

3. OTHER QUESTIONS
If the user message is NOT a greeting and NOT related to events:

→ Reply EXACTLY with:
Not available

====================
STRICT RULES
====================
- You are NOT a general assistant.
- You must NOT use outside knowledge.
- You must NOT invent events.
- Always copy Registration Links EXACTLY.
- Reply in the SAME language as the user (Tamil / Hindi / English).

====================
MANDATORY EVENT FORMAT
====================

**Event Name:**  
**Sport:**  
**Date:**  
**Location:**  
**Fee:**  
**Registration Link:**  

====================
EVENTS DATA (ONLY SOURCE)
====================
${JSON.stringify(eventSummary, null, 2)}

====================
USER MESSAGE
====================
${message}
`;

    let response;
    let attempts = 0;

    while (attempts < 3) {
      try {
        response = await axios.post(API_URL, {
          contents: [{ parts: [{ text: prompt }] }]
        });
        break;
      } catch (err) {
        attempts++;
        if (err.response?.status === 429 && attempts < 3) {
          await sleep(attempts * 5000);
        } else {
          throw err;
        }
      }
    }

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Not available";

    res.json({ reply });

  } catch (err) {
    console.error('Error in /api/chat:', err.response?.data || err.message);
    res.status(500).json({ reply: "Not available" });
  }
});

// =================================================
// 2️⃣ VOICE CHAT — INTENT AWARE, APP ONLY
// =================================================
router.post('/voice', upload.single('audio'), async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }).limit(15);

    const eventSummary = events.map(ev => ({
      name: ev.name,
      sport: ev.sport,
      date: ev.date,
      location: ev.location,
      fee: ev.fee,
      feeCurrency: ev.feeCurrency,
      eventType: ev.eventType,
      teamSize: ev.teamSize || null,
      registerLink: `/register/${ev._id}`,
    }));

    const audioBuffer = fs.readFileSync(req.file.path);
    const audioBase64 = audioBuffer.toString('base64');

    const prompt = `
You are a VOICE-BASED chatbot that is PART OF A SPORTS EVENTS APPLICATION.

Follow the steps and rules EXACTLY.

====================
STEP 1: TRANSCRIBE
====================
First, write exactly what the user said.

====================
STEP 2: IDENTIFY INTENT
====================

• GREETING (hi, hello, vanakkam, namaste):
  → Respond politely and say you help with sports events.

• EVENT-RELATED:
  → Answer ONLY from the events below.
  → Use the structured event format.

• OTHER:
  → Reply EXACTLY with: Not available

====================
STRICT RULES
====================
- No outside knowledge.
- No guessing.
- Same language as user.
- Registration links must be exact.

====================
EVENT FORMAT
====================
**Event Name:**  
**Sport:**  
**Date:**  
**Location:**  
**Fee:**  
**Registration Link:**  

====================
EVENTS DATA
====================
${JSON.stringify(eventSummary, null, 2)}

====================
OUTPUT FORMAT (MANDATORY)
====================

Transcript:
<what the user said>

Response:
<your reply>
`;

    const response = await axios.post(API_URL, {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "audio/webm",
                data: audioBase64
              }
            }
          ]
        }
      ]
    });

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Not available";

    fs.unlinkSync(req.file.path);

    res.json({ reply });

  } catch (err) {
    console.error('Error in /api/chat/voice:', err.response?.data || err.message);
    res.status(500).json({ reply: "Not available" });
  }
});

module.exports = router;
