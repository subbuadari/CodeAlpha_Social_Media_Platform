# 🧵 STITCH | The Obsidian Social Experience
### CodeAlpha Internship — Task 2: Mini Social Media App

**STITCH** is a high-fidelity, full-stack social media platform designed with a focus on **Obsidian Luxury** aesthetics. Built using the MERN stack (MongoDB, Express, Vanilla JS SPA, Node.js), STITCH provides a premium interface for creators to share content, interact with peers, and track their digital footprint in a sleek, glassmorphic environment.

![STITCH Hero Showcase](./screenshots/Dynamic%20Social%20Feed.jpeg)

---

## ✨ Key Features

### 💎 Obsidian Luxury Design System
*   **State-of-the-Art UI**: A curated dark-mode experience featuring deep obsidian tones, vibrant accent gradients, and glassmorphism.
*   **Micro-Interactions**: Smooth hover effects, interactive card transitions, and scroll-reveal animations that make the app feel alive.
*   **Responsive Architecture**: Fully optimized for mobile, tablet, and desktop viewing.

### 📱 Social Core
*   **Dynamic Feed**: Real-time content loading with high-resolution image support and rich text formatting.
*   **Engagement Suite**: Integrated like, comment, and follow systems to drive user interaction.
*   **User Profiles**: Comprehensive dashboards showcasing user statistics (Followers, Following, Posts) and content history.

### 🛡️ Secure Infrastructure
*   **JWT Authentication**: Secure login and registration with JSON Web Tokens and Bcrypt password hashing.
*   **Media Management**: Dedicated upload system for profile pictures and post imagery.
*   **Live Notifications**: (Experimental) Activity tracking to keep users engaged with recent interactions.

## 🖼️ User Interface

> All screenshots below showcase the live Stitch application running locally.

### 1. 📰 Dynamic Social Feed
*The core content feed where users discover and engage with posts.*

![Dynamic Social Feed](./screenshots/Dynamic%20Social%20Feed.jpeg)

---

### 2. 👤 User Profile Dashboard
*A personalized profile showcasing user stats, highlights, and content grid.*

![User Profile Dashboard](./screenshots/User%20Profile%20Dashboard.jpeg)

---

### 3. 🖼️ Curated Content Grid
*An explore-style masonry grid for discovering curated visual content.*

![Curated Content Grid](./screenshots/Curated%20Content%20Grid.jpeg)

---

### 4. 🔔 Activity & Notifications
*Real-time activity tracking — follows, likes, comments, and mentions.*

![Activity and Notifications](./screenshots/Activity%20%26%20Notifications.jpeg)

---

## 🛠️ Tech Stack

*   **Frontend**: 
    *   Vanilla JavaScript (Single Page Application architecture)
    *   Tailwind CSS (Via CDN for rapid, modern styling)
    *   HTML5 / CSS3 (Custom Obsidian Glassmorphism)
*   **Backend**:
    *   Node.js & Express.js (RESTful API Design)
*   **Database**:
    *   MongoDB (NoSQL) with Mongoose ODM
*   **Authentication**:
    *   JWT (JSON Web Tokens) & HTTP-Only Cookies (Optional)
*   **Utilities**:
    *   Dotenv, Multer (Media Uploads), Bcrypt.js

---

## 🚀 Getting Started

### 📋 Prerequisites
*   [Node.js](https://nodejs.org/) (v16.0.0 or higher)
*   [MongoDB](https://www.mongodb.com/) (Local instance or Atlas Cluster)
*   A code editor (VS Code recommended)

### ⚙️ Installation & Setup

1.  **Clone the Repository**:
    ```powershell
    git clone https://github.com/your-username/stitch-social-media.git
    cd task-2
    ```

2.  **Automated Dependency Installation**:
    ```powershell
    npm run install-all
    ```

3.  **Environment Configuration**:
    Navigate to the `backend` folder and ensure your `.env` file is configured:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_key
    ```

4.  **Seed Demo Data**:
    Populate the platform with curated "Obsidian" themed content:
    ```powershell
    npm run seed
    ```

### 🏃 Running the App
Start both the backend server and the frontend preview with a single command:
```powershell
npm run dev
```
The application will automatically open at: **[http://localhost:5000](http://localhost:5000)**

---

## 📂 Project Structure

```text
task-2/
├── frontend/             # The "Obsidian" UI Layer
│   ├── index.html        # Main SPA Entry Point
│   ├── app.js            # Core Frontend Router & State
│   └── style.css         # Design Tokens & Glassmorphism
├── backend/              # Node.js Logic & API
│   ├── models/           # Mongoose Schemas (User, Post, Comment)
│   ├── routes/           # API Endpoints (Auth, Posts, Users)
│   ├── middleware/       # Security & File Upload Config
│   ├── uploads/          # Physical Storage for Media
│   └── server.js         # Express Server Configuration
├── seed.js               # Content Seeding Script
└── package.json          # Global Script Manager
```

---

## 📡 API Overview (Sample Endpoints)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create a new account | No |
| `POST` | `/api/auth/login` | Authenticate user | No |
| `GET` | `/api/posts` | Fetch all social content | Yes |
| `POST` | `/api/posts` | Create a new post | Yes |
| `PUT` | `/api/posts/:id/like` | Like/Unlike a post | Yes |

---

## 🤝 Contributing
This project was developed for the **CodeAlpha Internship Program**. Feel free to fork, explore, and enhance the "Obsidian" experience!

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

**Developed with ❤️ by [Your Name/Rishi]**
