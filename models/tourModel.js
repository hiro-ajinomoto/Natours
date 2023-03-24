/* eslint-disable prefer-arrow-callback */
const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel'); // this would be used for the embed documentation
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      // index: true,
      unique: true,
      trim: true,
      maxLength: [40, 'A tour name must have less then or equal 40 characters'],
      minLength: [10, 'A tour name must have more then or equal 10 characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have max group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be easy medium or difficulty'
      }
    },
    rating: {
      type: Number,
      default: 4.5
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating average must be above or equal 1.0'],
      max: [5, 'Rating average must be below or equal 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should  be small than regulars price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have summary']
    },

    description: {
      type: String,
      required: [true, 'A tour must have a description']
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a image cover']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date], // add participants and soldOut filed here
    secretTour: { type: Boolean, default: false },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    // guides: Array, // this would work for the embed document
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]

    // reviews: [ //replaced with the the virtual populate
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Review',
    //   },
    // ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual('durationWeeks').get(function() {
  return (this.duration / 7).toFixed(2);
});

//**
// tourSchema.index({ price: 1 }); // 1 = ascendence,  -1 = descendence //*
tourSchema.index({ price: 1, ratingsAverage: -1 }); // compound index
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' }); //***

// virtual populate ***
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', // foreign key
  localField: '_id' // primary key
});

tourSchema.pre('save', function(next) {
  //*
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.post('save', function (doc, next) {
//   // console.log('doc', doc);
//   next();
// });

// QUERY MIDDLEWARE
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    //**
    path: 'guides',
    select: '-__v -passwordChangedAt -password'
  });
  next();
});

//**
// tourSchema.pre('save', async function (next) { // this would work for the embed document
//   // how we embed and use promised in loop
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);
//   next();
// });

// tourSchema.post(/^find/, (docs, next) => {
//   console.log(`query took ${Date.now() - this.start}  milisecond `);
//   // console.log('docs', docs);
//   next();
// });

//*
// tourSchema.pre('aggregate', function (next) { // this will affect the aggregate in getDistance in Tour Contoller
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // remove all item has secretTour = true
//   // unshift return the length of array

//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
