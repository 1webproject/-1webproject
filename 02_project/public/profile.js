(function () {
    "use strict";

    function getProfileUserId() {
        const params = new URLSearchParams(window.location.search);
        return params.get("user");
    }

    async function getUsers() {
        return fetch("/api/users").then((res) =>
            res.json()
        );
    }

    async function getPosts() {
        return fetch("/api/posts").then((res) =>
            res.json()
        );
    }

    async function getViewedUser() {
        const users = await getUsers();
        const userId = getProfileUserId();

        if (userId) {
            return users.find(function (user) {
                return user.id === userId;
            });
        }

        const savedUser = localStorage.getItem("currentUser");
        return savedUser ? JSON.parse(savedUser) : null;
    }

    function fillProfileInfo(user) {

        const nameEl =
            document.getElementById("name");

        const handleEl =
            document.getElementById("handle");

        const bioEl =
            document.getElementById("bio");

        const postsCountEl =
            document.getElementById("postsCount");

        const followersCountEl =
            document.getElementById("followersCount");

        const followingCountEl =
            document.getElementById("followingCount");

        if (nameEl) {
            nameEl.textContent =
                user.username;
        }

        if (handleEl) {
            handleEl.textContent =
                "@" + user.username.toLowerCase();
        }

        if (bioEl) {
            bioEl.textContent =
                user.bio || "No bio yet.";
        }

        if (postsCountEl) {
            postsCountEl.textContent =
                user.posts.length;
        }

        if (followersCountEl) {
            followersCountEl.textContent =
                user.followers.length;
        }

        if (followingCountEl) {
            followingCountEl.textContent =
                user.following.length;
        }
    }

    function buildPost(post) {
        return `
      <article class="post-card">
        <p>${post.content}</p>
      </article>
    `;
    }

    async function renderUserPosts(userId) {

        const container =
            document.getElementById(
                "postsContainer"
            );

        if (!container) {
            return;
        }

        const posts =
            await getPosts();

        const userPosts =
            posts.filter(function (post) {
                return post.userId === userId;
            });

        container.innerHTML = "";

        if (!userPosts.length) {
            container.innerHTML =
                "<p>No posts yet.</p>";
            return;
        }

        userPosts.forEach(function (post) {
            container.innerHTML +=
                buildPost(post);
        });
    }
    async function setupProfileActions(viewedUser) {
        const actionsBox = document.querySelector(".profile-actions");

        if (!actionsBox) {
            return;
        }

        const savedUser = localStorage.getItem("currentUser");
        const currentUser = savedUser ? JSON.parse(savedUser) : null;

        actionsBox.innerHTML = "";

        if (!currentUser || currentUser.id === viewedUser.id) {
            return;
        }

        const users = await fetch("/api/users").then(function (res) {
            return res.json();
        });

        const freshCurrentUser = users.find(function (user) {
            return user.id === currentUser.id;
        });

        const followingIds = freshCurrentUser.following.map(function (follow) {
            return follow.followingId;
        });

        const isFollowing = followingIds.includes(viewedUser.id);

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = isFollowing ? "Unfollow" : "Follow";
        button.addEventListener("click", async function () {
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
        });

        actionsBox.appendChild(button);
    }

    async function loadProfile() {

        const viewedUser =
            await getViewedUser();
        await setupProfileActions(viewedUser);

        if (!viewedUser) {
            return;
        }

        fillProfileInfo(
            viewedUser
        );

        await renderUserPosts(
            viewedUser.id
        );
        const savedUser = localStorage.getItem("currentUser");
        const currentUser = savedUser ? JSON.parse(savedUser) : null;

        const createPostBox = document.querySelector(".create-post");

        if (createPostBox && (!currentUser || currentUser.id !== viewedUser.id)) {
            createPostBox.style.display = "none";
        } else if (createPostBox) {
            createPostBox.style.display = "block";
        }
    }

    window.loadProfile =
        loadProfile;

})();