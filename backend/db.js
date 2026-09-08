import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure DNS to avoid ECONNREFUSED on mongodb+srv queries
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('DNS server configuration warning:', e.message);
}

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'discountEngine';

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in .env');
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB_NAME,
    });
    console.log(`[MongoDB] Connected successfully to database: ${MONGODB_DB_NAME}`);
  } catch (error) {
    console.error('[MongoDB] Connection error:', error.message);
    throw error;
  }
}

export default mongoose;
