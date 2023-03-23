const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    minLength: [5, 'Name must be between 5 and 40 characters'],
    maxLength: [40, 'Name must be between 5 and 40 characters']
  },
  email: {
    type: String,
    trim: true,
    required: [true, 'Please provide your email address'],
    unique: true,
    lowerCase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'guide', 'lead-guide'],
    default: 'user'
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  password: {
    type: String,
    trim: true,
    required: [true, 'Please provide your password'],
    validate: {
      validator: function(password) {
        //*
        const value = validator.isStrongPassword(password, { minLength: 10 });
        return value;
      },
      message:
        'Your password must be at least 10 letters, 1 number ,1 uppercase and 1 lowercase'
    }
  },
  passwordConfirm: {
    // this only work in CREATE  and SAVE , not UPDATE
    type: String,
    required: [true, 'You should provide a password confirm'],
    trim: true,
    validate: {
      validator: function(passwordConfirm) {
        return passwordConfirm === this.password;
      },
      message: 'Password confirmation must be as same as password'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre('save', async function(next) {
  // this will not work for UPDATES as well

  if (!this.isModified('password')) return next();

  // if password has already been updated then it has to rehash
  this.password = await bcrypt.hash(this.password, 12); // there is a async ver here

  this.passwordConfirm = undefined; // we only need passwordConfirm in advance save hashed password on db

  next();
});

// good trick to make controller thinner, but this takes longer because interfere hooks -> not recommended
userSchema.pre('save', async function(next) {
  // this will not work for UPDATES as well
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // - 1000 milisecond - as the slow hook interfere

  next();
});

userSchema.pre(/^find/, function(next) {
  // trick to find users which is active = true
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.isCorrectPassword = async function(
  candidatePassword,
  databaseUserPassword
) {
  return await bcrypt.compare(candidatePassword, databaseUserPassword);
};

userSchema.methods.changedPasswordAfter = async function(JWTTimeStamp) {
  if (this.passwordChangedAt) {
    // compare this token is available
    // by compare the latest password has been changed with the iat

    const passwordChangedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    //if date format was in integer, thing born fist -> bigger -> born after -> smaller
    return JWTTimeStamp < passwordChangedTimeStamp;
    // this means if jwtTimeStamp is after the passwordChangeTime so that jwt is still available, if not jwt is unavailable
  }
  return false;
};

userSchema.methods.createResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // hash password reset token and save it on the database
  this.passwordResetToken = crypto
    .createHash('sha256') // what is create hash
    .update(resetToken) // why need to update-> this is not mutate
    .digest('hex'); // what is digest

  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
