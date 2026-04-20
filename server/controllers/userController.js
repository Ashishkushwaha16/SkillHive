const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Review = require("../models/Review");
const { hasCloudinaryConfig, uploadBuffer, deleteAsset } = require("../config/cloudinary");
const { createUserNotification } = require("../utils/notificationService");

const MAX_SKILL_LENGTH = 20;
const MAX_ABOUT_LENGTH = 200;
const MAX_ACHIEVEMENTS = 20;
const MAX_ACHIEVEMENT_LENGTH = 120;

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

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

const normalizeSortOrder = (value) =>
  value === "asc" || value === "1" ? 1 : -1;

const computeMatchScore = (currentSkills, targetSkills) => {
  const mine = new Set((currentSkills || []).map((item) => item.toLowerCase()));
  const theirs = [...new Set((targetSkills || []).map((item) => item.toLowerCase()))];

  if (!mine.size || !theirs.length) {
    return {
      score: 0,
      matchedSkills: [],
      missingSkills: theirs,
    };
  }

  const matchedSkills = theirs.filter((skill) => mine.has(skill));
  const missingSkills = theirs.filter((skill) => !mine.has(skill));
  const score = Math.round((matchedSkills.length / theirs.length) * 100);

  return {
    score,
    matchedSkills,
    missingSkills,
  };
};

const parseAchievements = (input) => {
  if (typeof input === "undefined") {
    return null;
  }

  let parsed = input;

  if (typeof input === "string") {
    try {
      parsed = JSON.parse(input);
    } catch (error) {
      parsed = input
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  if (!Array.isArray(parsed)) {
    return null;
  }

  const unique = [];
  const seen = new Set();

  for (const item of parsed) {
    if (typeof item !== "string") {
      continue;
    }

    const clean = item.trim();
    if (!clean) {
      continue;
    }

    const short = clean.slice(0, MAX_ACHIEVEMENT_LENGTH);
    const key = short.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(short);

    if (unique.length >= MAX_ACHIEVEMENTS) {
      break;
    }
  }

  return unique;
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("connections", "name email skills rating avatar privacy")
      .populate("requestsSent", "name email skills rating avatar")
      .populate("requestsReceived", "name email skills rating avatar");

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
    const { skills, addSkill, removeSkill, about, achievements } = req.body;

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

    if (typeof achievements !== "undefined") {
      const nextAchievements = parseAchievements(achievements);
      if (nextAchievements === null) {
        return res
          .status(400)
          .json({ message: "Achievements must be an array or newline separated text" });
      }
      user.achievements = nextAchievements;
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id).select("-password");

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateProfileAssets = async (req, res) => {
  try {
    if (!hasCloudinaryConfig()) {
      return res.status(500).json({
        message:
          "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const avatarFile = req.files?.avatar?.[0];
    if (avatarFile) {
      if (!avatarFile.mimetype.startsWith("image/")) {
        return res.status(400).json({ message: "Avatar must be an image file" });
      }

      if (user.avatar?.publicId) {
        await deleteAsset(user.avatar.publicId, { resource_type: "image" });
      }

      const upload = await uploadBuffer(avatarFile.buffer, {
        folder: "skillhive/avatars",
        resource_type: "image",
      });

      user.avatar = {
        url: upload.secure_url,
        publicId: upload.public_id,
      };
    }

    const resumeFile = req.files?.resume?.[0];
    if (resumeFile) {
      if (resumeFile.mimetype !== "application/pdf") {
        return res.status(400).json({ message: "Resume must be a PDF file" });
      }

      const upload = await uploadBuffer(resumeFile.buffer, {
        folder: "skillhive/resumes",
        resource_type: "raw",
      });

      user.resume = {
        url: upload.secure_url,
        publicId: upload.public_id,
        name: resumeFile.originalname,
      };
    }

    const certificateFiles = req.files?.certificates || [];
    if (certificateFiles.length) {
      for (const file of certificateFiles.slice(0, 5)) {
        const isPdf = file.mimetype === "application/pdf";
        const isImage = file.mimetype.startsWith("image/");
        if (!isPdf && !isImage) {
          return res.status(400).json({
            message: "Certificates must be PDF or image files",
          });
        }

        const upload = await uploadBuffer(file.buffer, {
          folder: "skillhive/certificates",
          resource_type: isPdf ? "raw" : "image",
        });

        user.certificates.push({
          url: upload.secure_url,
          publicId: upload.public_id,
          name: file.originalname,
          uploadedAt: new Date(),
        });
      }
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id).select("-password");
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteProfileAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.avatar?.url && !user.avatar?.publicId) {
      return res.status(200).json({ message: "Avatar already removed" });
    }

    if (user.avatar?.publicId) {
      await deleteAsset(user.avatar.publicId, { resource_type: "image" });
    }

    user.avatar = {
      url: "",
      publicId: "",
    };
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

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 6 || newPassword.length > 64) {
      return res
        .status(400)
        .json({ message: "New password must be between 6 and 64 characters" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.authProvider = "local";
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const changeEmail = async (req, res) => {
  try {
    const { newEmail, password } = req.body;

    if (typeof newEmail !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "New email and password are required" });
    }

    const normalizedEmail = newEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: "Please provide a valid email" });
    }

    const user = await User.findById(req.user._id).select("+password email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    if (user.email === normalizedEmail) {
      return res.status(400).json({ message: "New email cannot be same as current email" });
    }

    const existing = await User.findOne({ email: normalizedEmail }).select("_id");
    if (existing) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    user.email = normalizedEmail;
    await user.save();

    return res.status(200).json({
      message: "Email changed successfully",
      email: normalizedEmail,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updatePrivacySettings = async (req, res) => {
  try {
    const { showOnlineStatus } = req.body;
    if (typeof showOnlineStatus !== "boolean") {
      return res.status(400).json({ message: "showOnlineStatus must be boolean" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.privacy = {
      ...(user.privacy || {}),
      showOnlineStatus,
    };
    await user.save();

    return res.status(200).json({
      message: "Privacy settings updated",
      privacy: user.privacy,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const {
      skill,
      skills,
      mode,
      minRating,
      maxRating,
      sortBy,
      sortOrder,
      page,
      limit,
    } = req.query;
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

    if (typeof minRating !== "undefined" || typeof maxRating !== "undefined") {
      filter.rating = {};

      if (typeof minRating !== "undefined" && minRating !== "") {
        const parsedMin = Number(minRating);
        if (!Number.isNaN(parsedMin)) {
          filter.rating.$gte = parsedMin;
        }
      }

      if (typeof maxRating !== "undefined" && maxRating !== "") {
        const parsedMax = Number(maxRating);
        if (!Number.isNaN(parsedMax)) {
          filter.rating.$lte = parsedMax;
        }
      }

      if (!Object.keys(filter.rating).length) {
        delete filter.rating;
      }
    }

    const allowedSortFields = new Set(["rating", "name", "createdAt"]);
    const resolvedSortField = allowedSortFields.has(sortBy) ? sortBy : "rating";
    const resolvedSortOrder = normalizeSortOrder(sortOrder);

    const pageNumber = parsePositiveInt(page, 1);
    const pageSize = Math.min(parsePositiveInt(limit, 200), 200);
    const skipCount = (pageNumber - 1) * pageSize;

    const users = await User.find(filter)
      .select("-password")
      .sort({ [resolvedSortField]: resolvedSortOrder, createdAt: 1 })
      .skip(skipCount)
      .limit(pageSize);

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getSkillMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select("skills");
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      minScore,
      limit,
      minRating,
      sortBy,
      sortOrder,
      skills,
    } = req.query;

    const requestedSkills = parseSkillQuery(skills);

    const filter = {
      _id: { $ne: req.user._id },
    };

    if (typeof minRating !== "undefined" && minRating !== "") {
      const parsedMinRating = Number(minRating);
      if (!Number.isNaN(parsedMinRating)) {
        filter.rating = { $gte: parsedMinRating };
      }
    }

    if (requestedSkills.length) {
      filter.$or = requestedSkills.map((item) => ({
        skills: {
          $elemMatch: {
            $regex: `^${escapeRegex(item)}$`,
            $options: "i",
          },
        },
      }));
    }

    const candidates = await User.find(filter)
      .select("-password")
      .limit(Math.min(parsePositiveInt(limit, 100), 200));

    const minimumScore = Math.min(Math.max(parsePositiveInt(minScore, 0), 0), 100);

    const scored = candidates
      .map((candidate) => {
        const { score, matchedSkills, missingSkills } = computeMatchScore(
          currentUser.skills || [],
          candidate.skills || []
        );

        return {
          ...candidate.toObject(),
          matchScore: score,
          matchedSkills,
          missingSkills,
        };
      })
      .filter((item) => item.matchScore >= minimumScore);

    const resolvedSortBy =
      sortBy === "name" ? "name" : sortBy === "rating" ? "rating" : "matchScore";
    const resolvedSortOrder = normalizeSortOrder(sortOrder);

    scored.sort((a, b) => {
      if (resolvedSortBy === "name") {
        return resolvedSortOrder * a.name.localeCompare(b.name);
      }

      return resolvedSortOrder * ((a[resolvedSortBy] || 0) - (b[resolvedSortBy] || 0));
    });

    return res.status(200).json(scored);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getPlatformOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const connectionStats = await User.aggregate([
      {
        $project: {
          connectionCount: { $size: { $ifNull: ["$connections", []] } },
        },
      },
      {
        $group: {
          _id: null,
          totalConnectionRefs: { $sum: "$connectionCount" },
        },
      },
    ]);
    const totalConnections = Math.floor((connectionStats[0]?.totalConnectionRefs || 0) / 2);

    const developer = await User.findOne({ _id: { $ne: req.user._id } })
      .sort({ createdAt: 1 })
      .select("name email about skills rating avatar connections requestsSent requestsReceived");

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
        totalConnections,
      },
      developer: developer
        ? {
            _id: developer._id,
            name: developer.name,
            email: developer.email,
            about: developer.about || "",
            avatar: developer.avatar || { url: "", publicId: "" },
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

    await createUserNotification({
      io: req.app.get("io"),
      userId: targetUser._id,
      type: "connection_request",
      title: "New connection request",
      body: `${currentUser.name} sent you a connection request`,
      metadata: {
        fromUserId: currentUser._id,
      },
    });

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

    await createUserNotification({
      io: req.app.get("io"),
      userId: requesterUser._id,
      type: "request_accepted",
      title: "Connection request accepted",
      body: `${currentUser.name} accepted your request`,
      metadata: {
        acceptedByUserId: currentUser._id,
      },
    });

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
    const limit = parseInt(req.query.limit, 10) || 50;

    const topUsers = await User.find({})
      .select("name email skills rating about avatar")
      .sort({ rating: -1, createdAt: 1 })
      .limit(limit);

    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || { url: "", publicId: "" },
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

    const reviewFilter = {
      $or: [
        { reviewer: currentUserId, reviewee: ratedUserId },
        { mentorId: currentUserId, learnerId: ratedUserId },
      ],
    };

    await Review.findOneAndUpdate(
      reviewFilter,
      {
        $set: {
          reviewer: currentUserId,
          reviewee: ratedUserId,
          mentorId: currentUserId,
          learnerId: ratedUserId,
          rating,
          comment: safeComment,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    const [summary] = await Review.aggregate([
      {
        $match: {
          $or: [{ reviewee: ratedUser._id }, { learnerId: ratedUser._id }],
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

    const reviews = await Review.find({
      $or: [{ reviewee: userId }, { learnerId: userId }],
    })
      .populate("reviewer", "name email avatar")
      .populate("mentorId", "name email avatar")
      .select("rating comment reviewer reviewee mentorId learnerId createdAt updatedAt")
      .sort({ updatedAt: -1 });

    const normalizedReviews = reviews.map((review) => {
      const reviewObject = review.toObject();
      reviewObject.reviewer = reviewObject.reviewer || reviewObject.mentorId;
      reviewObject.reviewee = reviewObject.reviewee || reviewObject.learnerId;
      return reviewObject;
    });

    return res.status(200).json(normalizedReviews);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateProfileAssets,
  deleteProfileAvatar,
  updateUserSkills,
  changePassword,
  changeEmail,
  updatePrivacySettings,
  getUsers,
  getSkillMatches,
  getPlatformOverview,
  sendConnectRequest,
  acceptConnectRequest,
  rejectConnectRequest,
  getLeaderboard,
  rateUser,
  getUserReviews,
};
