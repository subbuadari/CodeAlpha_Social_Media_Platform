const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const upload = require('../middleware/upload');

// @route   POST api/posts/upload
// @desc    Upload media file
router.post('/upload', auth, (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ msg: err });
    }
    if (req.file == undefined) {
      return res.status(400).json({ msg: 'No file selected' });
    }
    res.json({
      filePath: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype.startsWith('video') ? 'video' : 'image'
    });
  });
});

// @route   POST api/posts
// @desc    Create a post
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const newPost = new Post({
      content: req.body.content,
      image: req.body.mediaUrl || '',
      mediaType: req.body.mediaType || 'image',
      user: req.user.id
    });

    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/posts
// @desc    Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', ['username', 'profilePicture'])
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/posts/like/:id
// @desc    Like/Unlike a post
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked by this user
    if (post.likes.some(like => like.toString() === req.user.id)) {
      // Unlike
      post.likes = post.likes.filter(like => like.toString() !== req.user.id);
    } else {
      // Like
      post.likes.unshift(req.user.id);
    }

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/posts/comment/:id
// @desc    Comment on a post
router.post('/comment/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    const newComment = new Comment({
      text: req.body.text,
      user: req.user.id,
      post: req.params.id
    });

    const comment = await newComment.save();
    post.comments.unshift(comment.id);
    await post.save();

    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/posts/comments/:id
// @desc    Get comments for a post
router.get('/comments/:id', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('user', ['username', 'profilePicture'])
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/posts/:id
// @desc    Delete a post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Delete comments associated with the post
    await Comment.deleteMany({ post: req.params.id });
    
    await post.deleteOne();

    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
