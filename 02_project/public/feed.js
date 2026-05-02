(function () {
  "use strict";

  function getCurrentUser() {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  }

  async function getFeedPosts() {
    return fetch("/api/posts").then((res) => res.json());
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
          <img src="${escapeHtml(profilePicture)}" alt="Profile picture" width="50" height="50" />
          <div>
            <h3>${escapeHtml(post.user?.username || "Unknown User")}</h3>
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

    const users = await fetch("/api/users").then((res) => res.json());
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
        <header>
          <img src="${escapeHtml(user.avatar || "https://via.placeholder.com/50")}" alt="${escapeHtml(user.username)} avatar" width="50" height="50" />
          <div>
            <h3>${escapeHtml(user.username)}</h3>
            <p>${escapeHtml(user.bio || "No bio yet.")}</p>
          </div>
        </header>
      </article>
    `;
    });
  }


  function setupCreatePost() {
    const form = document.querySelector(".create-post form");
    const textarea = document.getElementById("postContent");

    if (!form || !textarea) {
      return;
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const currentUser = await getCurrentUser();
      const content = textarea.value.trim();

      if (!currentUser) {
        notify("No user found.");
        return;
      }

      if (content === "") {
        notify("Please write something before posting.");
        return;
      }

      await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content,
          userId: currentUser.id,
        }),
      });

      textarea.value = "";
      await renderPosts();
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