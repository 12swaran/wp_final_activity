import mongoose from 'mongoose';
import { connectDB } from '../config/db';
async function main() {
  try {
    await connectDB();
    await mongoose.connection.db!.admin().ping();
    console.log(`Database connection verified: ${mongoose.connection.name}`);
  } finally {
    await mongoose.disconnect();
  }
}
main().catch(() => {
  console.error('Database check failed. Check server/.env and your Atlas IP access list.');
  process.exitCode = 1;
});
