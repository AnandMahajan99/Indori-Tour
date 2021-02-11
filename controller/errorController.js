const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.keyValue.name;
  const message = `Duplicate field value "${value}" .Please use another valid value.`;
  return new AppError(message, 400);
};

const handleValidationErrordb = err => {
  const errors = Object.values(err.errors)
    .map(el => el.message)
    .join('. ');
  const message = `Invalid input data. ${errors}`;
  return new AppError(message, 400);
};

const handleJWTError = err => new AppError('Invalid token. Log in again.', 401);

const handleJWTExpiredError = err =>
  new AppError('Your token has expired. PLease log in again.', 401);

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }
  // B) Rendered website
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message
  });
};

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // Operational Error : Send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }

    // Programming or other Error : don't leak error details
    // Log error
    console.error('Error', err);

    // Send response
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
  // B) rendered website
  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message
    });
  }

  // Programming or other Error : don't leak error details
  // Log error
  console.error('Error', err);

  // Send response
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later!'
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const { NODE_ENV } = process.env;
  console.log(NODE_ENV);
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
    // } else if (NODE_ENV === 'production') {
  } else {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrordb(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError')
      error = handleJWTExpiredError(error);
    sendErrorProd(error, req, res);
  }
};
