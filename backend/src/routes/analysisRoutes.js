const express = require("express");
const multer = require("multer");
const Analysis = require("../models/analysisModel");
const analysisController = require("../controllers/analysisController");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const authController = require("../controllers/authController");
const resultsRouter = require("./reportRoutes");

const router = express.Router();

// Configure multer to use memory storage, holding the file as a Buffer
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

// Nested Route for pdf results
router.use("/:analysisId/results", resultsRouter);

// Upload & anonymize
router.post(
  "/upload",
  upload.single("file"),
  authController.protect,
  analysisController.uploadAndProcess
);

// Get all analyses for a user
router.get("/", authController.protect, analysisController.getAllAnalyses);

// Get results
router.get("/:id", authController.protect, analysisController.getAnalysis);

// Delete analysis case
router.delete("/:id", authController.protect, analysisController.deleteAnalysis);

// Archive analysis case
router.patch("/:id/archive", authController.protect, analysisController.archiveAnalysis);

// Unarchive analysis case
router.patch("/:id/unarchive", authController.protect, analysisController.unarchiveAnalysis);

module.exports = router;
