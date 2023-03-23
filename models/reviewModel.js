const mongoose = require('mongoose');
const AppError = require('../utils/appErr');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, 'Rating must be provided'],
      min: [1, 'rating must be from 1 to 5'],
      max: [5, 'rating must be from 1 to 5'],
    },
    review: {
      type: String,
      required: [true, 'Review must be provided'],
    },
    createAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Tour must be belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'Tour must be belong to a user'],
      ref: 'User',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); // only 1 user have 1 comment on 1 tour, this might be work on the next day

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    //*****
    {
      $match: { tour: tourId }, // path
    },
    {
      // group a big group of tour
      $group: {
        // redefine fields
        _id: '$tour',
        ratingInTotal: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await Tour.findByIdAndUpdate(tourId, {
        ratingsAverage: stats[0].avgRating.toFixed(2),
        ratingsQuantity: stats[0].ratingInTotal,
      });
    } else {
      await Tour.findByIdAndUpdate(tourId, {
        ratingsAverage: 4.5,
        ratingsQuantity: 0,
      });
    }
  } catch (error) {
    return error;
  }
};
reviewSchema.pre(/^find/, function (next) {
  //*
  // this.populate({ path: 'user', select: 'name photo' }).populate({
  //   path: 'tour',
  //   select: 'name ',
  // });

  this.populate({ path: 'user', select: 'name photo' });

  next();
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  // find doc is working
  const review = await this.findOne(); //***

  // save it on the query
  this.reviewInfo = review; //***

  next();
});

reviewSchema.post('save', async function (next) {
  //*****
  //this constructor = Model
  // Review.calcAverageRatings(this.tour);
  const error = await this.constructor.calcAverageRatings(this.tour);

  if (error) {
    return next(new AppError(error, 500));
  }
});

// I think this should be findOneAndDelete not for findOneAndUpdate
reviewSchema.post(/^findOneAnd/, async function (next) {
  // if find one and delete run, we should aggregate one more time
  await this.reviewInfo.constructor.calcAverageRatings(this.reviewInfo.tour); //*****
});

const Review = mongoose.model('Review', reviewSchema); //this should only be place at this static place right above module.exports

module.exports = Review;
