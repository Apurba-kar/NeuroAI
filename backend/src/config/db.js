const { v2: cloudinary } = require("cloudinary");
const { format } = require("sharp");
const { Readable } = require("stream");
const AppError = require("../utils/appError");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Upload to Cloudinary

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

exports.storeProcessedAssets = async (
  { processedData, originalData },
  originalFileName
) => {
  console.log(originalData);
  try {
    const timestamp = Date.now();
    const baseId = `${originalFileName}_${timestamp}`;
    //Upload processed photo
    const imageResult = await uploadToCloudinary(
      processedData.processedImageBuffer,
      {
        folder: "processed/images",
        public_id: baseId,
        resource_type: "image",
        format: processedData.format || "png",
      }
    );

    // --- Upload original file ---
    const isDicom =
      originalData.format === "dicom" ||
      originalFileName.toLowerCase().endsWith(".dcm");

    const originalResult = await uploadToCloudinary(
      originalData.buffer || originalData.processedImageBuffer,
      {
        folder: isDicom ? "original/dicom" : "original/files",
        public_id: baseId,
        resource_type: isDicom ? "raw" : "image",
        format: isDicom ? "dcm" : originalData.format || "png",
      }
    );

    return {
      imageUrl: imageResult.secure_url,
      originalImageUrl: originalResult.secure_url,
    };
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw new AppError("Failed to upload processed assets.", 500);
  }
};
