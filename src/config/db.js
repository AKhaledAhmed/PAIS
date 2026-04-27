const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/PAIS');
    console.log("Database connected successfully!");
  } catch (err) {
    console.error("Connection failed", err);
  }
};

module.exports = connectDB;