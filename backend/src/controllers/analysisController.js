const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Analysis = require("../models/analysisModel");
const sharp = require("sharp");
const fileType = require("file-type");
const ExifReader = require("exifreader");

const {
  parseDicomFile,
  renderDicomToRgba,
  encodeRgbaToPng,
} = require("../utils/dicomProcessor");
const cloudinaryUploader = require("../config/db");
const { generateContentFromImage } = require("../services/geminiService");
const PROMPT = require("../config/constant");

// ----- Processing Functions -----
async function processDicom(buffer) {
  // Stage 1: Parse — destructure only the safe scalar metadata.
  // parseDicomFile also returns rawPixelData (Uint8Array) and dataSet
  // (full binary DICOM object). Those must NOT be stored in MongoDB —
  // BSON will throw "offset is out of bounds" trying to serialize them.
  const { metadata } = await parseDicomFile(buffer);

  // Stage 2: Render DICOM to RGBA
  const { rgbaBuffer, width, height } = await renderDicomToRgba(buffer);

  // Stage 3: Encode RGBA to PNG
  const pngBuffer = await encodeRgbaToPng(rgbaBuffer, width, height);

  return {
    processedImageBuffer: pngBuffer,
    format: "png",
    metadata: metadata || {},
  };
}

async function processJpg(buffer) {
  try {
    // --- Metadata Extraction ---
    let exifData = {};
    try {
      const tags = ExifReader.load(buffer);
      // We can cherry-pick important tags or stringify the whole object
      if (tags.DateTimeOriginal) {
        exifData.DateTimeOriginal = tags.DateTimeOriginal.description;
      }
      if (tags.GPSLatitude && tags.GPSLongitude) {
        exifData.GPS = {
          Latitude: tags.GPSLatitude.description,
          Longitude: tags.GPSLongitude.description,
        };
      }
      if (tags.Make && tags.Model) {
        exifData.Camera = `${tags.Make.description} ${tags.Model.description}`;
      }

      console.log("Extracted EXIF data:", exifData);
    } catch (exifError) {
      console.log("No EXIF data found or error parsing it.");
    }

    // --- Image Normalization ---
    // Resize large images to a max dimension to save on API costs and improve latency.
    const metadata = await sharp(buffer).metadata();
    let processedImageBuffer = buffer;

    const MAX_DIMENSION = 2048;
    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
      console.log(`Resizing image from ${metadata.width}x${metadata.height}`);
      processedImageBuffer = await sharp(buffer)
        .resize({
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 90 })
        .toBuffer();
    }

    return {
      processedImageBuffer,
      format: "jpeg",
      metadata: exifData,
    };
  } catch (error) {
    console.error("Error processing JPG file:", error);
    throw new AppError("Failed to process JPG image.", 500);
  }
}

async function processPdf(buffer) {
  console.log("Routing to PDF processor...");
  // Full implementation in Section 3
  return {
    processedImageBuffer: buffer,
    format: "pdf",
    metadata: {},
  };
}

// ---- Upload & Process ----
exports.uploadAndProcess = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("No file uploaded", 400));
  }
  const buffer = req.file.buffer;
  const clientMime = req.file.mimetype;

  // get file type from buffer
  const filetype = await fileType.fromBuffer(buffer);
  if (!filetype) {
    return next(new AppError("Could not determine file type", 400));
  }
  console.log("Client MIME:", clientMime);
  console.log("Dectected MIME:", filetype.mime);
  // Security check:
  // if (clientMime !== filetype.mime) {
  //   return next(new AppError("MIME type mismatch", 400));
  // }

  // Route the buffer to the correct processing function
  const processingMap = {
    "application/dicom": processDicom,
    "image/jpeg": processJpg,
    "application/pdf": processPdf,
  };
  const processFunction = processingMap[filetype.mime];
  if (!processFunction) {
    return next(new AppError("Unsupported file type", 400));
  }
  const { processedImageBuffer, format, metadata } = await processFunction(
    buffer
  );

  // Analyze with Gemini API
  const report = await generateContentFromImage(
    PROMPT,
    processedImageBuffer,
    format
  );

  // console.log("Gemini Report:", report);
  let cleanJson = report;
  const jsonMatch = report.match(/```json\s*([\s\S]*?)\s*```/) || report.match(/```\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    cleanJson = jsonMatch[1];
  }
  cleanJson = cleanJson.trim();

  let parsedResponse = {};
  try {
    parsedResponse = JSON.parse(cleanJson);
  } catch (parseErr) {
    console.error("Failed to parse Gemini JSON, falling back to manual parsing:", parseErr);
    // Try to extract any JSON-like structure or throw a clean error
    throw new AppError("Failed to parse analysis results from AI response", 500);
  }

  // Safely extract report data
  let reportData = {};
  if (parsedResponse.PROMPT && parsedResponse.PROMPT.report) {
    reportData = parsedResponse.PROMPT.report;
  } else if (parsedResponse.report) {
    reportData = parsedResponse.report;
  } else if (parsedResponse.scan_information) {
    reportData = parsedResponse;
  } else {
    reportData = parsedResponse;
  }

  // Upload PNG to Cloudinary (raw DICOM buffer is never sent — only the rendered PNG)
  const { imageUrl, originalImageUrl } =
    await cloudinaryUploader.storeProcessedAssets(
      { processedData: { processedImageBuffer, format } },
      req.file.originalname
    );

  // Save to MongoDB
  const analysis = await Analysis.create({
    user: req.user.id,
    mimeType: filetype.mime,
    format,
    data: metadata || {},
    analysisResults: reportData || {},
    cloudinaryImageUrl: imageUrl,
    originalImageUrl: originalImageUrl,
    status: "completed",
    uploadedAt: Date.now(),
  });

  res.status(200).json({
    status: "success",
    analysis,
  });
});

// ---- Get Analysis by ID ----
exports.getAnalysis = catchAsync(async (req, res, next) => {
  const analysis = await Analysis.findById(req.params.id);
  if (!analysis) {
    return next(new AppError("No analysis found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    analysis,
  });
});

// ---- Get All Analyses for a User ----
exports.getAllAnalyses = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const filter = { user: userId };
  if (req.query.archived === "true") {
    filter.isArchived = true;
  } else {
    filter.isArchived = { $ne: true };
  }

  const allAnalyses = await Analysis.find(filter).sort({
    uploadedAt: -1,
  });
  res.status(200).json({
    status: "success",
    results: allAnalyses.length,
    analyses: allAnalyses,
  });
});

// ---- Delete Analysis ----
exports.deleteAnalysis = catchAsync(async (req, res, next) => {
  const doc = await Analysis.findByIdAndDelete(req.params.id);
  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

// ---- Archive Analysis ----
exports.archiveAnalysis = catchAsync(async (req, res, next) => {
  const analysis = await Analysis.findByIdAndUpdate(
    req.params.id,
    { isArchived: true },
    { new: true, runValidators: true }
  );
  if (!analysis) {
    return next(new AppError("No document found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    analysis,
  });
});

// ---- Unarchive Analysis ----
exports.unarchiveAnalysis = catchAsync(async (req, res, next) => {
  const analysis = await Analysis.findByIdAndUpdate(
    req.params.id,
    { isArchived: false },
    { new: true, runValidators: true }
  );
  if (!analysis) {
    return next(new AppError("No document found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    analysis,
  });
});
