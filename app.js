import express from 'express';


const app = express();


app.get('/', (req, res) => {
  res.send('Welcome to Loop Backend API');
});



app.listen(2000, async() => {
  console.log('Server is running on port 2000');
})