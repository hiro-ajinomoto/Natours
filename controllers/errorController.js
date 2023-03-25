const AppError = require('../utils/appErr');

// const handleCastErrorDB = err => {
//   // const message = `Invalid ${err.path}: ${err.value}`;
//   const message = `Invalid ${err.path}: ${err.value}.`;
//   return new AppError(message, 400);
// };

// const handleDuplicateFieldsDB = err => {
//   // this  err is supposed to have the err.mess then we grab the value which placed in between the quotation mark
//   const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/i)[0]; // it returns a array of strings / index 0 is what we need
//   const message = `Duplicate value: ${value}. Please use another values`;

//   return new AppError(message, 400);
// };

// // const handleValidationErrors = err => {
// //   // error trả về không giống do khác phiên bản nên chức năng này xem như vứt
// //   const errors = Object.values(err.errors).map(ele => ele.message);

// //   const messages = `Invalid input data: ${errors.join(', ')}`;

// //   return new AppError(messages, 400);
// // };

// const handleJWTError = err =>
//   new AppError('Invalid token, please login again', 401);

// const handleJWTExpiredError = err =>
//   new AppError('Your token has expired! Please Login again', 401);

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        name: err.name,
        status: err.status,
        error: err,
        message: err.message
        // stack: err.stack,
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'It is wrong somewhere'
      });
    }
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message
    });
  }
};

// const sendErrorProd = (err, req, res) => {
//   // operational, trusted error: send message to client

//   if (req.originalUrl.startsWith('/api')) {
//     if (err.isOperational) {
//       res.status(err.statusCode).json({
//         status: err.status,
//         message: err.message
//       });
//       // programing or other unknown error: don't leak details
//     } else {
//       console.error('ERROR 👩‍🦲: ', err);

//       res.status(500).json({
//         status: 'error',
//         message: 'It must be wrong somewhere'
//       });
//     }
//   }

//   if (err.isOperational) {
//     console.log(err);
//     return res.status(err.statusCode).render('error', {
//       title: 'Something went wrong',
//       msg: err.message
//     });
//     // programing or other unknown error: don't leak details
//   }

//   console.error('ERROR 👩‍🦲: ', err);

//   return res.status(err.statusCode).render('error', {
//     title: 'Something went wrong',
//     msg: 'Please try again later' //-> different here
//   });
// };

const globalErrorHandler = (err, req, res, next) => {
  // cái này sẽ catch hết tất cả các event lỗi đang chạy ngầm
  // if err exist we could set the err.status code

  err.statusCode = err.statusCode || 500;

  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    //send meaningful error message to clients
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    // if (err) {
    //   // let error = Object.assign(err); //*
    //   let error = { ...err };
    //   error.message = err.message;
    //   if (error.name === 'CastError') {
    //     // cái này đáng ra nên là CastError - handle invalid ID - to clients / do lỗi mongose nên không thực hiện được chức năng này
    //     // hoặc có thể do mongoose đã biến lỗi invalid ID thành error, không còn CastError nữa -> có thể xử lý theo 1 cách khác
    //     error = handleCastErrorDB(err);
    //   }
    //   // handle duplicate filed to clients
    //   // cái này chỉ catch được lỗi khi nó ra được đúng lỗi
    //   // tạm thời mongoose phiên bản đang có vấn đề nên không thể thực hiện được mấy chức năng này
    //   if (error.name === 11000) {
    //     error = handleDuplicateFieldsDB(error);
    //   }
    //   // if (error.name === 'Error') {
    //   //   error = handleValidationErrors(error);
    //   // }
    //   if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    //   if (error.name === 'TokenExpiredError')
    //     error = handleJWTExpiredError(error);
    //   // because all err.name is default set 'Error' so we cant decided cases base on err.name
    //   // we could use the err.mess startsWith('TokenExpiredError')
    //   sendErrorProd(error, req, res);
    // }
  }
};

module.exports = globalErrorHandler;
