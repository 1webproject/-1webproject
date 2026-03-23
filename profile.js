(function profilePageController() {
    "use strict";

    function byId(id) {
        return document.getElementById(id);
    }

    function getTargetUserId(currentUserId) {
        const params = new URLSearchParams(window.location.search);
        return params.get("user") || currentUserId;
    }

    function renderProfileHeader(currentUser, profileUser) {
        const name = byId("profileName");
        const email = byId("profileEmail");
        const bio = byId("profileBio");
        const avatar = byId("profileAvatar");
        const postsCount = byId("profilePostCount");
        const followButton = byId("followToggleBtn");
        const myProfileLink = byId("myProfileLink");

        if (myProfileLink) {
            myProfileLink.href = "profile.html?user=" + encodeURIComponent(currentUser.id);
        }
        if (name) {
            name.textContent = profileUser.username;
        }
        if (email) {
            email.textContent = profileUser.email;
        }
        if (bio) {
            bio.textContent = profileUser.bio || "No bio yet.";
        }
        if (avatar) {
            avatar.textContent = profileUser.username.charAt(0).toUpperCase();
            avatar.style.backgroundColor = profileUser.avatarColor || "#1f7a8c";
        }

        const postTotal = window.SocialStore.getUserPosts(profileUser.id).length;
        if (postsCount) {
            postsCount.textContent = String(postTotal);
        }

        if (!followButton) {
            return;
        }
        if (profileUser.id === currentUser.id) {
            followButton.classList.add("is-hidden");
            return;
        }
        followButton.classList.remove("is-hidden");
        const following = window.SocialStore.isFollowing(currentUser.id, profileUser.id);
        followButton.textContent = following ? "Unfollow" : "Follow";
        followButton.className =
            "btn " + (following ? "btn-secondary" : "btn-primary");
        followButton.onclick = function onFollowClick() {
            const result = window.SocialStore.toggleFollow(currentUser.id, profileUser.id);
            if (!result.ok) {
                window.alert(result.error);
                return;
            }
            renderPage();
        };
    }

    function renderPosts(currentUser, profileUser) {
        const container = byId("profilePosts");
        if (!container) {
            return;
        }
        const posts = window.SocialStore.getUserPosts(profileUser.id);
        window.PostUI.renderPostList(container, posts, {
            currentUserId: currentUser.id,
            commentsLimit: 3,
            showDetailLink: true,
            showDelete: true,
            showCommentForm: true,
            onChange: renderPage,
        });
    }

    function setupEditor(currentUser, profileUser) {
        const section = byId("editProfileSection");
        const form = byId("editProfileForm");
        const error = byId("editProfileError");
        const username = byId("editUsername");
        const email = byId("editEmail");
        const bio = byId("editBio");
        const avatarColor = byId("editAvatarColor");
        const bioCounter = byId("bioCounter");

        if (!section || !form || !error || !username || !email || !bio || !avatarColor) {
            return;
        }

        if (profileUser.id !== currentUser.id) {
            section.classList.add("is-hidden");
            return;
        }
        section.classList.remove("is-hidden");
        username.value = profileUser.username;
        email.value = profileUser.email;
        bio.value = profileUser.bio || "";
        avatarColor.value = profileUser.avatarColor || "#1f7a8c";
        if (bioCounter) {
            bioCounter.textContent = bio.value.length + "/180";
        }

        bio.oninput = function onBioInput() {
            if (bioCounter) {
                bioCounter.textContent = bio.value.length + "/180";
            }
        };

        form.onsubmit = function onProfileSubmit(event) {
            event.preventDefault();
            error.textContent = "";
            const result = window.SocialStore.updateProfile(currentUser.id, {
                username: username.value,
                email: email.value,
                bio: bio.value,
                avatarColor: avatarColor.value,
            });
            if (!result.ok) {
                error.textContent = result.error;
                return;
            }
            renderPage();
        };
    }

    function renderPage() {
        const currentUser = window.SocialStore.getCurrentUser();
        if (!currentUser) {
            window.location.href = "login.html";
            return;
        }

        window.AuthUI.setCurrentUserName("#navUserName");
        const targetUserId = getTargetUserId(currentUser.id);
        const profileUser = window.SocialStore.getUserById(targetUserId);
        if (!profileUser) {
            const container = byId("profilePosts");
            if (container) {
                container.innerHTML = "<p class='empty-state'>Profile not found.</p>";
            }
            return;
        }

        renderProfileHeader(currentUser, profileUser);
        setupEditor(currentUser, profileUser);
        renderPosts(currentUser, profileUser);
    }

    function init() {
        const currentUser = window.AuthUI.requireAuth();
        if (!currentUser) {
            return;
        }
        window.AuthUI.bindLogoutButton("#logoutBtn");
        renderPage();
    }

    document.addEventListener("DOMContentLoaded", init);
})();