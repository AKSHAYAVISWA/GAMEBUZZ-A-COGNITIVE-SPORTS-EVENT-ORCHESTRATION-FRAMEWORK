// models/Registration.js
const mongoose = require("mongoose");

const uploadedDocSchema = new mongoose.Schema({
    name: String,
    path: String
}, { _id: false });

const memberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number },
    email: { type: String },
    phone: { type: String },
    uploadedDocs: [uploadedDocSchema]
}, { _id: false });

const registrationSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    type: { type: String, enum: ["Individual", "Team"], required: true },
    teamName: { type: String },
    location: { type: String, required: true },
    members: [memberSchema],
    // 👈 NEW: Status field for two-step process
    status: { 
        type: String, 
        enum: ['details_submitted', 'complete'], 
        default: 'details_submitted' 
    }, 
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Registration", registrationSchema);