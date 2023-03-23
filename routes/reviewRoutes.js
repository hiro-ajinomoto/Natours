// const fs = require('fs');
const express = require('express');

const { protect } = require('../controllers/authController');
const {
  createReview,
  getAllReviews,
  deleteReview,
  editReview,
  setTourUserId,
  getReview,
  // checkUserCommented,
} = require('../controllers/reviewController');
const Review = require('../models/reviewModel');
const checkUserOwnDoc = require('../utils/checkUserOwnDoc');

const router = express.Router({ mergeParams: true });

router.use(express.json());

//PROTECT
router.use(protect);

router.route('/').get(getAllReviews).post(setTourUserId, createReview); //* division

// kiểm tra user đã comment hay chưa
// tourId, user -> dùng Review.find({tour: tourID, user: userId}) -> ra được nếu có review thì return bạn không thể comment thêm, nếu không có review thì cho phép đi tiếp
router
  .route('/:id')
  .get(getReview)
  .delete(checkUserOwnDoc(Review), deleteReview)
  .patch(checkUserOwnDoc(Review), editReview);

module.exports = router;
