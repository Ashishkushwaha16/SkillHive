const CallLog = require("../models/CallLog");

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

const getCallHistory = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const limit = Math.min(parsePositiveInt(req.query.limit, 40), 100);

    const logs = await CallLog.find({
      $or: [{ caller: currentUserId }, { callee: currentUserId }],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("caller", "name email avatar")
      .populate("callee", "name email avatar");

    return res.status(200).json(logs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCallHistory,
};
