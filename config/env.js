import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const { 
  PORT,  // Port for the server to listen on
  JWT_EXPIRES_IN, // JWT expiration time
  JWT_SECRET, // JWT secret key
  DB_URI, // MongoDB connection URI
  NODE_ENV, 
} = process.env;
