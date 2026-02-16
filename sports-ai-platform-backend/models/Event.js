const mongoose = require('mongoose');

const requiredDocSchema = new mongoose.Schema({
  name: { type: String, required: true },
  required: { type: Boolean, default: true }
});

const uploadedDocSchema = new mongoose.Schema({
  name: String,
  path: String
}, { _id: false });

// Team member schema
const memberSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: { type: String } // e.g., Captain, Player, etc.
}, { _id: false });

// Registration schema (embedded in event)
const registrationSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['Individual', 'Team'], default: 'Individual' },
  teamName: { type: String },
  location: { type: String },
  members: [memberSchema],
  uploadedDocs: [uploadedDocSchema],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sport: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  fee: { type: Number, default: 0 },
  feeCurrency: { type: String, default: 'INR' },
  eventType: { type: String, enum: ['Individual', 'Team'], default: 'Individual' },
  teamSize: { type: Number, default: 0 }, // max number of members in a team
  requiredDocs: {
    type: [requiredDocSchema],
    default: [{ name: "Aadhar Card", required: true }] // ✅ Always included by default
  },
  poster: { type: String },          // path to uploaded poster image
  guidelineFile: { type: String },   // path to uploaded guideline file
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  registeredPlayers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  registrations: [registrationSchema], // ✅ Embedded registrations
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
