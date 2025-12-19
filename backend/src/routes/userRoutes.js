const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

// protect all routes after this middleware
router.use(authController.protect);

router.get("/me", userController.getMe, userController.getUser);
router.patch("/updateMe", userController.updateMe);

module.exports = router;
