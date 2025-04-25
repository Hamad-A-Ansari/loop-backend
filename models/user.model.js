import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User Name is required"],
    trim: true,
    minlength: [3, "User Name must be at least 3 characters long"],
    maxlength: [50, "User Name must be at most 50 characters long"],
  },
  email: {
    type: String,
    required: [true, "User Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match : [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: [true, "User Password is required"],
    minlength: [6, "User Password must be at least 6 characters long"],
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;