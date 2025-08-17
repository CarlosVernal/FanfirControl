import mongoose from "mongoose";
import { MONGODB_URI } from "./config.js";

const mongoUrl = MONGODB_URI;
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

export { connectToMongo, closeMongoConnection };
