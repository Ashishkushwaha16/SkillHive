const User = require("../models/User");
const Review = require("../models/Review");

const MAX_SKILL_LENGTH = 20;
const MAX_ABOUT_LENGTH = 200;

const normalizeSkill = (value) => value.trim().toLowerCase();

const validateSkill = (value) => {
  if (typeof value !== "string") {
    return "Skill must be a text value";
  }

  const normalized = normalizeSkill(value);

  if (!normalized) {
    return "Skill cannot be empty";
  }

  if (normalized.length > MAX_SKILL_LENGTH) {
    return `Skill length must be ${MAX_SKILL_LENGTH} characters or less`;
  }

  return null;
};

const hasSkill = (skills, targetSkill) =>
  skills.some((item) => item.toLowerCase() === targetSkill.toLowerCase());

const hasUserId = (ids, userId) =>
  ids.some((id) => id.toString() === userId.toString());

const removeUserId = (ids, userId) =>
  ids.filter((id) => id.toString() !== userId.toString());

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseSkillQuery = (rawValue) => {
  if (typeof rawValue !== "string") {
    return [];
  }

  const unique = [];
  const seen = new Set();

  rawValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((item) => {
      const normalized = item.toLowerCase();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        unique.push(normalized);
      }
    });

  return unique;
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("connections", "name email skills rating")
      .populate("requestsSent", "name email skills rating")
      .populate("requestsReceived", "name email skills rating");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { skills, addSkill, removeSkill, about } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (typeof addSkill !== "undefined") {
      const skillError = validateSkill(addSkill);
      if (skillError) {
        return res.status(400).json({ message: skillError });
      }

      const nextSkill = normalizeSkill(addSkill);

      if (hasSkill(user.skills, nextSkill)) {
        return res.status(400).json({ message: "Skill already added" });
      }

      user.skills.push(nextSkill);
    }

    if (typeof removeSkill !== "undefined") {
      if (typeof removeSkill !== "string" || !removeSkill.trim()) {
        return res.status(400).json({ message: "Skill cannot be empty" });
      }

      const nextSkill = normalizeSkill(removeSkill);
      user.skills = user.skills.filter(
        (item) => item.toLowerCase() !== nextSkill
      );
    }

    if (Array.isArray(skills)) {
      const uniqueSkills = [];

      for (const item of skills) {
        const skillError = validateSkill(item);
        if (skillError) {
          return res.status(400).json({ message: skillError });
        }

        const normalized = normalizeSkill(item);

        if (!hasSkill(uniqueSkills, normalized)) {
          uniqueSkills.push(normalized);
        }
      }

      user.skills = uniqueSkills;
    }

    if (typeof about !== "undefined") {
      if (typeof about !== "string") {
        return res.status(400).json({ message: "About must be a text value" });
      }

      const normalizedAbout = about.trim();

      if (normalizedAbout.length > MAX_ABOUT_LENGTH) {
        return res.status(400).json({
          message: `About length must be ${MAX_ABOUT_LENGTH} characters or less`,
        });
      }

      user.about = normalizedAbout;
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id).select("-password");

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateUserSkills = async (req, res) => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: "Skills must be an array" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const uniqueSkills = [];

    for (const item of skills) {
      const skillError = validateSkill(item);
      if (skillError) {
        return res.status(400).json({ message: skillError });
      }

      const normalized = normalizeSkill(item);

      if (!hasSkill(uniqueSkills, normalized)) {
        uniqueSkills.push(normalized);
      }
    }

    user.skills = uniqueSkills;
    await user.save();

    const updatedUser = await User.findById(req.user._id).select("-password");
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const { skill, skills, mode } = req.query;
    const filter = {
      _id: { $ne: req.user._id },
    };

    const rawSkillInput =
      typeof skills === "string" && skills.trim() ? skills : skill;
    const requestedSkills = parseSkillQuery(rawSkillInput);

    if (requestedSkills.length > 0) {
      const clauses = requestedSkills.map((item) => ({
        skills: {
          $elemMatch: {
            $regex: `^${escapeRegex(item)}$`,
            $options: "i",
          },
        },
      }));

      if (mode === "all") {
        filter.$and = clauses;
      } else {
        filter.$or = clauses;
      }
    }

    const users = await User.find(filter).select("-password");
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getPlatformOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const developer = await User.findOne({ _id: { $ne: req.user._id } })
      .sort({ createdAt: 1 })
      .select("name email about skills rating connections requestsSent requestsReceived");

    let connectionState = "none";

    if (developer) {
      if (hasUserId(req.user.connections || [], developer._id)) {
        connectionState = "connected";
      } else if (hasUserId(req.user.requestsSent || [], developer._id)) {
        connectionState = "pending";
      } else if (hasUserId(req.user.requestsReceived || [], developer._id)) {
        connectionState = "incoming";
      }
    }

    return res.status(200).json({
      stats: {
        totalUsers,
      },
      developer: developer
        ? {
            _id: developer._id,
            name: developer.name,
            email: developer.email,
            about: developer.about || "",
            skills: developer.skills || [],
            rating: developer.rating ?? 0,
          }
        : null,
      connectionState,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const sendConnectRequest = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.id;

    if (currentUserId.toString() === targetUserId) {
      return res.status(400).json({ message: "You cannot connect with yourself" });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (hasUserId(currentUser.connections, targetUserId)) {
      return res.status(400).json({ message: "You are already connected" });
    }

    if (hasUserId(currentUser.requestsSent, targetUserId)) {
      return res.status(400).json({ message: "Request already sent" });
    }

    if (hasUserId(currentUser.requestsReceived, targetUserId)) {
      return res.status(400).json({ message: "This user has already sent you a request" });
    }

    currentUser.requestsSent.push(targetUserId);
    targetUser.requestsReceived.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    return res.status(200).json({ message: "Connection request sent" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const acceptConnectRequest = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const requesterId = req.params.id;

    const currentUser = await User.findById(currentUserId);
    const requesterUser = await User.findById(requesterId);

    if (!currentUser || !requesterUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!hasUserId(currentUser.requestsReceived, requesterId)) {
      return res.status(400).json({ message: "No request found" });
    }

    currentUser.requestsReceived = removeUserId(currentUser.requestsReceived, requesterId);
    requesterUser.requestsSent = removeUserId(requesterUser.requestsSent, currentUserId);

    if (!hasUserId(currentUser.connections, requesterId)) {
      currentUser.connections.push(requesterId);
    }

    if (!hasUserId(requesterUser.connections, currentUserId)) {
      requesterUser.connections.push(currentUserId);
    }

    await currentUser.save();
    await requesterUser.save();

    return res.status(200).json({ message: "Connection request accepted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const rejectConnectRequest = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const requesterId = req.params.id;

    const currentUser = await User.findById(currentUserId);
    const requesterUser = await User.findById(requesterId);

    if (!currentUser || !requesterUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!hasUserId(currentUser.requestsReceived, requesterId)) {
      return res.status(400).json({ message: "No request found" });
    }

    currentUser.requestsReceived = removeUserId(currentUser.requestsReceived, requesterId);
    requesterUser.requestsSent = removeUserId(requesterUser.requestsSent, currentUserId);

    await currentUser.save();
    await requesterUser.save();

    return res.status(200).json({ message: "Connection request rejected" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    // Get users sorted by rating (descending), then by skill count (descending)
    const topUsers = await User.find({})
      .select("name email skills rating about")
      .sort({ rating: -1, createdAt: 1 })
      .limit(limit);

    // Add skill count and rank
    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      _id: user._id,
      name: user.name,
      email: user.email,
      skills: user.skills || [],
      skillCount: (user.skills || []).length,
      rating: user.rating ?? 0,
      about: user.about || "",
    }));

    return res.status(200).json(leaderboard);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const rateUser = async (req, res) => {
  try {
    const { ratedUserId } = req.params;
    const { rating, comment } = req.body;
    const currentUserId = req.user._id;

    // Validation
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    if (currentUserId.toString() === ratedUserId) {
      return res.status(400).json({ message: "You cannot rate yourself" });
    }

    const ratedUser = await User.findById(ratedUserId);
    const currentUser = await User.findById(currentUserId);

    if (!ratedUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!hasUserId(currentUser.connections, ratedUserId)) {
      return res.status(400).json({
        message: "You can only rate users you are connected with",
      });
    }

    const safeComment =
      typeof comment === "string" ? comment.trim().slice(0, 300) : "";

    await Review.findOneAndUpdate(
      { reviewer: currentUserId, reviewee: ratedUserId },
      {
        $set: {
          rating,
          comment: safeComment,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    const [summary] = await Review.aggregate([
      {
        $match: {
          reviewee: ratedUser._id,
        },
      },
      {
        $group: {
          _id: "$reviewee",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const avgRating = summary ? summary.avgRating : 0;
    const reviewsCount = summary ? summary.count : 0;

    ratedUser.rating = Math.round(avgRating * 10) / 10;
    await ratedUser.save();

    return res.status(200).json({
      message: "Rating submitted successfully",
      newRating: ratedUser.rating,
      reviewsCount,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ reviewee: userId })
      .populate("reviewer", "name email")
      .select("rating comment reviewer createdAt updatedAt")
      .sort({ updatedAt: -1 });

    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateUserSkills,
  getUsers,
  getPlatformOverview,
  sendConnectRequest,
  acceptConnectRequest,
  rejectConnectRequest,
  getLeaderboard,
  rateUser,
  getUserReviews,
};
