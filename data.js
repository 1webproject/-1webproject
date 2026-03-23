const DataManager = {

  getUsers() {
    const users = localStorage.getItem("users");
    return users ? JSON.parse(users) : [];
  },

  saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
  },

  getCurrentUser(user) {
    const user = localStorage.getItem("currentUser_user");
    return user ? JSON.parse(user) : null;
  },

  setCurrentUser(user) {
    localStorage.setItem("currentUser_user", JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem("currentUser_user");
  },
  
  getUserById(userId) {
    const users = this.getUsers();
    return users.find(u => u.id === userId) || null;
  },

  getUserByEmail(email) {
    const users = this.getUsers();
    return users.find(u => u.email === email) || null;
  },

  addUser(userData) {
    const users = this.getUsers();

    if (this.getUserByEmail(userData.email)) {
      return { success: false, message: "Email already exists." };
    }

    const newUser = {
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
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

    updateUser(userId,updatedUser) {
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
    const filteredPosts = posts.filter(p => p.id !== postId);
    this.savePosts(filteredPosts);
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
    };

    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
      return { success: false, message: "Post not found." };
    };

    const post = posts[postIndex];
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

    if (!currentUser) {
      return { success: false, message: "User not logged in." };
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
      content: content,
      createdAt: new Date().toISOString()   
    };

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

    const followIndex = users[currentUserIndex].following.indexOf(userId);

    if (followIndex === -1) {
      users[currentUserIndex].following.push(userId);
      users[targetUserIndex].followers.push(currentUser.id);
    } 
    else {
      users[currentUserIndex].following.splice(followIndex, 1);
      const followerIndex = users[targetUserIndex].followers.indexOf(currentUser.id);
      users[targetUserIndex].followers.splice(followerIndex, 1);
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

    return users.filter(u => u.id !== currentUser.id && !currentUser.following.includes(u.id)).slice(0,5);
    },

    getFeedPosts(filter = "all") {
    const posts = this.getPosts();
    const currentUser = this.getCurrentUser();

    if (!currentUser) {
      return [];
    }

    if (filter === "following") {
      return posts.filter(p => currentUser.following.includes(p.userId) || p.userId === currentUser.id);
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
        followersCount: user ? user.followers.length : 0,
        followingCount: user ? user.following.length : 0,
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


