/* eslint-disable prefer-template */
const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');

const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });
// dotenv.config({ path: `${__dirname}/../../config.env` });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

const connectDB = async () => {
  // process.argv[2] = '--delete';
  // process.argv[2] = '--import';
  await mongoose
    .connect(process.env.DATABASE, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then(() => {
      console.log('DB connection established');
    })
    .catch((err) => {
      // handle error from mongoose connection
      console.log('ERROR: ', err);
    });

  //IMPORT DATABASE into DB
  // eslint-disable-next-line no-unused-vars
  const importData = async () => {
    try {
      await Tour.create(tours);
      // await User.create(users, { validateBeforeSave: true });
      // await Review.create(reviews);

      console.log('Data successfully created');
    } catch (error) {
      console.log(error);
    }
  };

  //DELETE ALL DATA FROM DATABASE
  // eslint-disable-next-line no-unused-vars
  const deleteData = async () => {
    try {
      // await Tour.deleteMany();
      // await User.deleteMany();
      await Review.deleteMany();

      console.log('Data successfully deleted');
    } catch (error) {
      console.log(error);
    }
    process.exit(); // same as return in function
  };

  if (process.argv[2] === '--import') {
    importData();
  } else if (process.argv[2] === '--delete') {
    deleteData();
  }
};

module.exports = connectDB;
