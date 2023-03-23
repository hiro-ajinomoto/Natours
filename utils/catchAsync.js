const AppError = require('./appErr');

// eslint-disable-next-line arrow-body-style
module.exports = (fn) => {
  // take in a function and return that function with req, res and next
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      next(new AppError(err));
    });
  };
};
