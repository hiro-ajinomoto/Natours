const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/appErr');
const catchAsync = require('../utils/catchAsync');

const getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  if (!tours) {
    return next(new AppError('tours not found', 404));
  }

  res.status(200).render('overview', {
    title: 'All tours',
    tours
  });
});

const getTour = catchAsync(async (req, res, next) => {
  //this is not done yet
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) return next(new AppError('tour not found', 404));

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour
    });
});

const base = (req, res) => {
  res.status(200).render('base', {
    title: 'Page'
  });
};

const getAccount = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
});

const getLoginForm = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      `connect-src 'self' ${req.protocol}://${req.get('host')}`
    )
    // `${req.protocol}://${req.get('host')}/me`
    // .set(
    //   'Content-Security-Policy',
    //   "default-src 'self' https://mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    // )
    .render('login', {
      title: 'Login'
    });
});

// const updateUserData = catchAsync(async (req, res, next) => {
//   console.log('req.body', req.body);

//   const user = await User.findByIdAndUpdate(
//     res.locals.user.id, // req.user.id is fine
//     { ...req.body },
//     { runValidators: true, new: true }
//   );

//   if (!user) return next(new AppError('user not found', 404));

//   res.status(200).render('account', {
//     title: 'Your account',
//     message: 'Your email has been updated'
//   });
// });

const getMyTours = catchAsync(async (req, res, next) => {
  //1 find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  const tourIDs = bookings.map(booking => booking.tour.id);

  const tours = await Tour.find({ _id: { $in: tourIDs } });
  //2 Find tours with the return IDs

  res.status(200).render('overview', {
    title: 'My tours',
    tours: tours
  });
});

module.exports = {
  getOverview,
  getTour,
  getAccount,
  base,
  getLoginForm,
  // updateUserData,
  getMyTours
};
