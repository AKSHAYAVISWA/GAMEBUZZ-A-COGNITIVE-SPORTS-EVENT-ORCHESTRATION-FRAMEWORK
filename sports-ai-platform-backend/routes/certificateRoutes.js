const express = require("express");
const router = express.Router();

const certificateController = require("../controllers/certificateController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

/**
 * POST – Generate certificates
 */
router.post(
  "/generate/:eventId",
  verifyToken,
  checkRole("organizer"),
  (req, res) => certificateController.generateCertificatesForEvent(req, res)
);

/**
 * GET – List certificates
 * ✅ Wrapped to guarantee a function is passed to Express
 */
router.get(
  "/:eventId",
  verifyToken,
  checkRole("organizer"),
  (req, res) => certificateController.listCertificatesForEvent(req, res)
);

module.exports = router;
