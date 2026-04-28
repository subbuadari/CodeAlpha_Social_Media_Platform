const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Post.deleteMany();
    await Comment.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    // Create Demo Users matching the images
    const users = await User.insertMany([
      { username: 'elara.travels', email: 'elara@example.com', password, bio: 'Digital Creator\nCapturing the world through a lens 🌍\nBased in Berlin 📍\nNext stop: Tokyo 🇯🇵\nelaratravels.blog' },
      { username: 'clara_peaks', email: 'clara@example.com', password, bio: 'Mountain lover and photographer. 🏔️' },
      { username: 'design_kit', email: 'design@example.com', password, bio: 'Minimalist Studio, Tokyo' },
      { username: 'marcus_dev', email: 'marcus@example.com', password, bio: 'Code & Coffee. ☕' },
      { username: 'sarah_j', email: 'sarah@example.com', password, bio: 'Life in pixels.' },
      { username: 'urban_explorer', email: 'urban@example.com', password, bio: 'City lights & busy nights.' },
      { username: 'creative_hub', email: 'creative@example.com', password, bio: 'Inspiring creativity everywhere.' },
      { username: 'alex_parker', email: 'alex@example.com', password, bio: 'Explorer. Wanderer.' }
    ]);

    // Create Demo Posts matching the images
    const postsData = [
      { 
        user: users[1]._id, 
        content: "Morning light hits different in the valley. Breathing in the fresh mountain air today. 🏔️✨",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      { 
        user: users[2]._id, 
        content: "Function meets form. Workspace reset for the new week.",
        image: "https://images.unsplash.com/photo-1493932484895-752d1471eab5?auto=format&fit=crop&q=80&w=1000",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      },
      { 
        user: users[0]._id, 
        content: "Deep in the green. 🌲",
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1000",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      { 
        user: users[0]._id, 
        content: "Sunset over the lake. 🌅",
        image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1000",
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
      }
    ];

    const posts = await Post.insertMany(postsData);

    // Add some random likes
    for (const post of posts) {
        const randomLikesCount = Math.floor(Math.random() * users.length);
        const randomUsers = users.sort(() => 0.5 - Math.random()).slice(0, randomLikesCount);
        post.likes = randomUsers.map(u => u._id);
        await post.save();
    }

    // Add some comments
    await Comment.create([
        { user: users[3]._id, post: posts[0]._id, text: "Absolutely stunning work! Love the..." },
        { user: users[0]._id, post: posts[1]._id, text: "Clean and minimal. Love it!" }
    ]);

    console.log('Seed data updated successfully!');
    process.exit();
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
