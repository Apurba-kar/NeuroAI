const express = require("express");
const reportController = require("../controllers/reportController");

const router = express.Router({ mergeParams: true });

router.get("/", reportController.generateReport);

module.exports = router;
