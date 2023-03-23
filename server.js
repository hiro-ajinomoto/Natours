/* eslint-disable prefer-template */
// const dotenv = require('dotenv');

// const mongoose = require('mongoose');

const connectDB = require('./dev-data/data/import-dev-data');

const app = require('./app');

// dotenv.config({ path: './config.env' });

// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// );

// mongoose
//   .connect(process.env.DATABASE, {
//     useUnifiedTopology: true,
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//   })
//   .then(() => console.l og('DB connection established'));

const server = async () => {
  const port = 5000 || process.env.PORT;

  // console.log('argv: ', process.argv);

  // const server =
  app.listen(port, () => {
    console.log('App running on port: ' + port);
  });
  await connectDB();
};

server();

// process.on('unhandledRejection ', (err) => {
//   console.log('UNHANDLED REJECTION: Shutting down...');
//   console.log('error: ', err.message);

//   server.close(() => {
//     process.exit(1);
//   });
// });

// process.on('unhandledException', (err) => {
//   console.log('UNHANDLED REJECTION: Shutting down...');
//   console.log('error: ', err.message);

//   server.close(() => {
//     process.exit(1);
//   });
// });
