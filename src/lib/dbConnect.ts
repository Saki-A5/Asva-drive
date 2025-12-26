import mongoose from "mongoose";

const MONGODB_URI = process.env.URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable in .env");
}

// Global cache for connection in development (Next.js hot reload)
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

const dbConnect = async() => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    try {
      cached.promise = mongoose.connect(MONGODB_URI, {
        bufferCommands: false,
      }).then((mongoose) => mongoose);
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw new Error("MongoDB connection failed");
    }
  }

  try {
    cached.conn = await cached.promise;
    console.log("✅ MongoDB Connected");
    return cached.conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("MongoDB connection failed");
  }
}

export default dbConnect;
