const mongoose = require("mongoose");
const DATABASE_URI = process.env.DATABASE_URI;

const connectDB = async () => {
  try {
    if (!DATABASE_URI) {
      throw new Error("MongoDB URI is not defined in .env file");
    }

    await mongoose.connect(DATABASE_URI, {
      dbName: "Ziptos",
    });
    console.log("DB connected");
  } catch (error) {
    console.error("Error while connecting DB", error);
  }
};

module.exports = { connectDB };
