import mongoose from "mongoose";

interface IMongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongooseCache: IMongooseCache | undefined;
}

const cache: IMongooseCache = globalThis._mongooseCache ?? { conn: null, promise: null };
globalThis._mongooseCache = cache;

mongoose.set("bufferCommands", false);

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  if (!cache.promise) {
    const uri = process.env.MONGODB_URI?.trim().replace(/^["']|["']$/g, "");
    if (!uri) {
      throw new Error("Missing MONGODB_URI environment variable");
    }

    cache.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 30000,
        bufferCommands: false,
      })
      .then((m) => {
        cache.conn = m;
        return m;
      })
      .catch((err) => {
        cache.promise = null;
        cache.conn = null;
        throw err;
      });
  }

  return cache.promise;
}
