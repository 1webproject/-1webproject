const DataManager = {

  getUsers() {
    const users = localStorage.getItem("users");
    return users ? JSON.parse(users) : [];
  },

  saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
  },

  getCurrentUser() {
    const savedUser = localStorage.getItem("currentUser");
    return savedUser ? JSON.parse(savedUser) : null;
  },

  setCurrentUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem("currentUser");
  },

  getUserById(userId) {
    const users = this.getUsers();
    return users.find(u => u.id === userId) || null;
  },

  getUserByEmail(email) {
    const users = this.getUsers();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    return users.find(u => String(u.email || "").trim().toLowerCase() === normalizedEmail) || null;
  },

  addUser(userData) {
    const users = this.getUsers();
    const normalizedEmail = String(userData.email || "").trim().toLowerCase();

    if (this.getUserByEmail(normalizedEmail)) {
      return { success: false, message: "Email already exists." };
    }

    const newUser = {
      id: Date.now().toString(),
      username: userData.username,
      email: normalizedEmail,
      password: userData.password,
      profilePicture: userData.profilePicture || "",
      bio: userData.bio || "",
      followers: [],
      following: [],
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);
    return { success: true, user: newUser };
  },

  updateUser(userId, updatedUser) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);

    if (index !== -1) {
      users[index] = { ...users[index], ...updatedUser };
      this.saveUsers(users);

      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        this.setCurrentUser(users[index]);
      }

      return { success: true, user: users[index] };
    }
    return { success: false, message: "User not found." };
  },

  getPosts() {
    const posts = localStorage.getItem("posts");
    return posts ? JSON.parse(posts) : [];
  },

  savePosts(posts) {
    localStorage.setItem("posts", JSON.stringify(posts));
  },

  addPost(postData) {
    const posts = this.getPosts();
    const currentUser = this.getCurrentUser();

    if (!currentUser) {
      return { success: false, message: "User not logged in." };
    }

    const newPost = {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      userProfilePicture: currentUser.profilePicture,
      content: postData.content,
      image: postData.image || "",
      createdAt: new Date().toISOString(),
      likes: [],
      comments: []
    };

    posts.unshift(newPost);
    this.savePosts(posts);
    return { success: true, post: newPost };
  },

  deletePost(postId) {
    const posts = this.getPosts();
    const currentUser = this.getCurrentUser();

    if (!currentUser) {
      return { success: false, message: "User not logged in." };
    }

    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
      return { success: false, message: "Post not found." };
    }

    if (posts[postIndex].userId !== currentUser.id) {
      return { success: false, message: "You can only delete your own posts." };
    }

    posts.splice(postIndex, 1);
    this.savePosts(posts);
    return { success: true };

  },

  getPostsById(postId) {
    const posts = this.getPosts();
    return posts.find(p => p.id === postId) || null;
  },

  getUserPosts(userId) {
    const posts = this.getPosts();
    return posts.filter(p => p.userId === userId);
  },

  toggleLike(postId) {
    const posts = this.getPosts();
    const currentUser = this.getCurrentUser();

    if (!currentUser) {
      return { success: false, message: "User not logged in." };
    }

    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
      return { success: false, message: "Post not found." };
    }

    const post = posts[postIndex];
    post.likes = Array.isArray(post.likes) ? post.likes : [];
    const likeIndex = post.likes.indexOf(currentUser.id);

    if (likeIndex === -1) {
      post.likes.push(currentUser.id);
    }
    else {
      post.likes.splice(likeIndex, 1);
    }

    this.savePosts(posts);
    return { success: true, likes: post.likes };
  },

  addComment(postId, content) {
    const posts = this.getPosts();
    const currentUser = this.getCurrentUser();
    const trimmedContent = String(content || "").trim();

    if (!currentUser) {
      return { success: false, message: "User not logged in." };
    }

    if (!trimmedContent) {
      return { success: false, message: "Comment cannot be empty." };
    }

    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
      return { success: false, message: "Post not found." };
    }

    const newComment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      userProfilePicture: currentUser.profilePicture,
      content: trimmedContent,
      createdAt: new Date().toISOString()
    };

    posts[postIndex].comments = Array.isArray(posts[postIndex].comments) ? posts[postIndex].comments : [];
    posts[postIndex].comments.push(newComment);
    this.savePosts(posts);
    return { success: true, comment: newComment };
  },

  deleteComment(postId, commentId) {
    const posts = this.getPosts();
    const currentUser = this.getCurrentUser();

    if (!currentUser) {
      return { success: false, message: "User not logged in." };
    }

    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
      return { success: false, message: "Post not found." };
    }

    posts[postIndex].comments = Array.isArray(posts[postIndex].comments) ? posts[postIndex].comments : [];
    const commentIndex = posts[postIndex].comments.findIndex(c => c.id === commentId);

    if (commentIndex === -1) {
      return { success: false, message: "Comment not found." };
    }

    if (posts[postIndex].comments[commentIndex].userId !== currentUser.id) {
      return { success: false, message: "You are not the owner of this comment." };
    }

    posts[postIndex].comments.splice(commentIndex, 1);
    this.savePosts(posts);
    return { success: true };
  },

  toggleFollow(userId) {
    const users = this.getUsers();
    const currentUser = this.getCurrentUser();

    if (!currentUser) {
      return { success: false, message: "User not logged in." };
    }

    if (currentUser.id === userId) {
      return { success: false, message: "You cannot follow yourself." };
    }

    const targetUserIndex = users.findIndex(u => u.id === userId);
    const currentUserIndex = users.findIndex(u => u.id === currentUser.id);

    if (targetUserIndex === -1 || currentUserIndex === -1) {
      return { success: false, message: "User not found." };
    }

    users[currentUserIndex].following = Array.isArray(users[currentUserIndex].following)
      ? users[currentUserIndex].following
      : [];
    users[targetUserIndex].followers = Array.isArray(users[targetUserIndex].followers)
      ? users[targetUserIndex].followers
      : [];

    const followIndex = users[currentUserIndex].following.indexOf(userId);

    if (followIndex === -1) {
      users[currentUserIndex].following.push(userId);
      users[targetUserIndex].followers.push(currentUser.id);
    }
    else {
      users[currentUserIndex].following.splice(followIndex, 1);
      const followerIndex = users[targetUserIndex].followers.indexOf(currentUser.id);
      if (followerIndex !== -1) {
        users[targetUserIndex].followers.splice(followerIndex, 1);
      }
    }

    this.saveUsers(users);
    this.setCurrentUser(users[currentUserIndex]);

    return {
      success: true,
      following: users[currentUserIndex].following,
      followers: users[targetUserIndex].followers
    };
  },

  getSuggestedUsers() {
    const users = this.getUsers();
    const currentUser = this.getCurrentUser();

    if (!currentUser) {
      return [];
    }

    const currentFollowing = Array.isArray(currentUser.following) ? currentUser.following : [];

    return users.filter(u => u.id !== currentUser.id && !currentFollowing.includes(u.id)).slice(0, 5);
  },

  getFeedPosts(filter = "all") {
    const posts = this.getPosts();
    const currentUser = this.getCurrentUser();

    if (!currentUser) {
      return [];
    }

    const currentFollowing = Array.isArray(currentUser.following) ? currentUser.following : [];

    if (filter === "following") {
      return posts.filter(p => currentFollowing.includes(p.userId) || p.userId === currentUser.id);
    }

    return posts;
  },

  getUserLikedPosts(userId) {
    const posts = this.getPosts();
    return posts.filter(p => p.likes.includes(userId));
  },

  getStats(userId) {
    const user = this.getUserById(userId);
    const posts = this.getUserPosts(userId);
    const likedPosts = this.getUserLikedPosts(userId);

    return {
      postCount: posts.length,
      followersCount: user && Array.isArray(user.followers) ? user.followers.length : 0,
      followingCount: user && Array.isArray(user.following) ? user.following.length : 0,
      likedCount: likedPosts.length
    };
  },

  initSampleData() {
    if (this.getUsers().length === 0) {
      const sampleUsers = [
        {
          id: "1",
          username: "Ammar",
          email: "ammar@example.com",
          password: "12345678",
          profilePicture: "https://randomuser.me/api/portraits/men/1.jpg",
          bio: 'Web developer and tech enthusiast.',
          followers: [],
          following: [],
          createdAt: new Date().toISOString()
        },
        {
          id: "2",
          username: "Omar",
          email: "omar@example.com",
          password: "12345678",
          profilePicture: "https://randomuser.me/api/portraits/men/32.jpg",
          bio: "Software engineer and open source contributor.",
          followers: [],
          following: [],
          createdAt: new Date().toISOString()
        }
      ];
      this.saveUsers(sampleUsers);

      const samplePosts = [
        {
          id: "111",
          userId: "1",
          username: "Ammar",
          userProfilePicture: "https://randomuser.me/api/portraits/men/1.jpg",
          content: "Hello world! This is my first post.",
          image: "",
          createdAt: new Date().toISOString(),
          likes: [],
          comments: []
        },
        {
          id: "222",
          userId: "2",
          username: "Omar",
          userProfilePicture: "https://randomuser.me/api/portraits/men/32.jpg",
          content: "Excited to join this platform!",
          image: "",
          createdAt: new Date().toISOString(),
          likes: [],
          comments: []
        }
      ];
      this.savePosts(samplePosts);
    }
  }
};


