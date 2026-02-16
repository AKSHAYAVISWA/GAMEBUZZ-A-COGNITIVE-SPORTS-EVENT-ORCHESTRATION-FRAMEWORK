const User = require('../models/User');
const Event = require('../models/Event');

/**
 * Get all users (without password)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ msg: "Server error while fetching users" });
  }
};

/**
 * Get all events
 */
const getAllEvents = async (req, res) => {
  try {
    console.log("Hit /api/admin/events controller");
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ msg: 'Server error while fetching events' });
  }
};

/**
 * Delete event by ID
 */
const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Event deleted' });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ msg: 'Error deleting event' });
  }
};

/**
 * Upload organizer signature (PNG)
 * Used for certificate generation
 */
const uploadSignature = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No signature file uploaded" });
    }

    // req.user contains token payload, not mongoose doc
    const userId = req.user.id || req.user._id;

    await User.findByIdAndUpdate(
      userId,
      { signature: req.file.path },
      { new: true }
    );

    res.json({
      msg: "Signature uploaded successfully",
      signature: req.file.path,
    });
  } catch (err) {
    console.error("Signature upload error:", err);
    res.status(500).json({ msg: "Signature upload failed" });
  }
};

module.exports = {
  getAllUsers,
  getAllEvents,
  deleteEvent,
  uploadSignature,
};
