const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const Post = require('../models/Post');

// @route   GET api/users/profile/:id
// @desc    Get user profile by ID
router.get('/profile/:id', async (req, res) => {
  try {
    // Check if ID is a valid ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      // If not an ID, try finding by username (for search compatibility)
      const user = await User.findOne({ username: req.params.id }).select('-password');
      if (!user) return res.status(404).json({ msg: 'User not found' });
      
      const posts = await Post.find({ user: user._id })
        .populate('user', ['username', 'profilePicture'])
        .sort({ createdAt: -1 });
      return res.json({ user, posts });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const posts = await Post.find({ user: req.params.id })
      .populate('user', ['username', 'profilePicture'])
      .sort({ createdAt: -1 });

    res.json({ user, posts });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/search/:query
// @desc    Search users by username
router.get('/search/:query', async (req, res) => {
  try {
    const users = await User.find({ 
      username: { $regex: req.params.query, $options: 'i' } 
    }).select('username profilePicture bio');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/users/follow/:id
// @desc    Follow/Unfollow a user
router.put('/follow/:id', auth, async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ msg: 'You cannot follow yourself' });
  }

  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (userToFollow.followers.some(f => f.toString() === req.user.id)) {
      // Unfollow
      userToFollow.followers = userToFollow.followers.filter(f => f.toString() !== req.user.id);
      currentUser.following = currentUser.following.filter(f => f.toString() !== req.params.id);
    } else {
      // Follow
      userToFollow.followers.unshift(req.user.id);
      currentUser.following.unshift(req.params.id);
    }

    await userToFollow.save();
    await currentUser.save();

    res.json({ followers: userToFollow.followers, following: currentUser.following });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
