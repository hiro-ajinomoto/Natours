const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appErr');
const catchAsync = require('../utils/catchAsync');
const {
  createOne,
  updateOne,
  deleteOne,
  getOne,
  getAll
} = require('./handlerFactory');

// const checkId = (req, res, next, val) => {
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({ status: 'fail', data: 'Invalid Id' });
//   } // bắt buộc phải có return
//   next();
// };

// MIDDLEWARE
const aliasTopTour = (req, res, next) => {
  // sort=ratingAverage,price&limit=5
  // predefined
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

const getAllTours = getAll(Tour);

const getTour = getOne(Tour, {
  path: 'reviews',
  select: '-__v -user -createAt'
});

const createTour = createOne(Tour);

const updateTour = updateOne(Tour);

const deleteTour = deleteOne(Tour);

const getTourStat = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        // _id: null,
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: {
        avgPrice: 1 // for ascending
      }
    }
    // { $match: { _id: { $ne: 'EASY' } } }, // not qual
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      //***
      $unwind: '$startDates'
    },
    {
      $match: {
        //***
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    { $addFields: { month: '$_id' } },
    {
      $project: { _id: 0 }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 6
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      length: plan.length,
      plan
    }
  });
});

const getToursWithin = catchAsync(async (req, res, next) => {
  const { latlng, distance, unit } = req.params;

  const [latitude, longitude] = latlng.split(',');

  if (!latitude || !longitude) {
    return next(
      new AppError(
        'Please provide longitude and latitude in the format lat,lng',
        400
      )
    );
  }
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; //***

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] } //*****
    }
  });

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: tours
  });
});

const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;

  const [lat, lng] = latlng.split(','); // string

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide longitude and latitude in the format lat,lng',
        400
      )
    );
  }

  const distanceMultiplier = unit === 'mi' ? 0.00062137119 : 0.0001;

  const distance = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: distanceMultiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: { distance }
  });
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image. Please upload only image', 403), false);
  }
};

const multerStorage = multer.memoryStorage();

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

const uploadTourPhotoMulterMiddleware = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1
  },
  {
    name: 'images',
    maxCount: 3
  }
]);

const resizeTourPhoto = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next(); // req.files !== req.file

  const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  req.body.imageCover = imageCoverFilename;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1300) // ratio 2/3
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${imageCoverFilename}`);

  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (image, i) => {
      const imageFileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(image.buffer)
        .resize(2000, 1300) // ratio 2/3
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${imageFileName}`);

      req.body.images.push(imageFileName);
    })
  );

  next();
});

const uploadTourPhoto = catchAsync(async (req, res, next) => {});

// const getTour = catchAsync(async (req, res, next) => {
//   if (!req.params.id) {
//     return next(new AppError('No id to found', 400));
//   }

//   const tour = await Tour.findById(req.params.id).populate('reviews'); //* this populate show the virtual value
//   // const tour = await Tour.findById(req.params.id).populate('guides'); *

//   // const tour = await Tour.findById(req.params.id).populate({
//   //   path: 'guides',
//   //   select: '-__v -passwordChangedAt',
//   // }); //*

//   if (!tour) {
//     return next(new AppError('No tour with that id', 404``));
//   }
//   res.status(200).json({
//     message: 'success',
//     results: tour.length,
//     tour: tour,
//   });
// });

module.exports = {
  getMonthlyPlan,
  getTourStat,
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTour,
  getToursWithin,
  getDistances,
  uploadTourPhoto,
  uploadTourPhotoMulterMiddleware,
  resizeTourPhoto
  // checkId,
  // checkBody,
};
