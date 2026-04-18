const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const sanitizeUser = (userDoc) => {
  const userData = userDoc.toObject();
  delete userData.password;
  delete userData.resetPasswordToken;
  delete userData.resetPasswordExpires;
  return userData;
};

const issueToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

const sendResetEmail = async (toEmail, resetUrl) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpSecure = process.env.SMTP_SECURE === "true";
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || smtpUser,
    to: toEmail,
    subject: "SkillHive Password Reset",
    text: `Reset your password using this link: ${resetUrl}\nThis link expires in 15 minutes.`,
    html: `<p>Reset your password using this link:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 15 minutes.</p>`,
  });

  return true;
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      authProvider: "local",
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = issueToken(user._id);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const normalizedEmail = req.body.email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+resetPasswordToken +resetPasswordExpires"
    );

    // Keep response generic to avoid email enumeration.
    if (!user) {
      return res.status(200).json({
        message: "If this email exists, a password reset link has been sent.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const clientOrigin = process.env.CLIENT_ORIGIN;
    if (!clientOrigin && process.env.NODE_ENV === "production") {
      return res.status(500).json({
        message: "Password reset is temporarily unavailable. Please contact support.",
      });
    }

    const effectiveClientOrigin = clientOrigin || "http://localhost:3000";
    const resetUrl = `${effectiveClientOrigin}/reset-password?token=${rawToken}`;

    let emailSent = false;
    try {
      emailSent = await sendResetEmail(user.email, resetUrl);
    } catch (error) {
      emailSent = false;
    }

    const payload = {
      message: "If this email exists, a password reset link has been sent.",
    };

    if (!emailSent && process.env.NODE_ENV !== "production") {
      payload.devResetUrl = resetUrl;
      payload.devResetToken = rawToken;
    }

    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.authProvider = "local";
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    return next(error);
  }
};

const googleAuth = async (req, res, next) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        message: "Google auth is not configured on server",
      });
    }

    const { credential } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.sub) {
      return res.status(400).json({ message: "Invalid Google account payload" });
    }

    if (payload.email_verified === false) {
      return res.status(400).json({ message: "Google email is not verified" });
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    const normalizedName = (payload.name || "SkillHive User").trim();

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const randomPassword = crypto.randomBytes(24).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        name: normalizedName,
        email: normalizedEmail,
        password: hashedPassword,
        googleId: payload.sub,
        authProvider: "google",
      });
    } else {
      let shouldSave = false;

      if (!user.googleId) {
        user.googleId = payload.sub;
        shouldSave = true;
      }

      if (user.authProvider !== "google") {
        user.authProvider = "google";
        shouldSave = true;
      }

      if (shouldSave) {
        await user.save();
      }
    }

    const token = issueToken(user._id);

    return res.status(200).json({
      message: "Google authentication successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(401).json({ message: "Google authentication failed" });
  }
};

const setupInitialAdmin = async (req, res, next) => {
  try {
    const setupKey = req.headers["x-setup-key"];
    if (!process.env.SETUP_ADMIN_KEY || setupKey !== process.env.SETUP_ADMIN_KEY) {
      return res.status(401).json({ message: "Invalid setup key" });
    }

    const existingAdmin = await User.findOne({ role: "admin" }).select("_id");
    if (existingAdmin) {
      return res.status(403).json({ message: "Initial admin already configured" });
    }

    const { name, email, password } = req.body;
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      existingUser.name = normalizedName;
      existingUser.password = await bcrypt.hash(password, 10);
      existingUser.role = "admin";
      await existingUser.save();

      return res.status(200).json({
        message: "Initial admin configured successfully",
        user: sanitizeUser(existingUser),
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "admin",
    });

    return res.status(201).json({
      message: "Initial admin configured successfully",
      user: sanitizeUser(adminUser),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  googleAuth,
  setupInitialAdmin,
};
