require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const getArgValue = (flag) => {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return null;
  }
  return process.argv[index + 1] || null;
};

const usage = () => {
  console.log("Usage:");
  console.log("  npm run admin:bootstrap -- --email admin@example.com --name \"Admin\" --password \"123456\"");
  console.log("\nFlags:");
  console.log("  --email      Required. Admin email");
  console.log("  --name       Optional for existing user, required for new user");
  console.log("  --password   Optional for existing user, required for new user");
};

const bootstrapAdmin = async () => {
  const emailInput = (getArgValue("--email") || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const nameInput = (getArgValue("--name") || process.env.ADMIN_NAME || "").trim();
  const passwordInput = getArgValue("--password") || process.env.ADMIN_PASSWORD || "";

  if (!process.env.MONGO_URI) {
    throw new Error("Missing required env: MONGO_URI");
  }

  if (!emailInput) {
    usage();
    throw new Error("Missing required value: --email");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existingUser = await User.findOne({ email: emailInput });

  if (existingUser) {
    existingUser.role = "admin";

    if (passwordInput) {
      if (passwordInput.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      existingUser.password = await bcrypt.hash(passwordInput, 10);
    }

    if (nameInput) {
      existingUser.name = nameInput;
    }

    await existingUser.save();

    console.log("Success: existing user promoted to admin");
    console.log(`Email: ${existingUser.email}`);
    console.log(`UserId: ${existingUser._id}`);
    return;
  }

  if (!nameInput || !passwordInput) {
    usage();
    throw new Error("New admin creation requires --name and --password");
  }

  if (passwordInput.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const hashedPassword = await bcrypt.hash(passwordInput, 10);

  const adminUser = await User.create({
    name: nameInput,
    email: emailInput,
    password: hashedPassword,
    role: "admin",
  });

  console.log("Success: new admin user created");
  console.log(`Email: ${adminUser.email}`);
  console.log(`UserId: ${adminUser._id}`);
};

bootstrapAdmin()
  .catch((error) => {
    console.error(`Admin bootstrap failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
