const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");

const hasCloudinaryConfig = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

if (hasCloudinaryConfig()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });

const deleteAsset = async (publicId, options = {}) => {
  if (!publicId || !hasCloudinaryConfig()) {
    return null;
  }

  return cloudinary.uploader.destroy(publicId, options);
};

module.exports = {
  hasCloudinaryConfig,
  uploadBuffer,
  deleteAsset,
};
