const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    mimeType: String,
    cloudinaryImageUrl: String,
    originalImageUrl: String,
    data: Object,
    analysisResults: Object,
    status: {
      type: String,
      default: "pending",
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Analysis must belong to a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

analysisSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "firstName lastName email",
  });
  next();
});

const Analysis = mongoose.model("Analysis", analysisSchema);
module.exports = Analysis;
