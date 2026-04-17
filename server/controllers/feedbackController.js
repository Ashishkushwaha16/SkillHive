const Feedback = require("../models/Feedback");

const submitFeedback = async (req, res) => {
  try {
    const { category, message } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Feedback message is required" });
    }

    if (message.trim().length < 8) {
      return res
        .status(400)
        .json({ message: "Feedback message should be at least 8 characters" });
    }

    const allowedCategories = new Set(["general", "bug", "feature", "ui"]);
    const resolvedCategory = allowedCategories.has(category) ? category : "general";

    const feedback = await Feedback.create({
      user: req.user._id,
      category: resolvedCategory,
      message: message.trim(),
    });

    return res.status(201).json({
      message: "Thanks for your feedback",
      feedbackId: feedback._id,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitFeedback,
};
