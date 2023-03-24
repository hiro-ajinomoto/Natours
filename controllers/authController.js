const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const { promisify } = require('util');
// const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appErr');
const sendEmail = require('../utils/email');
const filterObject = require('../utils/filterObjects');
const Email = require('../utils/email');
// const crypto = require('crypto');

const tokenGeneratedById = id =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

// const isValidToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

const createSendToken = (user, statusCode, res) => {
  //*
  const token = tokenGeneratedById(user.id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000 // transfer this into milisecond
    ),
    httpOnly: false,
    secure: false
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; //*

  res.cookie('jwt', token, cookieOptions); //*

  user.password = undefined; //* hide password from output -> only affect in result -> not affect the database password

  res.status(statusCode).json({
    status: 'success',
    data: { user },
    token
  });
};

const signUp = catchAsync(async (req, res, next) => {
  const filterBody = filterObject(
    //*
    req.body,
    'name',
    'email',
    'photo',
    'password',
    'passwordConfirm'
  );

  const newUser = await User.create(filterBody);

  // const url = 'http://localhost:5000/me';
  const url = `${req.protocol}://${req.get('host')}/me`; // this only work for frontend and backend put in the same place

  await new Email(newUser, url).sendWelcome(); //***

  createSendToken(newUser, 201, res);
});

const login = async (req, res, next) => {
  const { email } = req.body;

  const candidatePassword = req.body.password;

  //1) check if email and password are existed
  if (!email || !candidatePassword) {
    return next(new AppError('Email and password must be provided', 400));
  }

  if ((await validator.isEmail(email)) === false) {
    return next(new AppError('Email is not valid', 400));
  }

  //2) check is user exists $password is correct
  const user = await User.findOne({ email: email }); // we can do the findOne().select('+password') instead

  const isPasswordCorrect = await bcrypt.compare(
    candidatePassword,
    user.password
  );

  if (!user || !isPasswordCorrect) {
    next(new AppError('Your email or password is not correct', 400));
  }

  if (isPasswordCorrect) {
    createSendToken(user, 200, res);
  } else {
    return next(new AppError('Password is not correct', 400));
  }
};

const logout = async (req, res, next) => {
  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    status: 'success'
  });
};

const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt; // they get token from cookies
  }

  if (!token) {
    return next(new AppError("You haven't logged in", 400));
  }

  // verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if user exists
  const currentUser = await User.findById(decoded.id);

  // check if user changed password after the token  was issued
  if (!currentUser) {
    return next(
      new AppError(
        'The user belongs to this token has been no longer exists',
        404
      )
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat) === true) {
    return next(
      new AppError(
        'The password has been changed recently. Please login again!',
        401
      )
    );
  }
  req.user = currentUser;
  res.locals.user = currentUser; // this become global variable in pug
  next();
});

const isLoggedIn = async (req, res, next) => {
  // we don't use catchAsync here
  //****
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next();
      }

      if (currentUser.changedPasswordAfter(decoded.iat) === true) {
        return next();
      }

      res.locals.user = currentUser; // *** this can be use anywhere in pug -> look at _header to see more
      return next();
    } catch (error) {
      return next();
    }
  }
  // if there is no logged in user, they still can look at something
  next();
};

const restrictTo = (...role) => (req, res, next) => {
  // if (!role) {
  //   return next(new AppError('You have no permission to perform this', 400));
  // }

  if (role.includes(req.user.role) === false) {
    return next(
      new AppError('You have no permission to perform this action', 403) // forbidden is 3
    );
  }

  next();
};

const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Your email must be provided', 400));
  }

  if (!validator.isEmail(email)) {
    return next(new AppError('Your email is invalid', 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('There is no user with this email', 404));
  }

  //2) generate random reset token
  const resetToken = await user.createResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token (valid in 10 min)',
    //   message: message
    // });

    //3) send resetToken url to   user's email
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/users/resetpassword/${resetToken}`; //***

    const message = `Forgot your password? Submit a patch request with your new password and confirmed password to ${resetUrl} \nIf you didn't forget your password, please ignore this email!`;

    await new Email(user, resetUrl).sendPasswordReset();
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending email. Try again later', 400)
    );
  }

  res.status(200).json({
    status: 'success',
    message: `Reset token has been sent to your email. Please check your email: ${user.email}`
  });
});

const resetPassword = catchAsync(async (req, res, next) => {
  //1) get user from the token
  const { token } = req.params;

  if (!token) {
    return next(new AppError('Token is missing. Please try again later', 400));
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({ passwordResetToken: hashedToken });

  if (!user) {
    return next(new AppError('Can not find user with this token', 400));
  }

  //2) if token has not expired, there is user, set the new password
  const isTokenAvailable = Date.now() < user.passwordResetExpire;

  if (!isTokenAvailable) {
    return next(new AppError('Reset token is expired. Please start over', 400));
  }

  user.password = req.body.password;

  user.passwordConfirm = req.body.passwordConfirm;

  //3) update changePasswordAt property of the user
  // user.passwordChangedAt = Date.now();

  user.passwordResetExpire = undefined;

  user.passwordResetToken = undefined;

  await user.save();

  //4) log the user in, send jwt
  const logInToken = tokenGeneratedById(user.id);

  res.status(200).json({
    status: 'success',
    message: 'Password has been already reset!',
    token: logInToken,
    data: {
      email: user.email,
      newPassword: req.body.password
    }
  });
});

const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, passwordConfirm } = req.body;

  const id = req.user.id;

  if (!currentPassword || !newPassword || !passwordConfirm) {
    return next(
      new AppError(
        'current password, new password or password confirm is missing',
        400
      )
    );
  }

  if (passwordConfirm !== newPassword) {
    return next(new AppError('Password confirm must be same as new password'));
  }
  const user = await User.findById(id);

  if (!user) {
    return next(new AppError('Cant find user with this id', 400));
  }

  const isPasswordCorrect = await user.isCorrectPassword(
    currentPassword,
    user.password
  );

  if (!isPasswordCorrect) {
    return next(new AppError('current password is incorrect', 400));
  }

  // if we use fingOneAndUdate this will not work
  user.passwordConfirm = passwordConfirm;

  user.password = newPassword;

  await user.save();

  const newToken = tokenGeneratedById(id);

  res.status(200).json({
    status: 'success',
    token: newToken,
    message: `Password has been updated successfully \n newPassword: ${newPassword}`
  });
});

module.exports = {
  signUp,
  login,
  logout,
  protect,
  isLoggedIn,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  tokenGeneratedById
};
