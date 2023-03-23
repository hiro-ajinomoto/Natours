const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const {
  createOne,
  updateOne,
  deleteOne,
  getOne,
  getAll
} = require('./handlerFactory');

const catchAsync = require('../utils/catchAsync');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const booking = catchAsync(async (req, res, next) => {});

const getCheckoutSession = catchAsync(async (req, res, next) => {
  //1) get the currently booked tour

  const tour = await Tour.findById(req.params.tourId);
  //2) create heck out session

  const session = await stripe.checkout.sessions.create({
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`, // this is where user, price, tour are added to query
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',

    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`] // this url is wrong
          }
        },
        quantity: 1
      }
    ]
  });

  res.status(200).json({
    status: 'success',
    session
  });
});

const createBookingCheckout = catchAsync(async (req, res, next) => {
  // this is TEMPORARY, because it's unsecure: everyone can make booking without paying

  const { tour, user, price } = req.query; // line 17 getCheckoutSession

  if (!tour || !user || !price) return next();

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]); ///***
});

const createBooking = createOne(Booking);
const updateBooking = updateOne(Booking);
const deleteBooking = deleteOne(Booking);
const getAllBooking = getAll(Booking);
const getABooking = getOne(Booking);

module.exports = {
  booking,
  getCheckoutSession,
  createBookingCheckout,
  createBooking,
  updateBooking,
  deleteBooking,
  getAllBooking,
  getABooking
};
