const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ================= CREATE EVENT =================
router.post(
  "/",
  verifyToken,
  checkRole("organizer"),
  upload.fields([
    { name: "poster", maxCount: 1 },
    { name: "guideline", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        name,
        sport,
        date,
        location,
        fee,
        feeCurrency,
        requiredDocs,
        eventType,
        teamSize,
      } = req.body;

      let docs = [];
      try {
        if (requiredDocs) {
          docs =
            typeof requiredDocs === "string"
              ? JSON.parse(requiredDocs)
              : Array.isArray(requiredDocs)
              ? requiredDocs
              : [];
        }
      } catch {
        docs = [];
      }

      // Ensure Aadhar Card always required
      if (!docs.some((d) => d.name?.toLowerCase() === "aadhar card")) {
        docs.unshift({ name: "Aadhar Card", required: true });
      }

      const eventData = {
        name,
        sport,
        date,
        location,
        fee: fee ? Number(fee) : 0,
        feeCurrency: feeCurrency || "INR",
        eventType: eventType || "Individual",
        teamSize: eventType === "Team" ? Number(teamSize) : undefined,
        requiredDocs: docs,
        organizer: req.user._id, // ✅ FIXED
      };

      if (req.files?.poster?.[0]) {
        eventData.poster = `/uploads/${req.files.poster[0].filename}`;
      }
      if (req.files?.guideline?.[0]) {
        eventData.guidelineFile = `/uploads/${req.files.guideline[0].filename}`;
      }

      const event = await Event.create(eventData);
      res.json({ msg: "Event created successfully", event });
    } catch (err) {
      console.error("Create event error:", err);
      res.status(500).json({ msg: err.message || "Server error" });
    }
  }
);

// ================= GET ALL EVENTS =================
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().populate("organizer", "name email");
    res.json(events);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= GET MY EVENTS =================
router.get(
  "/my-events",
  verifyToken,
  checkRole("organizer"),
  async (req, res) => {
    try {
      const events = await Event.find({ organizer: req.user._id }); // ✅ FIXED
      res.json(events);
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// ================= GET SINGLE EVENT =================
router.get("/:eventId", async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ msg: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= DELETE EVENT =================
router.delete(
  "/:id",
  verifyToken,
  checkRole("organizer"),
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ msg: "Event not found" });

      if (event.organizer?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ msg: "Unauthorized" });
      }

      await Event.findByIdAndDelete(req.params.id);
      res.json({ msg: "Event deleted successfully" });
    } catch (err) {
      console.error("Delete event error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// ================= UPDATE EVENT =================
router.put(
  "/:eventId",
  verifyToken,
  checkRole("organizer"),
  upload.fields([
    { name: "poster", maxCount: 1 },
    { name: "guideline", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const {
        name,
        sport,
        date,
        location,
        fee,
        feeCurrency,
        eventType,
        teamSize,
        requiredDocs,
      } = req.body;

      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ msg: "Event not found" });

      if (event.organizer?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ msg: "Unauthorized" });
      }

      if (name) event.name = name;
      if (sport) event.sport = sport;
      if (date) event.date = date;
      if (location) event.location = location;
      if (fee !== undefined) event.fee = Number(fee);
      if (feeCurrency) event.feeCurrency = feeCurrency;
      if (eventType) event.eventType = eventType;
      if (eventType === "Team" && teamSize !== undefined)
        event.teamSize = Number(teamSize);

      if (requiredDocs) {
        let docs =
          typeof requiredDocs === "string"
            ? JSON.parse(requiredDocs)
            : requiredDocs;

        if (!docs.some((d) => d.name?.toLowerCase() === "aadhar card")) {
          docs.unshift({ name: "Aadhar Card", required: true });
        }
        event.requiredDocs = docs;
      }

      if (req.files?.poster?.[0])
        event.poster = `/uploads/${req.files.poster[0].filename}`;
      if (req.files?.guideline?.[0])
        event.guidelineFile = `/uploads/${req.files.guideline[0].filename}`;

      await event.save();
      res.json({ msg: "Event updated successfully", event });
    } catch (err) {
      console.error("Update event error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// ================= GET REGISTRATIONS =================
router.get(
  "/:eventId/registrations",
  verifyToken,
  checkRole("organizer"),
  async (req, res) => {
    try {
      const registrations = await Registration.find({
        event: req.params.eventId,
      }).lean();
      res.json(registrations);
    } catch (err) {
      console.error("Fetch registrations error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

module.exports = router;
