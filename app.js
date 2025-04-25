import express from 'express';

import { PORT } from './config/env.js';

const app = express();


app.get('/', (req, res) => {
  res.send('Welcome to Loop Backend API');
});



app.listen(PORT, async() => {
  console.log('Server is running on port:', PORT);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});