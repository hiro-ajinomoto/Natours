// eslint-disable-next-line arrow-body-style
const catchAsyncRewrite = (fn) => {
  return (req, res, next) => {
    fn.catch((err) => next(err));
  };
};

module.exports = catchAsyncRewrite;
