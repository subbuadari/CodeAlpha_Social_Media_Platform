const API_URL = '/api';

const app = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isLoginMode: true,
    viewingProfileId: null,
    currentTab: 'grid',
    selectedFile: null,

    init() {
        if (this.token && this.user) {
            if (this.user.id && !this.user._id) this.user._id = this.user.id;
            this.showFeed();
            this.updateUserProfileInfo();
        } else {
            this.showAuth();
        }
        this.setupEventListeners();
    },

    setupEventListeners() {
        const authForm = document.getElementById('auth-form');
        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAuth();
            });
        }
    },

    updateUserProfileInfo() {
        const navPic = document.getElementById('nav-profile-pic');
        if (navPic && this.user) {
            navPic.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.user.username}`;
        }
        const captionAvatar = document.getElementById('caption-avatar');
        if (captionAvatar && this.user) {
            captionAvatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.user.username}`;
        }
    },

    showAuth() {
        document.getElementById('auth-section').classList.remove('hidden');
        document.getElementById('app-content').classList.add('hidden');
    },

    toggleAuth() {
        this.isLoginMode = !this.isLoginMode;
        const submitBtn = document.getElementById('auth-submit');
        const toggleLink = document.getElementById('toggle-link');
        const toggleText = document.getElementById('toggle-text');
        const usernameInput = document.getElementById('username');

        if (this.isLoginMode) {
            submitBtn.innerText = 'Log In';
            toggleText.innerHTML = `Don't have an account? <span onclick="app.toggleAuth()" style="color: #0095f6; font-weight: 600; cursor: pointer;">Sign up</span>`;
            usernameInput.classList.add('hidden');
        } else {
            submitBtn.innerText = 'Sign Up';
            toggleText.innerHTML = `Have an account? <span onclick="app.toggleAuth()" style="color: #0095f6; font-weight: 600; cursor: pointer;">Log in</span>`;
            usernameInput.classList.remove('hidden');
        }
    },

    async handleAuth() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const username = document.getElementById('username').value;

        const endpoint = this.isLoginMode ? '/auth/login' : '/auth/register';
        const body = this.isLoginMode ? { email, password } : { username, email, password };

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (data.token) {
                this.token = data.token;
                this.user = data.user;
                if (data.user.id && !data.user._id) data.user._id = data.user.id;
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                this.showFeed();
                this.updateUserProfileInfo();
            } else {
                alert(data.msg || 'Authentication failed');
            }
        } catch (err) { console.error(err); alert('Something went wrong'); }
    },

    showFeed() {
        this.updateNav('nav-home');
        this.viewingProfileId = null;
        const main = document.getElementById('main-view');
        main.innerHTML = `
            <div class="stories-bar">
                <div class="story-item">
                    <div class="story-ring my-story">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${this.user?.username}" class="story-avatar">
                        <div style="position: absolute; bottom: 18px; right: 0; background: #0095f6; color: #fff; border-radius: 50%; border: 2px solid #fff; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 14px;">+</div>
                    </div>
                    <span class="story-name">Your Story</span>
                </div>
                ${['alexa_v', 'design_kit', 'marcus.j', 'clara_peaks', 'travel_bug'].map(name => `
                    <div class="story-item">
                        <div class="story-ring">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${name}" class="story-avatar">
                        </div>
                        <span class="story-name">${name}</span>
                    </div>
                `).join('')}
            </div>
            <div id="posts-container">
                <div style="display: flex; justify-content: center; padding: 40px;"><span class="material-symbols-outlined" style="animation: spin 1s linear infinite;">sync</span></div>
            </div>
        `;
        this.fetchPosts();
    },

    async fetchPosts() {
        try {
            const res = await fetch(`${API_URL}/posts`);
            const posts = await res.json();
            this.displayPosts(posts);
        } catch (err) { console.error(err); }
    },

    displayPosts(posts) {
        const container = document.getElementById('posts-container');
        if (!container) return;
        if (!posts || posts.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #737373;">No posts yet.</div>';
            return;
        }
        container.innerHTML = posts.map(post => this.generatePostCard(post)).join('');
    },

    generatePostCard(post) {
        const currentUserId = this.user?._id || this.user?.id;
        const isLiked = post.likes.includes(currentUserId);
        const time = this.formatTime(post.createdAt);
        
        const mediaUrl = post.image 
            ? (post.image.startsWith('http') ? post.image : post.image)
            : `https://picsum.photos/seed/${post._id}/800/800`;
            
        return `
            <article class="post">
                <div class="post-header">
                    <div class="post-user-info" onclick="app.showProfile('${post.user._id}')" style="cursor:pointer;">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user.username}" class="post-avatar">
                        <div>
                            <div class="post-username">${post.user.username}</div>
                            <div class="post-location">Somewhere Beautiful</div>
                        </div>
                    </div>
                    <span class="material-symbols-outlined">more_horiz</span>
                </div>
                <div class="post-media">
                    ${post.mediaType === 'video' 
                        ? `<video src="${mediaUrl}" controls></video>`
                        : `<img src="${mediaUrl}" alt="Post content">`
                    }
                </div>
                <div class="post-actions">
                    <div class="post-actions-left">
                        <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="app.handleLike('${post._id}')">
                            <span class="material-symbols-outlined">${isLiked ? 'favorite' : 'favorite'}</span>
                        </button>
                        <button class="action-btn">
                            <span class="material-symbols-outlined">chat_bubble</span>
                        </button>
                        <button class="action-btn">
                            <span class="material-symbols-outlined">send</span>
                        </button>
                    </div>
                    <button class="action-btn">
                        <span class="material-symbols-outlined">bookmark</span>
                    </button>
                </div>
                <div class="post-likes">${post.likes.length.toLocaleString()} likes</div>
                <div class="post-caption">
                    <span class="username">${post.user.username}</span>
                    <span>${post.content}</span>
                </div>
                <div class="post-comments-link" onclick="app.showComments('${post._id}')">View all ${post.comments.length} comments</div>
                <div class="post-time">${time}</div>
            </article>
        `;
    },

    formatTime(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHrs < 1) return 'JUST NOW';
        if (diffHrs < 24) return `${diffHrs} HOURS AGO`;
        return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' }).toUpperCase();
    },

    showSearch() {
        this.updateNav('nav-search');
        const main = document.getElementById('main-view');
        main.innerHTML = `
            <div style="padding: 12px 16px;">
                <div style="background: #efefef; border-radius: 8px; display: flex; align-items: center; padding: 8px 12px; gap: 8px;">
                    <span class="material-symbols-outlined" style="color: #737373; font-size: 20px;">search</span>
                    <input type="text" placeholder="Search" style="background: none; border: none; outline: none; flex: 1; font-size: 16px;" oninput="app.handleSearch(this.value)">
                </div>
            </div>
            <div id="search-results" class="post-grid" style="margin-top: 12px;">
                ${Array(12).fill(0).map((_, i) => `
                    <div class="grid-item">
                        <img src="https://picsum.photos/seed/explore${i}/300/300">
                    </div>
                `).join('')}
            </div>
        `;
    },

    async handleSearch(query) {
        if (!query) {
            this.showSearch();
            return;
        }
        const results = document.getElementById('search-results');
        try {
            const res = await fetch(`${API_URL}/users/search/${query}`);
            const users = await res.json();
            results.innerHTML = users.map(user => `
                <div class="notification-item" onclick="app.showProfile('${user._id}')" style="cursor:pointer;">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}" class="notif-avatar">
                    <div class="notif-content">
                        <div class="notif-username">${user.username}</div>
                        <div class="notif-time">${user.bio || ''}</div>
                    </div>
                </div>
            `).join('');
            results.style.display = 'block';
        } catch (err) { console.error(err); }
    },

    showAlerts() {
        this.updateNav('nav-alerts');
        const main = document.getElementById('main-view');
        main.innerHTML = `
            <div class="activity-header">
                <h1>Activity</h1>
            </div>
            <div class="activity-filters">
                <button class="filter-btn active">All</button>
                <button class="filter-btn">Follows</button>
                <button class="filter-btn">Likes</button>
                <button class="filter-btn">Comments</button>
            </div>
            <div class="activity-section">
                <div class="section-title">New</div>
                <div class="notification-item">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=elara_design" class="notif-avatar">
                    <div class="notif-content">
                        <span class="notif-username">elara_design</span> started following you. <span class="notif-time">2h</span>
                    </div>
                    <button class="btn-follow">Follow</button>
                </div>
                <div class="notification-item">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=marcus_dev" class="notif-avatar">
                    <div class="notif-content">
                        <span class="notif-username">marcus_dev</span> liked your photo. <span class="notif-time">4h</span>
                    </div>
                    <img src="https://picsum.photos/seed/notif1/100/100" class="notif-post-thumb">
                </div>
            </div>
            <div class="activity-section">
                <div class="section-title">Earlier</div>
                <div class="notification-item">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=sarah_j" class="notif-avatar">
                    <div class="notif-content">
                        <span class="notif-username">sarah_j</span> commented: "This is absolutely stunning work! Love the..." <span class="notif-time">2d</span>
                    </div>
                    <img src="https://picsum.photos/seed/notif2/100/100" class="notif-post-thumb">
                </div>
                <div class="notification-item">
                    <div style="display:flex; position:relative; width: 44px; height: 44px;">
                         <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=alex" class="notif-avatar" style="width:30px; height:30px; border:2px solid #fff;">
                         <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=maya" class="notif-avatar" style="width:30px; height:30px; position:absolute; bottom:0; right:0; border:2px solid #fff;">
                    </div>
                    <div class="notif-content">
                        <span class="notif-username">alex_parker</span> and 34 others liked your reel. <span class="notif-time">2d</span>
                    </div>
                    <img src="https://picsum.photos/seed/notif3/100/100" class="notif-post-thumb">
                </div>
                <div class="notification-item">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=urban" class="notif-avatar">
                    <div class="notif-content">
                        <span class="notif-username">urban_explorer</span> followed you. <span class="notif-time">3d</span>
                    </div>
                    <button class="btn-following">Following</button>
                </div>
                <div class="notification-item">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=creative" class="notif-avatar">
                    <div class="notif-content">
                        <span class="notif-username">creative_hub</span> mentioned you in a comment: <span style="color:#00376b;">@user_prime</span> check this out! <span class="notif-time">4d</span>
                    </div>
                    <img src="https://picsum.photos/seed/notif4/100/100" class="notif-post-thumb">
                </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; color: #737373;">
                <span class="material-symbols-outlined" style="font-size: 48px; border: 2px solid #737373; border-radius: 50%; padding: 10px; margin-bottom: 12px;">favorite</span>
                <p>No more recent activity</p>
            </div>
        `;
    },

    async showProfile(userId = (this.user?._id || this.user?.id)) {
        if (!userId) return;
        this.viewingProfileId = userId;
        this.updateNav('nav-profile');
        const main = document.getElementById('main-view');
        
        try {
            const res = await fetch(`${API_URL}/users/profile/${userId}`);
            const data = await res.json();
            const isMe = userId === (this.user?._id || this.user?.id);
            
            main.innerHTML = `
                <div class="profile-container">
                    <div class="profile-top">
                        <div class="profile-pic-container">
                            <div class="profile-pic-ring">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.username}" class="profile-pic">
                            </div>
                        </div>
                        <div class="profile-stats">
                            <div style="font-size: 20px; font-weight: 300; margin-bottom: 12px;">${data.user.username}</div>
                            <div class="profile-stats-row">
                                <div class="stat-item">
                                    <span class="stat-value">${data.posts.length}</span>
                                    <span class="stat-label">posts</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">${(data.user.followers.length + 12500).toLocaleString()}</span>
                                    <span class="stat-label">followers</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">${data.user.following.length + 842}</span>
                                    <span class="stat-label">following</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-bio">
                        <div class="profile-name">${data.user.username.split('.')[0]} | Digital Creator</div>
                        <div style="white-space: pre-wrap;">${data.user.bio || 'Capturing the world through a lens 🌍'}</div>
                        <div style="color: #00376b; font-weight: 600; margin-top: 4px;">${data.user.username}.blog</div>
                    </div>

                    <div class="profile-buttons">
                        ${isMe 
                            ? `<button class="btn-ig" onclick="app.logout()">Edit Profile</button>
                               <button class="btn-ig">Share Profile</button>
                               <button class="btn-ig btn-icon"><span class="material-symbols-outlined">person_add</span></button>`
                            : `<button class="btn-ig" style="background: #0095f6; color: #fff;" onclick="app.handleFollow()">Follow</button>
                               <button class="btn-ig">Message</button>
                               <button class="btn-ig btn-icon"><span class="material-symbols-outlined">person_add</span></button>`
                        }
                    </div>

                    <div class="highlights">
                        <div class="highlight-item">
                            <div class="highlight-circle">
                                <div class="highlight-inner" style="display:flex; align-items:center; justify-content:center;">
                                    <span class="material-symbols-outlined" style="font-size: 30px;">add</span>
                                </div>
                            </div>
                            <span class="highlight-name">New</span>
                        </div>
                        ${['Kyoto', 'Cafes', 'Nature', 'Eats'].map(h => `
                            <div class="highlight-item">
                                <div class="highlight-circle">
                                    <div class="highlight-inner">
                                        <img src="https://picsum.photos/seed/${h}/100/100">
                                    </div>
                                </div>
                                <span class="highlight-name">${h}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="profile-tabs">
                        <div class="profile-tab active" onclick="app.setProfileTab('grid')">
                            <span class="material-symbols-outlined">grid_on</span>
                        </div>
                        <div class="profile-tab" onclick="app.setProfileTab('reels')">
                            <span class="material-symbols-outlined">movie</span>
                        </div>
                        <div class="profile-tab" onclick="app.setProfileTab('tagged')">
                            <span class="material-symbols-outlined">assignment_ind</span>
                        </div>
                    </div>

                    <div id="profile-posts-grid" class="post-grid">
                        ${data.posts.map((post, i) => `
                            <div class="grid-item" onclick="app.showPostDetail('${post._id}')">
                                <img src="${post.image ? (post.image.startsWith('http') ? post.image : post.image) : `https://picsum.photos/seed/${post._id}/300/300`}">
                                ${i === 1 ? '<span class="material-symbols-outlined icon">filter_none</span>' : ''}
                                ${i === 3 ? '<span class="material-symbols-outlined icon">movie</span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } catch (err) { console.error(err); }
    },

    updateNav(activeId) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const active = document.getElementById(activeId);
        if (active) active.classList.add('active');
        
        // Hide overlay if moving away from add
        if (activeId !== 'nav-add') {
            document.getElementById('new-post-overlay').classList.add('hidden');
        }
        
        // Show app content if coming from auth
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
    },

    openNewPost() {
        document.getElementById('new-post-overlay').classList.remove('hidden');
        this.clearMedia();
        document.getElementById('post-content').value = '';
    },

    closeNewPost() {
        document.getElementById('new-post-overlay').classList.add('hidden');
    },

    handleMediaSelect(input) {
        const file = input.files[0];
        if (!file) return;
        this.selectedFile = file;
        
        const previewContainer = document.getElementById('media-preview-container');
        const imgPreview = document.getElementById('image-preview');
        const vidPreview = document.getElementById('video-preview');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            previewContainer.innerHTML = '';
            if (file.type.startsWith('video')) {
                const video = document.createElement('video');
                video.src = e.target.result;
                video.controls = true;
                video.style.width = '100%';
                video.style.height = '100%';
                video.style.objectFit = 'cover';
                previewContainer.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                previewContainer.appendChild(img);
            }
        };
        reader.readAsDataURL(file);
    },

    clearMedia() {
        this.selectedFile = null;
        const previewContainer = document.getElementById('media-preview-container');
        previewContainer.innerHTML = `
            <span class="material-symbols-outlined" style="font-size: 48px; color: #ccc;" onclick="document.getElementById('media-input').click()">add_a_photo</span>
            <input type="file" id="media-input" class="hidden" accept="image/*,video/*" onchange="app.handleMediaSelect(this)">
        `;
    },

    async createPost() {
        const content = document.getElementById('post-content').value;
        const submitBtn = document.getElementById('submit-post-btn');
        if (!content && !this.selectedFile) return;

        submitBtn.disabled = true;
        submitBtn.innerText = 'Sharing...';

        let mediaUrl = '';
        let mediaType = 'image';

        try {
            if (this.selectedFile) {
                const formData = new FormData();
                formData.append('media', this.selectedFile);
                const uploadRes = await fetch(`${API_URL}/posts/upload`, {
                    method: 'POST',
                    headers: { 'x-auth-token': this.token },
                    body: formData
                });
                const uploadData = await uploadRes.json();
                if (uploadRes.ok) {
                    mediaUrl = uploadData.filePath;
                    mediaType = uploadData.fileType;
                }
            }

            const res = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': this.token },
                body: JSON.stringify({ content, mediaUrl, mediaType })
            });

            if (res.ok) {
                this.closeNewPost();
                this.showFeed();
            }
        } catch (err) { console.error(err); } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Share';
        }
    },

    async handleLike(postId) {
        try {
            await fetch(`${API_URL}/posts/like/${postId}`, { method: 'PUT', headers: { 'x-auth-token': this.token } });
            if (this.viewingProfileId) this.showProfile(this.viewingProfileId); else this.fetchPosts();
        } catch (err) { console.error(err); }
    },

    async handleFollow() {
        try {
            await fetch(`${API_URL}/users/follow/${this.viewingProfileId}`, { method: 'PUT', headers: { 'x-auth-token': this.token } });
            this.showProfile(this.viewingProfileId);
        } catch (err) { console.error(err); }
    },

    logout() { this.token = null; this.user = null; localStorage.removeItem('token'); localStorage.removeItem('user'); location.reload(); }
};

app.init();
