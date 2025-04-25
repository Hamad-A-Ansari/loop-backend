import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const { 
  PORT,  // Port for the server to listen on
  JWT_EXPIRES_IN, // JWT expiration time
  JWT_SECRET, // JWT secret key
  MONGODB_URI, // MongoDB connection URI
  
} = process.env;
