const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const { sendWhatsAppMessage } = require("../utils/whatsappSender");

// ------------------ GEMINI API CONFIG ------------------
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`;

// ------------------ UTILITIES ------------------

async function retryFetch(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 404) {
          console.error("\n❌ [DIAGNOSTIC] MODEL NOT FOUND. Check your model string in GEMINI_API_URL.");
        }
        throw new Error(`API Error ${response.status}: ${JSON.stringify(data)}`);
      }
      return data;
    } catch (error) {
      if (i < retries - 1) {
        const delay = Math.pow(2, i) * 1000;
        console.warn(`⚠️ Attempt ${i + 1} failed, retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

function fileToGenerativePart(filePath, mimeType) {
  const fullPath = path.join(__dirname, "..", filePath);
  if (!fs.existsSync(fullPath)) throw new Error(`File not found: ${fullPath}`);
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(fullPath)).toString("base64"),
      mimeType,
    },
  };
}

function calculateAge(dobString) {
  if (!dobString) return null;
  const parts = dobString.match(/(\d{2})[./-](\d{2})[./-](\d{4})/);
  let dob = parts ? new Date(`${parts[3]}-${parts[2]}-${parts[1]}`) : new Date(dobString);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

/**
 * IDENTITY VERIFICATION ENGINE
 */
async function callGeminiForAadharVerification(filePath) {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing in .env");

  const mimeType = filePath.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg";
  const imagePart = fileToGenerativePart(filePath, mimeType);

  const payload = {
    contents: [{
      parts: [
        { text: "Extract the 'Name' and 'Date of Birth' (format DD/MM/YYYY) from this ID. Return ONLY JSON: {\"extracted_name\": \"...\", \"extracted_dob\": \"...\"}" },
        imagePart
      ]
    }],
    generationConfig: { temperature: 0.1 }
  };

  const result = await retryFetch(GEMINI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) throw new Error("AI response body empty.");

  try {
    const cleanJson = textResponse.replace(/```json|```/g, "").trim();
    const extractedJson = JSON.parse(cleanJson);
    return {
      name: extractedJson.extracted_name,
      age: calculateAge(extractedJson.extracted_dob),
      rawDob: extractedJson.extracted_dob
    };
  } catch (err) {
    console.error("❌ Parsing failed. AI output:", textResponse);
    throw new Error("Could not parse Aadhar data.");
  }
}

// ------------------ MULTER STORAGE ------------------

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/docs";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const genericUpload = multer({ storage }).any();

// ------------------ ROUTES ------------------

// STEP 1: INITIAL DETAILS
router.post("/:eventId/start", async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const { type, teamName, location, members } = req.body;
    const registration = new Registration({
      event: event._id,
      type,
      teamName: type === "Team" ? teamName : undefined,
      location,
      members: (Array.isArray(members) ? members : [members]).map(m => ({ ...m, uploadedDocs: [] })),
      status: "details_submitted",
    });
    await registration.save();
    
    console.log(`\n📄 [NEW REGISTRATION] ID: ${registration._id} | Event: ${event.name}`);
    res.json({ message: "Details saved.", registrationId: registration._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error in Step 1" });
  }
});

// STEP 2: VERIFY AND COMPLETE
router.post("/verify-and-complete", async (req, res) => {
  genericUpload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    const { registrationId } = req.body;

    try {
      let reg = await Registration.findById(registrationId).populate("event");
      if (!reg) return res.status(404).json({ message: "Registration not found" });

      console.log(`\n================================================`);
      console.log(`🔍 VERIFYING REGISTRATION: ${reg._id}`);
      console.log(`================================================`);

      // 1. Assign files to members
      for (let i = 0; i < reg.members.length; i++) {
        reg.members[i].uploadedDocs = [];
        for (const doc of reg.event.requiredDocs) {
          const key = reg.type === "Team" ? `member${i}_${doc.name}` : `member0_${doc.name}`;
          const file = req.files.find(f => f.fieldname === key);
          if (file) {
            reg.members[i].uploadedDocs.push({ name: doc.name, path: "uploads/docs/" + file.filename });
          } else if (doc.required || doc.name === "Aadhar Card") {
            throw new Error(`Document ${doc.name} is required for ${reg.members[i].name}`);
          }
        }
      }

      // 2. Perform AI Verification
      for (let i = 0; i < reg.members.length; i++) {
        const member = reg.members[i];
        const aadhar = member.uploadedDocs.find(d => d.name === "Aadhar Card");
        
        if (aadhar) {
          console.log(`\n[Member ${i + 1}: ${member.name}]`);
          console.log(`⌛ Contacting Gemini AI for Aadhar Verification...`);
          
          const extracted = await callGeminiForAadharVerification(aadhar.path);
          
          console.log(`🤖 AI Extracted Name: "${extracted.name}"`);
          console.log(`🤖 AI Extracted Age:  ${extracted.age} (from DOB: ${extracted.rawDob})`);

          // Matching Logic
          const nameOk = member.name.toLowerCase().includes(extracted.name.toLowerCase()) || 
                         extracted.name.toLowerCase().includes(member.name.toLowerCase());
          
          const ageOk = parseInt(member.age) === extracted.age;

          if (!nameOk) {
            console.error(`❌ NAME MISMATCH: Provided "${member.name}" vs AI "${extracted.name}"`);
            throw new Error(`Name mismatch for ${member.name}.`);
          }
          if (!ageOk) {
            console.error(`❌ AGE MISMATCH: Provided "${member.age}" vs AI "${extracted.age}"`);
            throw new Error(`Age mismatch for ${member.name}.`);
          }

          console.log(`✅ Verification Successful for ${member.name}`);
        }
      }

      reg.status = "complete";
      await reg.save();

      // 3. Notify via WhatsApp
      console.log(`\n------------------------------------------------`);
      console.log(`📱 SENDING WHATSAPP NOTIFICATIONS`);
      console.log(`------------------------------------------------`);
      
      for (const m of reg.members) {
        if (m.phone) {
          const msg = `Registration successful for ${reg.event.name}!`;
          try {
            await sendWhatsAppMessage(m.phone, msg);
            console.log(`✔ Message delivered to: ${m.name} (${m.phone})`);
          } catch (waErr) {
            console.log(`✖ WhatsApp failed for ${m.name}: ${waErr.message}`);
          }
        }
      }

      console.log(`\n✨ REGISTRATION FULLY COMPLETED ✨\n`);
      res.json({ message: "Verified and Registered!", registration: reg });

    } catch (error) {
      console.error(`\n🛑 PROCESS STOPPED: ${error.message}\n`);
      res.status(400).json({ message: error.message });
    }
  });
});

module.exports = router;