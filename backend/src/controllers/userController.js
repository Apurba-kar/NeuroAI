const User = require("../models/userModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { v2: cloudinary } = require("cloudinary");
const { Readable } = require("stream");

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    const readableStream = new Readable();
    readableStream._read = () => {};
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

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
  const filteredBody = filterObj(req.body, "firstName", "lastName", "email", "institution", "photo");

  //3) If a file is uploaded, send it to Cloudinary
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: "profile_photos",
        resource_type: "image",
      });
      filteredBody.photo = result.secure_url;
    } catch (cloudinaryErr) {
      console.error("Cloudinary upload failed for user photo:", cloudinaryErr);
      return next(new AppError("Failed to upload profile photo to cloud storage", 500));
    }
  }

  //4) Update user document
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
