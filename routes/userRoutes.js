const express = require('express');

const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
  logout
  // restrictTo,
} = require('../controllers/authController');

const {
  getAllUsers,
  getUserById,
  updateMe,
  deleteMe,
  deleteUser,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto
} = require('../controllers/userController');

const router = express.Router();

router.use(express.json());

router.post('/signup', signUp);

router.post('/login', login);

router.get('/logout', logout); // if I put this under protect -> no longer work

router.patch('/resetpassword/:token', resetPassword);

router.post('/forgotpassword', forgotPassword);

router.get('/:id', getUserById);

//PROTECT

router.use(protect);

router.get('/me', getMe, getUserById);

router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe); //if method is not matched, the cast error will be popped up

router.delete('/deleteMe', deleteMe);

router.patch('/updatePassword', updatePassword);

//RESTRICT TO
router.use(restrictTo('admin'));

router.route('/').get(getAllUsers);

router.delete('/:id', deleteUser);

module.exports = router;
