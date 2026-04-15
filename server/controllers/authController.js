const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
    });

    const userData = user.toObject();
    delete userData.password;

    return res.status(201).json({
      message: "User registered successfully",
      user: userData,
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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    return next(error);
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

      const userData = existingUser.toObject();
      delete userData.password;

      return res.status(200).json({
        message: "Initial admin configured successfully",
        user: userData,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "admin",
    });

    const userData = adminUser.toObject();
    delete userData.password;

    return res.status(201).json({
      message: "Initial admin configured successfully",
      user: userData,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { registerUser, loginUser, setupInitialAdmin };
