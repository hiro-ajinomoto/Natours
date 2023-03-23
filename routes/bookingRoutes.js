const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  getCheckoutSession,
  getAllBooking,
  deleteBooking,
  updateBooking,
  createBooking,
  getABooking
} = require('../controllers/bookingController');

const router = express.Router();

router.use(express.json());

router.use(protect);

router.get('/checkout-session/:tourId', getCheckoutSession);

router.use(restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(getAllBooking)
  .post(createBooking);

router
  .route('/:id')
  .get(getABooking)
  .patch(updateBooking)
  .delete(deleteBooking);

module.exports = router;
