const AppError = require('./appErr');

const checkUserOwnDoc = (Model) => async (req, res, next) => {
  if (req.user.role === 'user') {
    const review = await Model.findById(req.params.id);
    if (review.user.id !== req.user.id) {
      return next(new AppError('You do not own this doc to update', 403));
    }
  }
  next();
};

module.exports = checkUserOwnDoc;
