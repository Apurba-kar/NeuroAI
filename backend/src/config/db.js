const { v2: cloudinary } = require("cloudinary");
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
  { processedData },
  originalFileName
) => {
  const timestamp = Date.now();
  const baseId = `${originalFileName}_${timestamp}`;

  // Only upload the rendered PNG — raw DICOM is never needed downstream
  // (Gemini and PDF generation both use the PNG) and exceeds Cloudinary's
  // 10 MB free-tier limit for files > 10 MB.
  const imageResult = await uploadToCloudinary(
    processedData.processedImageBuffer,
    {
      folder: "processed/images",
      public_id: baseId,
      resource_type: "image",
      format: processedData.format || "png",
    }
  );

  return {
    imageUrl: imageResult.secure_url,
    // No raw DICOM stored — set to null for schema compatibility
    originalImageUrl: null,
  };
};
