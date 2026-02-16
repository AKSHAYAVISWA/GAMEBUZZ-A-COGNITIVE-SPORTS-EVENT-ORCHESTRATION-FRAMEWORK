const path = require("path");
const fs = require("fs");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const User = require("../models/User");
const { generateCertificatePDF } = require("../utils/certificateTemplate");

/**
 * Generate certificates for all participants of an event
 */
const generateCertificatesForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const registrations = await Registration.find({ event: eventId });
    if (!registrations.length) {
      return res.status(400).json({ message: "No registrations found" });
    }

    const certDir = path.join(
      __dirname,
      "..",
      "uploads",
      "certificates",
      eventId
    );

    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }

    // ✅ FETCH ORGANIZER FROM DB (JWT DOES NOT CONTAIN SIGNATURE)
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    const signaturePath = user?.signature || null;

    console.log("USING SIGNATURE PATH:", signaturePath);

    let totalGenerated = 0;

    for (const reg of registrations) {
      if (reg.type === "Individual" && reg.members?.length) {
        const member = reg.members[0];

        const filePath = path.join(
          certDir,
          `${member.name.replace(/\s+/g, "_")}.pdf`
        );

        await generateCertificatePDF({
          participantName: member.name,
          eventName: event.name,
          eventDate: event.date.toDateString(),
          outputPath: filePath,
          signaturePath,
        });

        totalGenerated++;
      }

      if (reg.type === "Team" && reg.members?.length) {
        for (const member of reg.members) {
          const filePath = path.join(
            certDir,
            `${member.name.replace(/\s+/g, "_")}.pdf`
          );

          await generateCertificatePDF({
            participantName: member.name,
            eventName: event.name,
            eventDate: event.date.toDateString(),
            outputPath: filePath,
            signaturePath,
          });

          totalGenerated++;
        }
      }
    }

    res.json({
      message: "Certificates generated successfully",
      totalCertificates: totalGenerated,
    });
  } catch (err) {
    console.error("Certificate Error:", err);
    res.status(500).json({ message: "Certificate generation failed" });
  }
};

/**
 * List generated certificates for an event
 */
const listCertificatesForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const certDir = path.join(
      __dirname,
      "..",
      "uploads",
      "certificates",
      eventId
    );

    if (!fs.existsSync(certDir)) {
      return res.json([]);
    }

    const files = fs.readdirSync(certDir).filter((f) =>
      f.endsWith(".pdf")
    );

    const certificates = files.map((file) => ({
      participantName: file.replace(".pdf", "").replace(/_/g, " "),
      fileName: file,
      url: `/uploads/certificates/${eventId}/${file}`,
    }));

    res.json(certificates);
  } catch (err) {
    console.error("List Certificate Error:", err);
    res.status(500).json({ message: "Failed to fetch certificates" });
  }
};

/**
 * ✅ EXPORTS (THIS FIXES YOUR ERROR)
 */
module.exports = {
  generateCertificatesForEvent,
  listCertificatesForEvent,
};
