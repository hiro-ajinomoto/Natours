/* eslint-disable node/no-unsupported-features/es-syntax */
const Review = require('../models/reviewModel');
const AppError = require('../utils/appErr');
const {
  createOne,
  updateOne,
  deleteOne,
  getOne,
  getAll,
} = require('./handlerFactory');

const setTourUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId; //*

  if (!req.body.user) req.body.user = req.user.id;

  next();
};

const checkUserCommented = async (req, res, next) => {
  //***    replace with index ({tour: 1, user: 1}, {unique: 1})
  const review = await Review.findOne({
    user: req.user.id,
    tour: req.body.tour,
  });

  if (review)
    return next(
      new AppError('You can not comment since you"ve already have one', 403)
    );

  next();
};

const getAllReviews = getAll(Review);

const getReview = getOne(Review);

const editReview = updateOne(Review);
const createReview = createOne(Review);
const deleteReview = deleteOne(Review);

// const createReview = catchAsync(async (req, res, next) => {
//   // setTourUserId(req, res, next);

//   if (!req.body.tour) req.body.tour = req.params.tourId; //*

//   if (!req.body.user) req.body.user = req.user.id;

//   const newReview = await Review.create(req.body);

//   res.status(202).json({
//     status: 'success',
//     data: {
//       newReview,
//     },
//   });
// });

// const deleteReview = catchAsync(async (req, res, next) => {
//   // check if review belongs to this user
//   if (!['admin', 'guide', 'lead-guide'].includes(req.user.role)) {
//     const review = await Review.findById(req.params.id);

//     if (review.user.id !== req.user.id) {
//       return next(new AppError('You do not own this review to delete', 403));
//     }
//   }

//   const doc = await Review.findByIdAndDelete(req.params.id);

//   if (!doc) {
//     return next(new AppError('No review found with this id', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: null,
//   });
// });

// const editReview = catchAsync(async (req, res, next) => {
//   // check if review belongs to this user
//   if (!['admin', 'guide', 'lead-guide'].includes(req.user.role)) {
//     const review = await Review.findById(req.params.id);

//     if (review.user.id !== req.user.id) {
//       return next(new AppError('You do not own this review to edit ', 403));
//     }
//   }

//   const editedReview = await Review.findByIdAndUpdate(req.params.id, req.body, {
//     runValidators: true,
//     new: true,
//   });

//   if (!editedReview) {
//     return next(new AppError('No review found with this id', 404));
//   }

//   res.status(202).json({
//     status: 'success',
//     data: { editedReview },
//   });
// });

module.exports = {
  setTourUserId,
  getAllReviews,
  getReview,
  createReview,
  deleteReview,
  editReview,
  checkUserCommented,
};
