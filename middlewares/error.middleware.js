
/**
 * Filename: error.middleware.js
 * Description: Centralized Express middleware for catching and handling errors in the API.
 * 
 * Function:
 * - errorMiddleware: Sends appropriate HTTP status and error messages for thrown exceptions.
 * 
 * Purpose:
 * - Ensures consistent error responses across all routes and services.
 */


const errorMiddleware = (err, req, res, next) => {
  try {
    let error = { ...err };
    error.message = err.message;
    
    console.error(err);

    // Handle specific error types

    //Mongoose bad ObjectId
    if (err.name === 'CastError') {
      const message = `Resource not found. Invalid: ${err.path}`;
      error = new Error(message);
      error.statusCode = 404;
    } 

    //Mongoose duplicate key
    if (err.code === 11000) {
      const message = `Duplicate field value entered: ${err.keyValue.name}`;
      error = new Error(message);
      error.statusCode = 400;
    }

    //Mongoose validation error
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message);
      error = new Error(message.join(', '));
      error.statusCode = 400;
    } 

    res.status(error.statusCode || 500).json({ success: false, error: error.message || 'Server Error' });

  } catch (error) {
    next(error);
  }
}

export default errorMiddleware;