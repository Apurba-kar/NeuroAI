const User = require("../models/userModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getMe = (req, res, next) => {
  // Set the user ID from the authenticated user for the factory function
  req.params.id = req.user.id;
  next();
};

const filterObj = (obj, ...allowedfildes) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedfildes.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }
  //2)Filtered out unwanted fields names that are not allowed to be Updated
  const filteredBody = filterObj(req.body, "firstName", "lastName", "email");
  if (req.file) filteredBody.photo = req.file.filename;

  //3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.getUser = factory.getOne(User);
