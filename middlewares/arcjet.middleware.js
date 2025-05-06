import aj from "../config/arcjet.js";

/**
 * Filename: arcjet.middleware.js
 * Description: Middleware to integrate Arcjet’s bot protection and rate-limiting logic.
 * 
 * Functionality:
 * - Applies Arcjet protection to requests using API keys and threat analysis.
 * - Used globally in app.js to secure all routes.
 * 
 * Purpose:
 * - Provides real-time protection against bots, abuse, and DDoS-like behavior.
 */


const arcjetMiddleware = async (req, res, next) => {
  try {
    const decision = await aj.protect(req, { requested: 1});

    if(decision.isDenied()){
      if(decision.reason.isRateLimit()) return res.status(429).json({ message: "Rate limit exceeded" });
      if(decision.reason.isBot()) return res.status(403).json({ message: "Bot detected" });
      
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  } catch (error) {
    console.log(`Arcjet Middleware Error: ${error}`);
    next(error);
  }
};

export default arcjetMiddleware;