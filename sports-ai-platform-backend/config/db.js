const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB Connected');
  } catch (error) {
    console.error('Mongo connection failed');
    process.exit(1);
  }
};

module.exports = connectDB;
