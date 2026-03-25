(function () {
    "use strict";

    function getProfileUserId() {
        const params = new URLSearchParams(window.location.search);
        return params.get("user");
    }

    function getViewedUser() {
        const userIdFromUrl = getProfileUserId();

        if (userIdFromUrl) {
            return DataManager.getUserById(userIdFromUrl);
        }

        return DataManager.getCurrentUser();
    }

    function fillProfileInfo(user) {
        const nameEl = document.getElementById("name");
        const handleEl = document.getElementById("handle");
        const bioEl = document.getElementById("bio");
        const postsCountEl = document.getElementById("postsCount");
        const followersCountEl = document.getElementById("followersCount");
        const followingCountEl = document.getElementById("followingCount");
        const profileImg = document.querySelector(".profile-img");

        if (nameEl) {
            nameEl.textContent = user.username || "Unknown User";
        }

        if (handleEl) {
            handleEl.textContent = "@" + (user.username || "user").toLowerCase().replace(/\s+/g, "");
        }

        if (bioEl) {
            bioEl.textContent = user.bio && user.bio.trim() !== "" ? user.bio : "No bio yet.";
        }

        if (profileImg && user.profilePicture) {
            profileImg.src = user.profilePicture;
            profileImg.alt = user.username + " profile picture";
        }

        const stats = DataManager.getStats(user.id);

        if (postsCountEl) {
            postsCountEl.textContent = stats.postCount;
        }

        if (followersCountEl) {
            followersCountEl.textContent = stats.followersCount;
        }

        if (followingCountEl) {
            followingCountEl.textContent = stats.followingCount;
        }
    }

    function renderUserPosts(userId) {
        const postsContainer = document.getElementById("postsContainer");

        if (!postsContainer) {
            return;
        }

        const posts = DataManager.getUserPosts(userId);

        postsContainer.innerHTML = "";

        if (!posts.length) {
            postsContainer.innerHTML = "<p>No posts yet.</p>";
            return;
        }

        const currentUser = DataManager.getCurrentUser();
        const currentUserId = currentUser ? currentUser.id : null;

        window.postUI.renderPostList(postsContainer, posts, {
            currentUserId: currentUserId,
            showCommentForm: true,
            commentsLimit: 2,
            showDetailLink: true,
            onChange: loadProfile
        });
    }

    function setupPostCreation(viewedUser, currentUser) {
        const postInput = document.getElementById("postInput");
        const postBtn = document.getElementById("postBtn");

        if (!postInput || !postBtn) {
            return;
        }

        if (!currentUser || currentUser.id !== viewedUser.id) {
            postInput.disabled = true;
            postBtn.disabled = true;
            postBtn.onclick = null;
            postInput.placeholder = "You can only post on your own profile.";
            return;
        }

        postInput.disabled = false;
        postBtn.disabled = false;
        postInput.placeholder = "Share something...";

        postBtn.onclick = function () {
            const content = postInput.value.trim();

            if (content === "") {
                alert("Please write something before posting.");
                return;
            }

            const result = DataManager.addPost({ content: content });

            if (!result.success) {
                alert(result.message || "Could not create post.");
                return;
            }

            postInput.value = "";
            loadProfile();
        };
    }

    function setupProfileActions(viewedUser, currentUser) {
        const actionsBox = document.querySelector(".profile-actions");

        if (!actionsBox || !currentUser) {
            return;
        }

        actionsBox.innerHTML = "";

        if (currentUser.id === viewedUser.id) {
            const editBtn = document.createElement("button");
            editBtn.id = "editBtn";
            editBtn.textContent = "Edit Profile";
            editBtn.onclick = function () {
                const newBio = prompt("Edit your bio:", viewedUser.bio || "");

                if (newBio === null) {
                    return;
                }

                const result = DataManager.updateUser(viewedUser.id, {
                    bio: newBio.trim()
                });

                if (!result.success) {
                    alert(result.message || "Could not update profile.");
                    return;
                }

                loadProfile();
            };
            actionsBox.appendChild(editBtn);
            return;
        }

        const followBtn = document.createElement("button");
        followBtn.id = "followBtn";

        const following = Array.isArray(currentUser.following) ? currentUser.following : [];
        const isFollowing = following.includes(viewedUser.id);
        followBtn.textContent = isFollowing ? "Unfollow" : "Follow";

        followBtn.onclick = function () {
            const result = DataManager.toggleFollow(viewedUser.id);

            if (!result.success) {
                alert(result.message || "Could not update follow status.");
                return;
            }

            loadProfile();
        };

        actionsBox.appendChild(followBtn);
    }

    function loadProfile() {
        const currentUser = DataManager.getCurrentUser();

        if (!currentUser) {
            window.location.href = "login.html";
            return;
        }

        const viewedUser = getViewedUser();

        if (!viewedUser) {
            const profilePage = document.querySelector(".profile-page");
            if (profilePage) {
                profilePage.innerHTML = "<p>User not found.</p>";
            }
            return;
        }

        fillProfileInfo(viewedUser);
        renderUserPosts(viewedUser.id);
        setupPostCreation(viewedUser, currentUser);
        setupProfileActions(viewedUser, currentUser);
    }

    window.loadProfile = loadProfile;
})();
