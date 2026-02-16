// utils/certificateTemplate.js
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateCertificatePDF = ({
  participantName,
  eventName,
  eventDate,
  outputPath,
  signaturePath,
  organizerName = "Event Organizer",
  organizerTitle = "Organizing Committee",
}) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 40,
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    /* ================= BACKGROUND ================= */
    const bgPath = path.join(
      __dirname,
      "..",
      "uploads",
      "certificate-assets",
      "certificate.png"
    );

    if (fs.existsSync(bgPath)) {
      doc.image(bgPath, 0, 0, {
        width: doc.page.width,
        height: doc.page.height,
      });
    }

    doc.moveDown(3);

    /* ================= TITLE ================= */
    doc
      .font("Helvetica-Bold")
      .fontSize(34)
      .fillColor("#2c2c2c")
      .text("CERTIFICATE OF PARTICIPATION", {
        align: "center",
      });

    doc.moveDown(2);

    /* ================= BODY ================= */
    doc
      .font("Helvetica")
      .fontSize(20)
      .text("This certificate is proudly presented to", {
        align: "center",
      });

    doc.moveDown(1);

    doc
      .font("Helvetica-Bold")
      .fontSize(30)
      .fillColor("#000000")
      .text(participantName, {
        align: "center",
        underline: true,
      });

    doc.moveDown(1.5);

    doc
      .font("Helvetica")
      .fontSize(18)
      .fillColor("#333333")
      .text(
        "for their active participation and contribution to the",
        { align: "center" }
      );

    doc.moveDown(0.8);

    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .text(eventName, { align: "center" });

    doc.moveDown(1);

    // ✅ REMOVED "at Venue"
    doc
      .font("Helvetica")
      .fontSize(16)
      .text(`held on ${eventDate}.`, {
        align: "center",
      });

    /* ================= SIGNATURE (LEFT BOTTOM, FIXED ORDER) ================= */
    if (signaturePath) {
      const absoluteSignaturePath = path.resolve(signaturePath);

      if (fs.existsSync(absoluteSignaturePath)) {
        const signX = 80;
        const signY = doc.page.height - 210;

        // ✅ Signature FIRST
        doc.image(absoluteSignaturePath, signX, signY, {
          width: 120,
        });

        // ✅ Organizer name BELOW signature
        doc
          .font("Helvetica-Bold")
          .fontSize(12)
          .text(organizerName, signX, signY + 65, {
            width: 220,
          });

        // ✅ Organizer title LAST
        doc
          .font("Helvetica")
          .fontSize(11)
          .text(organizerTitle, signX, signY + 82, {
            width: 220,
          });
      }
    }

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });
};

module.exports = { generateCertificatePDF };
