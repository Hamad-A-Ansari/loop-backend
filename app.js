//Import Modules
import express from 'express';
import cookieParser from 'cookie-parser';
import connectToDatabase from './database/mongodb.js';
import cors from 'cors';

//Import Routes
import importRouter from './routes/csvImport.routes.js';
import reportRouter from './routes/report.routes.js';
import authRouter from './routes/auth.routes.js';

//Import Middlewares
import errorMiddleware from './middlewares/error.middleware.js';
import arcjetMiddleware from './middlewares/arcjet.middleware.js';
import authorize from './middlewares/auth.middleware.js';

//Import Config
import { PORT } from './config/env.js';


// Starting point
const app = express();

// Setup Cors
app.use(cors())

//Middlewares to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


//Middleware for Rate Limiting
app.use(arcjetMiddleware);


// Public API Routes
app.use('/api/v1/auth', authRouter);





// Protected API routes
app.use('/api/v1/importCsv', importRouter)
app.use('/api/v1/reports', reportRouter);


//Middleware for Error handling
app.use(errorMiddleware);


app.get('/api/v1/', (req, res) => {
  res.send('Welcome to Loop Backend API');
});


app.listen(PORT, async() => {
  await connectToDatabase();
  
  console.log('Server is running on port:', PORT);
  console.log('Environment:', process.env.NODE_ENV || 'development');

});

export default app;