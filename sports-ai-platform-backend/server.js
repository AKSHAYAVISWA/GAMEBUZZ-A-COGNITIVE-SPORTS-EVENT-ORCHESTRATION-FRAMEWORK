const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Added for path resolution
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ DB Connection Error:", err));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const registrationRoutes = require("./routes/registrationRoutes");
const certificateRoutes = require("./routes/certificateRoutes");


// Static Folder for File Uploads
// This allows you to access files via http://localhost:5000/uploads/docs/filename.png
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/register', registrationRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/certificates", certificateRoutes);


// Test Route
app.get('/', (req, res) => {
  res.send('API Running...');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});