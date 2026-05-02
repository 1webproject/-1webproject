(function () {
  "use strict";

  function getCurrentUser() {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  }

  async function getFeedPosts() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      return [];
    }

    const posts = await fetch("/api/posts").then(function (res) {
      return res.json();
    });

    const users = await fetch("/api/users").then(function (res) {
      return res.json();
    });

    const freshCurrentUser = users.find(function (user) {
      return user.id === currentUser.id;
    });

    const followingIds = freshCurrentUser.following.map(function (follow) {
      return follow.followingId;
    });

    return posts.filter(function (post) {
      return post.userId === currentUser.id || followingIds.includes(post.userId);
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
    return isNaN(date.getTime()) ? "Unknown time" : date.toLocaleString();
  }

  function notify(message) {
    alert(message);
  }

  function buildPostCard(post) {
    const profilePicture =
      post.user?.avatar && post.user.avatar.trim() !== ""
        ? post.user.avatar
        : "https://via.placeholder.com/50";

    const likesCount = Array.isArray(post.likes) ? post.likes.length : 0;
    const commentsCount = Array.isArray(post.comments) ? post.comments.length : 0;

    return `
      <article class="post" data-post-id="${escapeHtml(post.id)}">
        <header>
  <a href="profile.html?user=${encodeURIComponent(post.userId)}" class="post-user-link">
    <img src="${escapeHtml(profilePicture)}" alt="Profile picture" width="50" height="50" />
  </a>
  <div>
    <a href="profile.html?user=${encodeURIComponent(post.userId)}" class="post-user-link">
      <h3>${escapeHtml(post.user?.username || "Unknown User")}</h3>
    </a>
    <p>${escapeHtml(formatPostTime(post.createdAt))}</p>
  </div>
</header>

        <p>${escapeHtml(post.content)}</p>
        ${post.image ? `<img class="post-image" src="${escapeHtml(post.image)}" alt="Post image" />` : ""}

        <footer>
          <button type="button" disabled>Like (${likesCount})</button>
          <button type="button" disabled>Comment (${commentsCount})</button>
          <a href="post.html?id=${encodeURIComponent(post.id)}">View Post</a>
        </footer>
      </article>
    `;
  }

  async function renderPosts() {
    const postsContainer = document.querySelector(".feed-posts");

    if (!postsContainer) {
      return;
    }

    const posts = await getFeedPosts();

    postsContainer.innerHTML = "<h2>News Feed</h2>";

    if (posts.length === 0) {
      postsContainer.innerHTML += "<p>No posts yet.</p>";
      return;
    }

    posts.forEach(function (post) {
      postsContainer.innerHTML += buildPostCard(post);
    });
  }

  async function renderSuggestedUsers() {
    const discoverList = document.getElementById("discoverList");

    if (!discoverList) {
      return;
    }

    const searchInput = document.getElementById("discoverSearch");
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

    const users = await fetch("/api/users").then(function (res) {
      return res.json();
    });

    const currentUser = getCurrentUser();

    const filteredUsers = users.filter(function (user) {
      const isCurrentUser = currentUser && user.id === currentUser.id;
      const username = String(user.username || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();

      return (
        !isCurrentUser &&
        (query === "" || username.includes(query) || email.includes(query))
      );
    });

    discoverList.innerHTML = "";

    if (filteredUsers.length === 0) {
      discoverList.innerHTML = '<p class="muted">No users found.</p>';
      return;
    }

    filteredUsers.forEach(function (user) {
      discoverList.innerHTML += `
      <article class="suggested-user">

        <header class="discover-user-link" data-user-id="${user.id}">
          <img src="${escapeHtml(user.avatar || "https://via.placeholder.com/50")}" />
          
          <div>
            <h3>${escapeHtml(user.username)}</h3>
            <p>${escapeHtml(user.bio || "No bio yet.")}</p>
          </div>
        </header>

        <button 
          class="follow-btn"
          data-user-id="${user.id}">
          Follow
        </button>

      </article>
    `;
    });

    document.querySelectorAll(".discover-user-link").forEach(function (element) {
      element.addEventListener("click", function () {
        const userId = element.dataset.userId;
        window.location.href = "profile.html?user=" + userId;
      });
    });

    document.querySelectorAll(".follow-user-btn").forEach(function (button) {

      button.addEventListener("click", async function () {

        const userId =
          button.getAttribute("data-user-id");

        await fetch("/api/users", {

          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            currentUserId: currentUser.id,
            targetUserId: userId,
          }),

        });

        notify("User followed.", "success");

        await renderPosts();
        await renderSuggestedUsers();

      });
    });



    discoverList.innerHTML = "";

    if (filteredUsers.length === 0) {
      discoverList.innerHTML = '<p class="muted">No users found.</p>';
      return;
    }

    filteredUsers.forEach(function (user) {
      discoverList.innerHTML += `
    <article class="suggested-user">
      <header class="discover-user-link" data-user-id="${escapeHtml(user.id)}">
        <img src="${escapeHtml(user.avatar || "https://via.placeholder.com/50")}" alt="${escapeHtml(user.username)} avatar" width="50" height="50" />
        <div>
          <h3>${escapeHtml(user.username)}</h3>
          <p>${escapeHtml(user.bio || "No bio yet.")}</p>
        </div>
      </header>

      <div class="suggested-actions">
        <a href="profile.html?user=${encodeURIComponent(user.id)}">View Profile</a>
        <button type="button" class="follow-user-btn" data-user-id="${escapeHtml(user.id)}">
          Follow
        </button>
      </div>
    </article>
  `;
    });

    document.querySelectorAll(".discover-user-link").forEach(function (element) {
      element.addEventListener("click", function () {
        const userId = element.getAttribute("data-user-id");
        window.location.href = "profile.html?user=" + encodeURIComponent(userId);
      });
    });
  }


  function setupCreatePost() {
    const form = document.querySelector(".create-post form");
    const textarea = document.getElementById("postContent");
    const imageInput = document.getElementById("postImage");

    if (!form || !textarea) {
      return;
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const currentUser = getCurrentUser();
      const content = textarea.value.trim();
      const file = imageInput && imageInput.files ? imageInput.files[0] : null;

      if (!currentUser) {
        window.location.href = "login.html";
        return;
      }

      if (content === "") {
        notify("Please write something before posting.");
        return;
      }

      function createPost(imageData) {
        return fetch("/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: content,
            image: imageData || "",
            userId: currentUser.id,
          }),
        });
      }

      if (!file) {
        await createPost("");
        textarea.value = "";
        if (imageInput) imageInput.value = "";
        await renderPosts();
        return;
      }

      const reader = new FileReader();

      reader.onload = async function (loadEvent) {
        await createPost(loadEvent.target.result);
        textarea.value = "";
        imageInput.value = "";
        await renderPosts();
      };

      reader.onerror = function () {
        notify("Could not read selected image.");
      };

      reader.readAsDataURL(file);
    });
  }

  async function loadFeed() {
    await renderPosts();
    await renderSuggestedUsers();
    setupCreatePost();
    const searchInput = document.getElementById("discoverSearch");

    if (searchInput) {
      searchInput.addEventListener("input", renderSuggestedUsers);
    }
  }

  window.loadFeed = loadFeed;
})();