const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

const connectDB = async () => {
  try {
    await mongoose.connect(
      db,
      { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false }
    );
    console.log(" MongoDB Connected......");
  } catch (err) {
    console.error(err.message);
    // If we encounter errors, we want to exit process with failures.
    process.exit(1);
  }
};

module.exports = connectDB;
