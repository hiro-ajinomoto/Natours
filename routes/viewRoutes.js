const express = require('express');
const { isLoggedIn, protect } = require('../controllers/authController');
const { createBookingCheckout } = require('../controllers/bookingController');
const {
  base,
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  getMyTours
} = require('../controllers/viewsController');

const router = express.Router();

router.use(express.json());

router.get('/login', getLoginForm);

// router.use(isLoggedIn);

router.get('/', createBookingCheckout, isLoggedIn, getOverview);

router.get('/me', protect, getAccount);

router.get('/tour/:slug', isLoggedIn, getTour);

router.get('/my-tours', protect, getMyTours);

// router.post('/submit-user-data', protect, updateUserData);

module.exports = router;
