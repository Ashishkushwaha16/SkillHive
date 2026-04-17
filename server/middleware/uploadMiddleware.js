const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
});

const profileUpload = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "resume", maxCount: 1 },
  { name: "certificates", maxCount: 5 },
]);

module.exports = {
  profileUpload,
};
