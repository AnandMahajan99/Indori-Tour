const mongoose = require('mongoose');
const dotenv = require('dotenv');

///////
process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  process.exit();
});

dotenv.config({ path: './config.env' });
const app = require('./app');

// console.log(process.env.DATABASE_LOCAL);
mongoose
  .connect('mongodb://localhost/natours', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('Database Connected Successfully'));

// console.log(process.env);

//-------------------- START SEVER --------------------------

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

/////////
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit();
  });
});
