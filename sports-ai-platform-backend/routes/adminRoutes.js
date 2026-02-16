const express = require('express');
const router = express.Router();

const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  getAllEvents,
  deleteEvent,
  uploadSignature
} = require('../controllers/adminController');

const uploadSignatureMiddleware = require('../middleware/uploadSignature');

// Existing admin routes
router.get('/users', verifyToken, checkRole('admin'), getAllUsers);
router.get('/events', verifyToken, checkRole('admin'), getAllEvents);
router.delete('/events/:id', verifyToken, checkRole('admin'), deleteEvent);

// ✅ Organizer signature upload
router.post(
  '/upload-signature',
  verifyToken,
  checkRole('organizer'),
  uploadSignatureMiddleware.single('signature'),
  uploadSignature
);

module.exports = router;
