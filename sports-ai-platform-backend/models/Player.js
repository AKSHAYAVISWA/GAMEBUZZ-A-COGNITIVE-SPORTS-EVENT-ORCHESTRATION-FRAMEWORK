const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  sport: {
    type: String,
    required: true,
  },
  team: {
    type: String,
    default: "Unassigned",
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Player', playerSchema);
