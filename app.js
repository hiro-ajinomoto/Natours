const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const express = require('express');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const globalErrorHandler = require('./controllers/errorController');

const userRouter = require('./routes/userRoutes');

const tourRouter = require('./routes/tourRoutes');

const reviewRouter = require('./routes/reviewRoutes');

const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const compression = require('compression');

// const pug = require('pug');
// this is recently added to see the green
const AppError = require('./utils/appErr');

const app = express();

// set up PUG
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// GLOBAL MIDDLEWARE
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV !== 'development') {
  app.use(morgan('dev'));
}

//limit request
const limiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 10000,
  message: 'Too many requests, please try again in 2 minutes'
});

app.use(limiter);
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

// app.use(express.json());
app.use(express.json());

app.use(express.urlencoded({ extended: true, limit: '10kb' })); // for submit with url, to get field in html form

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

// prevent parameter pollutions
app.use(
  hpp({
    whitelist: [
      'sort',
      // 'duration',
      // 'name',
      // 'price',
      // 'ratingAverage',
      // 'maxGroupSize',
      'difficulty'
    ]
  })
);

// security http headers
app.use(helmet({ contentSecurityPolicy: false }));

app.use(compression()); // compress texts sent to clients

// TEST middleware
app.use((req, res, next) => {
  // console.log('req.cookies: ', req.cookies);
  next();
});

//handler -> router -> controller/handler
app.use('/api/v1/tours', tourRouter);

app.use('/api/v1/users', userRouter);

app.use('/api/v1/reviews', reviewRouter);

app.use('/api/v1/bookings', bookingRouter);

app.use('/', viewRouter); // if I kep url as /api/v1/views or ad anything after / -> it will not load the css

app.all('*', (req, res, next) => {
  next(
    new AppError(`Can not find this ${req.originalUrl} in this server`, 404)
  );
});

app.use(globalErrorHandler);

module.exports = app;
