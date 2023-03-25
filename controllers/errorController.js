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

const globalErrorHandler = (err, req, res, next) => {
  // cái này sẽ catch hết tất cả các event lỗi đang chạy ngầm
  // if err exist we could set the err.status code

  err.statusCode = err.statusCode || 500;

  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorDev(err, req, res);
  }
};

module.exports = globalErrorHandler;
