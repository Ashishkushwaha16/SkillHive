const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["general", "bug", "feature", "ui"],
      default: "general",
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200,
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Feedback", feedbackSchema);
