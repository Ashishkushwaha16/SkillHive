const Post = require("../models/Post");

const listPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (typeof title !== "string" || title.trim().length < 3) {
      return res.status(400).json({ message: "Title must be at least 3 characters" });
    }

    if (typeof description !== "string" || description.trim().length < 10) {
      return res
        .status(400)
        .json({ message: "Description must be at least 10 characters" });
    }

    const post = await Post.create({
      title: title.trim(),
      description: description.trim(),
      authorRole: req.user.role,
      isPublished: true,
    });

    return res.status(201).json(post);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listPosts,
  createPost,
};
