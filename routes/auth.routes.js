import { Router } from "express";
import { signUp, signIn, signOut } from "../controllers/auth.controller.js";

/**
 * Filename: auth.routes.js
 * Description: Defines authentication-related API endpoints for sign-up, sign-in, and sign-out.
 * 
 * Routes:
 * - POST /sign-up: Register a new user.
 * - POST /sign-in: Log in and receive JWT token.
 * - POST /sign-out: Log out user from client (token deletion handled client-side).
 * 
 * Purpose:
 * - Provides endpoints for user authentication and session management.
 */


const authRouter = Router();

// Path: api/v1/auth/:auth-path

authRouter.post('/sign-up', signUp);
authRouter.post('/sign-in', signIn);
authRouter.post('/sign-out', signOut);


export default authRouter;
