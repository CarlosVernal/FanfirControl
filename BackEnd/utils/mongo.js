const mongoose = require("mongoose");
const config = require("./config");

const mongoUrl = config.MONGODB_URI;
const connectToMongo  = async () => {
  //promises
  try {
    await mongoose.connect(mongoUrl);
    console.log("✅ connected to MongoDB");
  } catch (error) {
    console.log(" ❌ error connecting to MongoDB:", error.message);
    process.exit(1); // Exit the process with failure
  }
};

const closeMongoConnection = async () => {
  //promises
  await mongoose.connection.close();
  console.log("Conexión a MongoDB cerrada");
};

module.exports = { connectToMongo , closeMongoConnection };
