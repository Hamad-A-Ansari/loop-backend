import mongoose from "mongoose";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

/**
 * Filename: auth.controller.js
 * Description: Controller for handling user authentication logic (sign-up, sign-in, sign-out)
 * 
 * Functions:
 * - signUp: Creates a new user with hashed password and returns a JWT token.
 * - signIn: Validates user credentials and returns a JWT token.
 * - signOut: Instructs client to delete token (no server-side invalidation).
 * 
 * Dependencies:
 * - Mongoose: For DB transactions and sessions
 * - Bcryptjs: Password hashing
 * - JWT: Token generation
 * 
 * Author: Hamad A. Ansari
 * Last Updated: 6 May 2025
 */



// Controller for api/v1/auth/auth-path

export const signUp = async (req, res, next) => {

  const session = await mongoose.startSession();
  session.startTransaction();
   
  try {
    //Create a new user
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    //if user already exists, throw an error
    if(existingUser) {
      const error = new Error("User already exists with this email");
      error.statusCode = 409; //409 - Conflict/Already exists
      throw error;
    }

    //Hash password before storing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt); 
    
    
    //Create a new user
    const newUsers = await User.create([{ 
      name, 
      email, 
      password: hashedPassword 
    }], { session });
    
        
    //Create a new token for the user
    const token = jwt.sign({ userId: newUsers[0]._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    //After suuccessfull iteration, commit and end the session
    await session.commitTransaction();
    session.endSession();

    //Send response to the client
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: newUsers[0],
        token
      }
    });
  } catch (error) {

    await session.abortTransaction();
    session.endSession();
    return next(error);
    
  }

};

export const signIn = async (req, res, next) => {
  try {
    const { email, password} = req.body;

    const user = await User.findOne({ email }).select("+password");

    //Check if user exists
    if(!user) {
      const error = new Error("User not found");
      error.statusCode = 401; //401 - Unauthorized
      throw error;
    }

    //Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid) {
      const error = new Error("Invalid password");
      error.statusCode = 401; //401 - Unauthorized
      throw error;
    }

    //Create a new token for the user
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    //Send response to the client
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        user,
        token
      }
    });

  } catch (error) {

    next(error);
  }


};

export const signOut = async (req, res, next) => {
  try {
    // Instruct client to remove token (e.g., from localStorage or cookies)
    res.status(200).json({
      success: true,
      message: "User signed out successfully.",
    });
  } catch (error) {
    next(error);
  }
};