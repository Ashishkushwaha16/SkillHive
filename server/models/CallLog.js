const mongoose = require("mongoose");

const callLogSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    callee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mode: {
      type: String,
      enum: ["audio", "video"],
      default: "video",
    },
    status: {
      type: String,
      enum: ["ringing", "accepted", "rejected", "missed", "busy", "ended", "cancelled"],
      default: "ringing",
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    connectedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    durationSec: {
      type: Number,
      default: 0,
    },
    endReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

callLogSchema.index({ caller: 1, createdAt: -1 });
callLogSchema.index({ callee: 1, createdAt: -1 });

module.exports = mongoose.model("CallLog", callLogSchema);
