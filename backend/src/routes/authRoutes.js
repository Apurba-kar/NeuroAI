const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.get("/logout", authController.logout);

// check if user is logged in or not
router.get("/me", authController.protect, (req, res) => {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  });
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.patch("/updatePassword", authController.protect, authController.updatePassword);

module.exports = router;
