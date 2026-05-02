(function () {
    "use strict";

    function getCurrentUser() {
        const savedUser = localStorage.getItem("currentUser");
        return savedUser ? JSON.parse(savedUser) : null;
    }

    function getProfileUserId() {
        const params = new URLSearchParams(window.location.search);
        return params.get("user");
    }

    async function getUsers() {
        return fetch("/api/users").then((res) => res.json());
    }

    async function getPosts() {
        return fetch("/api/posts").then((res) => res.json());
    }

    async function getViewedUser() {
        const users = await getUsers();
        const userId = getProfileUserId();
        const currentUser = getCurrentUser();

        if (userId) {
            return users.find((user) => user.id === userId);
        }

        return users.find((user) => currentUser && user.id === currentUser.id);
    }

    function fillProfileInfo(user) {
        document.getElementById("name").textContent = user.username;
        document.getElementById("handle").textContent = "@" + user.username.toLowerCase();
        document.getElementById("bio").textContent = user.bio || "No bio yet.";

        document.getElementById("postsCount").textContent = user.posts.length;
        document.getElementById("followersCount").textContent = user.followers.length;
        document.getElementById("followingCount").textContent = user.following.length;

        const profileImg = document.querySelector(".profile-img");
        if (profileImg) {
            profileImg.src = user.avatar || "https://via.placeholder.com/120";
        }
    }

    function buildPost(post) {

        const currentUser = getCurrentUser();

        const isOwner =
            currentUser &&
            currentUser.id === post.userId;
        const profilePicture =
            post.user?.avatar && post.user.avatar.trim() !== ""
                ? post.user.avatar
                : "https://via.placeholder.com/50";

        const likesCount = Array.isArray(post.likes) ? post.likes.length : 0;
        const commentsCount = Array.isArray(post.comments) ? post.comments.length : 0;

        return `
    <article class="post" data-post-id="${post.id}">
      <header>
        <a href="profile.html?user=${encodeURIComponent(post.userId)}" class="post-user-link">
          <img src="${profilePicture}" alt="Profile picture" width="50" height="50" />
        </a>

        <div>
          <a href="profile.html?user=${encodeURIComponent(post.userId)}" class="post-user-link">
            <h3>${post.user?.username || "Unknown User"}</h3>
          </a>
          <p>${new Date(post.createdAt).toLocaleString()}</p>
        </div>
      </header>

      <p>${post.content}</p>

      ${post.image ? `<img class="post-image" src="${post.image}" alt="Post image" />` : ""}

      <footer>
        <button type="button" class="like-btn" data-post-id="${post.id}">
          Like (${likesCount})
        </button>

        <a class="comment-btn" href="post.html?id=${encodeURIComponent(post.id)}">
          Comment (${commentsCount})
        </a>

        <a href="post.html?id=${encodeURIComponent(post.id)}">View Post</a>
        ${isOwner ? `
  <button
    type="button"
    class="delete-post-btn"
    data-post-id="${post.id}">
    Delete
  </button>
` : ""}
      </footer>
    </article>
  `;
    }

    async function renderUserPosts(userId) {
        const container = document.getElementById("postsContainer");
        const posts = await getPosts();

        const userPosts = posts.filter((post) => post.userId === userId);

        container.innerHTML = "";

        if (userPosts.length === 0) {
            container.innerHTML += "<p>No posts yet.</p>";
            return;
        }

        userPosts.forEach((post) => {
            container.innerHTML += buildPost(post);
        });
        attachLikeActions();
        attachDeleteActions();
    }

    function setupCreatePost(viewedUser) {
        const currentUser = getCurrentUser();
        const createPostBox = document.querySelector(".create-post");
        const postInput = document.getElementById("postInput");
        const postBtn = document.getElementById("postBtn");

        if (!createPostBox || !postInput || !postBtn) return;

        if (!currentUser || currentUser.id !== viewedUser.id) {
            createPostBox.style.display = "none";
            return;
        }

        createPostBox.style.display = "block";

        let imageInput = document.getElementById("profilePostImage");

        if (!imageInput) {
            imageInput = document.createElement("input");
            imageInput.type = "file";
            imageInput.id = "profilePostImage";
            imageInput.accept = "image/*";
            postInput.after(imageInput);
        }

        postBtn.onclick = async function () {
            const content = postInput.value.trim();
            const file = imageInput.files ? imageInput.files[0] : null;

            if (content === "") {
                alert("Please write something before posting.");
                return;
            }

            function createPost(imageData) {
                return fetch("/api/posts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        content,
                        image: imageData || "",
                        userId: currentUser.id,
                    }),
                });
            }

            if (!file) {
                await createPost("");
                postInput.value = "";
                imageInput.value = "";
                await loadProfile();
                return;
            }

            const reader = new FileReader();

            reader.onload = async function (event) {
                await createPost(event.target.result);
                postInput.value = "";
                imageInput.value = "";
                await loadProfile();
            };

            reader.readAsDataURL(file);
        };
    }

    async function setupProfileActions(viewedUser) {
        const actionsBox = document.querySelector(".profile-actions");
        const currentUser = getCurrentUser();

        if (!actionsBox || !currentUser) return;

        actionsBox.innerHTML = "";

        if (currentUser.id === viewedUser.id) {
            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit Profile";

            editBtn.onclick = function () {
                window.AppUI.openProfileEditor(viewedUser, async function (payload) {
                    const updatedUser = await fetch("/api/users", {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            id: viewedUser.id,
                            bio: payload.bio,
                            avatar: payload.profilePicture || viewedUser.avatar,
                        }),
                    }).then((res) => res.json());

                    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
                    await loadProfile();
                });
            };

            actionsBox.appendChild(editBtn);
            return;
        }

        const users = await getUsers();
        const freshCurrentUser = users.find((user) => user.id === currentUser.id);

        const followingIds = freshCurrentUser.following.map((follow) => follow.followingId);
        const isFollowing = followingIds.includes(viewedUser.id);

        const followBtn = document.createElement("button");
        followBtn.textContent = isFollowing ? "Unfollow" : "Follow";

        followBtn.onclick = async function () {
            await fetch("/api/users", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    currentUserId: currentUser.id,
                    targetUserId: viewedUser.id,
                }),
            });

            await loadProfile();
        };

        actionsBox.appendChild(followBtn);
    }

    async function showUserList(type, viewedUser) {
        const section = document.getElementById("followingSection");
        const list = document.getElementById("followingList");

        if (!section || !list) return;

        const users = await getUsers();

        const ids =
            type === "followers"
                ? viewedUser.followers.map((follow) => follow.followerId)
                : viewedUser.following.map((follow) => follow.followingId);

        section.hidden = false;
        list.innerHTML = `<h2>${type === "followers" ? "Followers" : "Following"}</h2>`;

        if (ids.length === 0) {
            list.innerHTML += "<p>No users found.</p>";
            return;
        }

        ids.forEach((id) => {
            const user = users.find((u) => u.id === id);

            if (!user) return;

            list.innerHTML += `
  <article class="following-item">

    <div class="following-user-info">

      <img
        src="${user.avatar || "https://via.placeholder.com/50"}"
        alt="${user.username} avatar"
        width="50"
        height="50"
      />

      <div>
        <h3>${user.username}</h3>
        <p>${user.bio || "No bio yet."}</p>
      </div>

    </div>

    <a href="profile.html?user=${encodeURIComponent(user.id)}">
      View Profile
    </a>

  </article>
`;
        });
    }

    function setupFollowersClicks(viewedUser) {
        const followersCount = document.getElementById("followersCount");
        const followingCount = document.getElementById("followingCount");

        if (followersCount) {
            followersCount.parentElement.style.cursor = "pointer";
            followersCount.parentElement.onclick = function () {
                showUserList("followers", viewedUser);
            };
        }

        if (followingCount) {
            followingCount.parentElement.style.cursor = "pointer";
            followingCount.parentElement.onclick = function () {
                showUserList("following", viewedUser);
            };
        }
    }
    function attachLikeActions() {
        document.querySelectorAll(".like-btn").forEach(function (button) {
            button.addEventListener("click", async function () {
                const currentUser = getCurrentUser();

                if (!currentUser) {
                    window.location.href = "login.html";
                    return;
                }

                const postId = button.getAttribute("data-post-id");

                await fetch("/api/posts", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        postId,
                        userId: currentUser.id,
                    }),
                });

                await loadProfile();
            });
        });
    }
    function attachDeleteActions() {

        document
            .querySelectorAll(".delete-post-btn")
            .forEach(function (button) {

                button.addEventListener("click", async function () {

                    const postId =
                        button.getAttribute("data-post-id");

                    await fetch("/api/posts", {
                        method: "DELETE",

                        headers: {
                            "Content-Type": "application/json",
                        },

                        body: JSON.stringify({
                            postId,
                        }),
                    });

                    await loadProfile();

                });

            });

    }

    async function loadProfile() {
        const viewedUser = await getViewedUser();

        if (!viewedUser) {
            document.querySelector(".profile-page").innerHTML = "<p>User not found.</p>";
            return;
        }

        fillProfileInfo(viewedUser);
        await renderUserPosts(viewedUser.id);
        setupCreatePost(viewedUser);
        await setupProfileActions(viewedUser);
        setupFollowersClicks(viewedUser);
    }

    window.loadProfile = loadProfile;
})();