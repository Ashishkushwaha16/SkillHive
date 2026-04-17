const mongoose = require("mongoose");

const adminActionLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    adminEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    method: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    path: {
      type: String,
      required: true,
      trim: true,
    },
    ip: {
      type: String,
      trim: true,
      default: "",
    },
    userAgent: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

adminActionLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AdminActionLog", adminActionLogSchema);
