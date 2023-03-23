// const fs = require('fs');

const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTour,
  getTourStat,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImage,
  uploadTourPhotoMulterMiddleware,
  uploadTourPhoto,
  resizeTourPhoto
} = require('../controllers/tourController');

const router = express.Router();

router.use(express.json()); //* middleware

router.use('/:tourId/reviews', reviewRouter); //*

// router.param('id', checkId); *

// router.route('/:tourId/reviews').post(protect, createReview); //* nested routes

router.route('/top-5-cheap').get(aliasTopTour, getAllTours);

router.route('/tour-stat').get(getTourStat);

//PROTECT *
router.use(protect);

router
  .route('/tour-within/:distance/center/:latlng/unit/:unit/')
  .get(getToursWithin);

router.route('/distance/:latlng/unit/:unit/').get(getDistances);

//RESTRICT TO *
router.use(restrictTo('admin', 'lead-guide'));

router
  .route('/:id')
  .get(getTour)
  .patch(uploadTourPhotoMulterMiddleware, resizeTourPhoto, updateTour)
  .delete(deleteTour);

router.route('/monthly-plan/:year').get(getMonthlyPlan);

router
  .route('/')
  .get(getAllTours)
  .post(createTour);

module.exports = router;
