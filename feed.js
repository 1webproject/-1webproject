(function () {
  "use strict";

  function getCurrentUser() {
    if (typeof DataManager !== "undefined" && typeof DataManager.getCurrentUser === "function") {
      return DataManager.getCurrentUser();
    }

    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  }

  function getFeedPosts() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      return [];
    }

    if (typeof DataManager !== "undefined" && typeof DataManager.getFeedPosts === "function") {
      return DataManager.getFeedPosts("following");
    }

    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    const following = Array.isArray(currentUser.following) ? currentUser.following : [];

    return posts.filter(function (post) {
      return post.userId === currentUser.id || following.includes(post.userId);
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatPostTime(dateString) {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Unknown time";
    }

    return date.toLocaleString();
  }

  function buildPostCard(post) {
    const profilePicture = post.userProfilePicture && post.userProfilePicture.trim() !== ""
      ? post.userProfilePicture
      : "https://via.placeholder.com/50";

    const likesCount = Array.isArray(post.likes) ? post.likes.length : 0;
    const commentsCount = Array.isArray(post.comments) ? post.comments.length : 0;

    return `
      <article class="post" data-post-id="${escapeHtml(post.id)}">
        <header>
          <img src="${escapeHtml(profilePicture)}" alt="Profile picture of ${escapeHtml(post.username)}" width="50" height="50" />
          <div>
            <h3>${escapeHtml(post.username)}</h3>
            <p>${escapeHtml(formatPostTime(post.createdAt))}</p>
          </div>
        </header>

        <p>${escapeHtml(post.content)}</p>

        <footer>
          <button type="button" class="like-btn" data-post-id="${escapeHtml(post.id)}">
            Like (${likesCount})
          </button>
          <button type="button" class="comment-btn" data-post-id="${escapeHtml(post.id)}">
            Comment (${commentsCount})
          </button>
          <a href="post.html?id=${encodeURIComponent(post.id)}">View Post</a>
        </footer>
      </article>
    `;
  }

  function getSuggestedUsers() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      return [];
    }

    if (typeof DataManager !== "undefined" && typeof DataManager.getSuggestedUsers === "function") {
      return DataManager.getSuggestedUsers();
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const following = Array.isArray(currentUser.following) ? currentUser.following : [];

    return users
      .filter(function (user) {
        return user.id !== currentUser.id && !following.includes(user.id);
      })
      .slice(0, 5);
  }

  function buildSuggestedUserCard(user) {
    const avatar = user.profilePicture && user.profilePicture.trim() !== ""
      ? user.profilePicture
      : "https://via.placeholder.com/50";
    const bio = user.bio && user.bio.trim() !== ""
      ? user.bio
      : "No bio yet.";

    return `
      <article class="suggested-user">
        <header>
          <img src="${escapeHtml(avatar)}" alt="${escapeHtml(user.username)} avatar" width="50" height="50" />
          <div>
            <h3>${escapeHtml(user.username)}</h3>
            <p>${escapeHtml(bio)}</p>
          </div>
        </header>
        <div class="suggested-actions">
          <a href="profile.html?user=${encodeURIComponent(user.id)}">View Profile</a>
          <button type="button" class="follow-user-btn" data-user-id="${escapeHtml(user.id)}">Follow</button>
        </div>
      </article>
    `;
  }

  function attachPostActions() {
    const likeButtons = document.querySelectorAll(".like-btn");
    const commentButtons = document.querySelectorAll(".comment-btn");

    likeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const currentUser = getCurrentUser();

        if (!currentUser) {
          window.location.href = "login.html";
          return;
        }

        if (typeof DataManager === "undefined" || typeof DataManager.toggleLike !== "function") {
          return;
        }

        const postId = button.getAttribute("data-post-id");
        const result = DataManager.toggleLike(postId);

        if (!result.success) {
          alert(result.message || "Could not update like.");
          return;
        }

        renderPosts();
      });
    });

    commentButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const postId = button.getAttribute("data-post-id");
        window.location.href = "post.html?id=" + encodeURIComponent(postId);
      });
    });
  }

  function attachFollowActions() {
    const followButtons = document.querySelectorAll(".follow-user-btn");

    followButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const currentUser = getCurrentUser();

        if (!currentUser) {
          window.location.href = "login.html";
          return;
        }

        if (typeof DataManager === "undefined" || typeof DataManager.toggleFollow !== "function") {
          return;
        }

        const targetUserId = button.getAttribute("data-user-id");
        const result = DataManager.toggleFollow(targetUserId);

        if (!result.success) {
          alert(result.message || "Could not follow this user.");
          return;
        }

        renderPosts();
        renderSuggestedUsers();
      });
    });
  }

  function renderPosts() {
    const postsContainer = document.querySelector(".feed-posts");
    const currentUser = getCurrentUser();

    if (!postsContainer) {
      return;
    }

    const posts = getFeedPosts();
    postsContainer.innerHTML = "<h2>News Feed</h2>";

    if (posts.length === 0) {
      const following = currentUser && Array.isArray(currentUser.following) ? currentUser.following : [];

      if (following.length === 0) {
        postsContainer.innerHTML += "<p>Follow users to see their posts in your feed.</p>";
      } else {
        postsContainer.innerHTML += "<p>No posts from followed users yet.</p>";
      }
      return;
    }

    posts.forEach(function (post) {
      postsContainer.innerHTML += buildPostCard(post);
    });

    attachPostActions();
  }

  function renderSuggestedUsers() {
    const discoverList = document.getElementById("discoverList");

    if (!discoverList) {
      return;
    }

    const suggestedUsers = getSuggestedUsers();
    discoverList.innerHTML = "";

    if (suggestedUsers.length === 0) {
      discoverList.innerHTML = "<p class=\"muted\">No new suggestions right now.</p>";
      return;
    }

    suggestedUsers.forEach(function (user) {
      discoverList.innerHTML += buildSuggestedUserCard(user);
    });

    attachFollowActions();
  }

  function setupCreatePost() {
    const form = document.querySelector(".create-post form");
    const textarea = document.getElementById("postContent");

    if (!form || !textarea) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const currentUser = getCurrentUser();

      if (!currentUser) {
        window.location.href = "login.html";
        return;
      }

      const content = textarea.value.trim();

      if (content === "") {
        alert("Please write something before posting.");
        return;
      }

      if (typeof DataManager === "undefined" || typeof DataManager.addPost !== "function") {
        return;
      }

      const result = DataManager.addPost({
        content: content
      });

      if (!result.success) {
        alert(result.message || "Could not create post.");
        return;
      }

      textarea.value = "";
      renderPosts();
    });
  }

  function loadFeed() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      window.location.href = "login.html";
      return;
    }

    renderPosts();
    renderSuggestedUsers();
    setupCreatePost();
  }

  window.loadFeed = loadFeed;
})();
