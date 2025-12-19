const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];

  const message = `Duplicate Filed value:${value}. please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const erx = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${erx.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired. Please login again.", 401);

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // B) RENDERED WEBSITE
  console.error("ERROR 💥", err);
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // A)API
  if (req.originalUrl.startsWith("/api")) {
    // A) Operationl , trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) Programming or other unknown error: don't leak error details to client
    //1)Log error
    console.error("ERROR 💥", err);
    //2) Send generic message
    return res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
  //B) RENDERED WEBSITE
  // A) Operationl , trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // B) Programming or other unknown error: don't leak error details to client
  //1)Log error
  console.error("ERROR 💥", err);
  //2) Send generic message
  return res.status(err.statusCode).json({
    status: "error",
    message: "Please try again later.",
  });
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = err;
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateErrorDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    sendErrorProd(error, req, res);
  }
};
