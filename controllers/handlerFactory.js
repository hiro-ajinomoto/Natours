const APIFeatures = require('../utils/apiFeature');
const AppError = require('../utils/appErr');
const catchAsync = require('../utils/catchAsync');

const deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    // authorization
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No doc found with this id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: null
    });
  });

const createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        doc
      }
    });
  });

const updateOne = Model =>
  catchAsync(async (req, res, next) => {
    // check if review belongs to this user

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true
    });

    console.log('updateONe- req.body: ', req.body);
    if (!doc) {
      return next(new AppError('No doc found with this id', 404));
    }

    res.status(202).json({
      status: 'success',
      data: { doc }
    });
  });

const getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    if (!req.params.id) {
      return next(new AppError('No id to found', 400));
    }
    let query = Model.findById(req.params.id);

    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query; //* this populate show the virtual value

    if (!doc) {
      return next(new AppError('No doc with that id', 404));
    }

    res.status(200).json({
      message: 'success',
      results: doc.length,
      data: doc
    });
  });

const getAll = Model =>
  catchAsync(async (req, res, next) => {
    // to allow for nested GEt review on tour
    let filter = {};

    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        docs
      }
    });
  });

module.exports = { deleteOne, createOne, updateOne, getOne, getAll };
