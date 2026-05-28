const express = require("express");
const multer = require("multer");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

// Configure multer for memory storage
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

// protect all routes after this middleware
router.use(authController.protect);

router.get("/me", userController.getMe, userController.getUser);
router.patch("/updateMe", upload.single("photo"), userController.updateMe);

module.exports = router;
