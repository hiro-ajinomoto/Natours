const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appErr');
const User = require('../models/userModel');

// const AppError = require('../utils/appErr');
const catchAsync = require('../utils/catchAsync');
const filterObject = require('../utils/filterObjects');
const { getOne, getAll } = require('./handlerFactory');

const getAllUsers = getAll(User);

const getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true); // accept file as image
  } else {
    cb(new AppError('Not an image. Please upload only images', 403), false); // reject file
  }
};

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const etx = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${etx}`);
//   }
// });

const multerStorage = multer.memoryStorage();

// const upload = multer({
//   dest: 'public/img/user'
// });

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

const uploadUserPhoto = upload.single('photo');

const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`; // we know it for sure jpeg

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg') // why its named jpeg
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        `This route is not for password updates. Please use ${
          req.protocol
        }://${req.get('host')}/api/v1/updatePassword`,
        400
      )
    );
  }

  const filterBody = filterObject(req.body, 'name', 'email');

  if (req.file) filterBody.photo = req.file.filename;

  const user = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new AppError('This user no longer exists', 400));
  }

  res.status(200).json({
    status: 'success',
    message: 'User has been updated',
    data: {
      user
    }
  });
});

const getUserById = getOne(User, '');

const deleteMe = catchAsync(async (req, res, next) => {
  const { id } = req.user;

  if (!id) {
    return next(new AppError(`User hasn't been provided yet.`, 400));
  }

  const deletedUser = await User.findByIdAndUpdate(id, { active: false });

  if (!deletedUser) {
    return next(new AppError(`User is not exist`, 404));
  }

  res.status(204).json({
    status: 'success',
    message: 'Your account has been deleted',
    data: null
  });
});

const deleteUser = catchAsync(async (req, res, next) => {
  if (!req.params.id) {
    return next(new AppError('UserId is required', 400));
  }

  const deletedUser = await User.findByIdAndDelete(req.params.id);

  if (!deletedUser) {
    return next(new AppError('User is not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'The account has been deleted',
    data: null
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  deleteMe,
  updateMe,
  getMe,
  deleteUser,
  uploadUserPhoto,
  resizeUserPhoto
};
