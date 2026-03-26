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

    function createFollowingItem(user) {
        const item = document.createElement("article");
        item.className = "following-item";

        const userInfo = document.createElement("div");
        userInfo.className = "following-user";

        const avatar = document.createElement("img");
        avatar.className = "following-avatar";
        avatar.src = user.profilePicture && user.profilePicture.trim() !== ""
            ? user.profilePicture
            : "https://via.placeholder.com/50";
        avatar.alt = user.username + " avatar";

        const copy = document.createElement("div");
        copy.className = "following-copy";

        const name = document.createElement("h3");
        name.textContent = user.username || "Unknown User";

        const bio = document.createElement("p");
        bio.textContent = user.bio && user.bio.trim() !== "" ? user.bio : "No bio yet.";

        copy.appendChild(name);
        copy.appendChild(bio);
        userInfo.appendChild(avatar);
        userInfo.appendChild(copy);

        const actions = document.createElement("div");
        actions.className = "following-actions";

        const profileLink = document.createElement("a");
        profileLink.className = "btn btn-link btn-sm";
        profileLink.href = "profile.html?user=" + encodeURIComponent(user.id);
        profileLink.textContent = "View Profile";

        const unfollowButton = document.createElement("button");
        unfollowButton.type = "button";
        unfollowButton.className = "btn btn-secondary btn-sm";
        unfollowButton.textContent = "Unfollow";
        unfollowButton.addEventListener("click", function () {
            const result = DataManager.toggleFollow(user.id);

            if (!result.success) {
                alert(result.message || "Could not update follow status.");
                return;
            }

            loadProfile();
        });

        actions.appendChild(profileLink);
        actions.appendChild(unfollowButton);

        item.appendChild(userInfo);
        item.appendChild(actions);

        return item;
    }

    function renderFollowingList(viewedUser, currentUser) {
        const followingSection = document.getElementById("followingSection");
        const followingList = document.getElementById("followingList");

        if (!followingSection || !followingList || !currentUser || currentUser.id !== viewedUser.id) {
            if (followingSection) {
                followingSection.hidden = true;
            }
            return;
        }

        const followingIds = Array.isArray(currentUser.following) ? currentUser.following : [];
        const followedUsers = followingIds
            .map(function (userId) {
                return DataManager.getUserById(userId);
            })
            .filter(Boolean);

        followingSection.hidden = false;
        followingList.textContent = "";

        if (!followedUsers.length) {
            const emptyState = document.createElement("p");
            emptyState.className = "empty-state";
            emptyState.textContent = "You are not following anyone yet.";
            followingList.appendChild(emptyState);
            return;
        }

        followedUsers.forEach(function (user) {
            followingList.appendChild(createFollowingItem(user));
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
        renderFollowingList(viewedUser, currentUser);
        renderUserPosts(viewedUser.id);
        setupPostCreation(viewedUser, currentUser);
        setupProfileActions(viewedUser, currentUser);
    }

    window.loadProfile = loadProfile;
})();
