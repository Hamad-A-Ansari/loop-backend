import express from 'express';
import cookieParser from 'cookie-parser';
import { PORT } from './config/env.js';
import connectToDatabase from './database/mongodb.js';
import errorMiddleware from './middlewares/error.middleware.js';

//Import Routes
import importRouter from './routes/csvImport.routes.js';
import reportRoutes from './routes/report.routes.js';



const app = express();

//Middlewares to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());




//Middleware for Error handling
app.use(errorMiddleware);


// API routes
app.use('/api/v1/importCsv', importRouter)
app.use('/api/v1/reports', reportRoutes);


app.get('/api/v1/', (req, res) => {
  res.send('Welcome to Loop Backend API');
});


app.listen(PORT, async() => {
  console.log('Server is running on port:', PORT);
  console.log('Environment:', process.env.NODE_ENV || 'development');

  await connectToDatabase();
});

export default app;