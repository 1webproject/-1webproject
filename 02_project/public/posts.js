(function attachPostUI() {
    "use strict";

    function isResultSuccess(result) {
        return Boolean(result && (result.success === true || result.ok === true));
    }

    function getResultMessage(result, fallbackMessage) {
        if (!result) {
            return fallbackMessage;
        }

        return result.message || result.error || fallbackMessage;
    }
    function notify(message, type) {
        if (window.AppUI && typeof window.AppUI.notify === "function") {
            window.AppUI.notify(message, type || "error");
            return;
        }
        window.alert(message);
    }

    function formatDateTime(timestamp) {
        return new Intl.DateTimeFormat('en-US', {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(timestamp));
    }
    function createAvatar(user) {
        const avatar = document.createElement("span")
        avatar.className = "avatar";
        avatar.style.backgroundColor = user.avatarColor || "#1f7a8c";
        avatar.textContent = (user.username || "U").charAt(0).toUpperCase();
        avatar.setAttribute("aria-hidden", "true");
        return avatar;
    }

    function createCommentItem(comment, postId, currentUserId, onChange) {
        const wrapper = document.createElement("li");
        wrapper.className = "comment-item";

        const author = DataManager.getUserById(comment.userId);
        const name = document.createElement("strong");
        name.className = "comment-author";
        name.textContent = author ? author.username : "Unknown";

        const text = document.createElement("span");
        text.className = "comment-text";
        text.textContent = comment.content || comment.text || "";

        const time = document.createElement("time");
        time.className = "comment-time";
        time.dateTime = new Date(comment.createdAt).toISOString();
        time.textContent = formatDateTime(comment.createdAt);

        wrapper.appendChild(name);
        wrapper.appendChild(text);
        wrapper.appendChild(time);

        if (currentUserId && comment.userId === currentUserId) {
            const deleteBtn = document.createElement("button");
            deleteBtn.type = "button";
            deleteBtn.className = "btn btn-danger btn-sm comment-delete-btn";
            deleteBtn.textContent = "Delete Comment";
            deleteBtn.addEventListener("click", function () {
                const result = DataManager.deleteComment(postId, comment.id);
                if (!isResultSuccess(result)) {
                    notify(getResultMessage(result, "Could not delete comment."));
                    return;
                }
                if (typeof onChange === "function") {
                    onChange();
                }
            });
            wrapper.appendChild(deleteBtn);
        }

        return wrapper;
    }

    function createPostCard(post, options) {
        const config = options || {};
        const showDelete = config.showDelete !== false;
        const showCommentForm = config.showCommentForm !== false;
        const commentsLimit =
            typeof config.commentsLimit === "number" ? config.commentsLimit : 2;
        const showDetailLink = config.showDetailLink !== false;

        const currentUserId = config.currentUserId || null;
        const author = DataManager.getUserById(post.userId);
        const authorName = author ? author.username : "Unknown User";
        const postLikes = Array.isArray(post.likes) ? post.likes : [];
        const postComments = Array.isArray(post.comments) ? post.comments : [];

        const article = document.createElement("article");
        article.className = "post-card";
        article.dataset.postId = post.id;

        const header = document.createElement("header");
        header.className = "post-head";
        const userAnchor = document.createElement("a");
        userAnchor.href = "profile.html?user=" + encodeURIComponent(post.userId);
        userAnchor.className = "post-user";
        userAnchor.appendChild(createAvatar(author || { username: "U" }));

        const userMeta = document.createElement("div");
        userMeta.className = "post-meta";
        const username = document.createElement("strong");
        username.textContent = authorName;
        const time = document.createElement("time");
        time.dateTime = new Date(post.createdAt).toISOString();
        time.textContent = formatDateTime(post.createdAt);
        userMeta.appendChild(username);
        userMeta.appendChild(time);
        userAnchor.appendChild(userMeta);

        header.appendChild(userAnchor);
        if (showDelete && currentUserId && currentUserId === post.userId) {
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "btn btn-danger btn-sm";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", function onDeleteClick() {
                const result = DataManager.deletePost(post.id);
                if (!isResultSuccess(result)) {
                    notify(getResultMessage(result, "Could not delete post."));
                    return;
                }
                if (typeof config.onChange === "function") {
                    config.onChange();
                }
            });
            header.appendChild(deleteButton);
        }

        const content = document.createElement("p")
        content.className = "post-content";
        content.textContent = post.content;

        let postImage = null;
        if (post.image && String(post.image).trim() !== "") {
            postImage = document.createElement("img");
            postImage.className = "post-image";
            postImage.src = post.image;
            postImage.alt = "Post image";
        }

        const actionBar = document.createElement("div");
        actionBar.className = "post-actions";

        const likeButton = document.createElement("button");
        likeButton.type = "button";
        likeButton.className = "btn btn-secondary btn-sm";
        const liked = currentUserId ? postLikes.includes(currentUserId) : false;
        likeButton.textContent = (liked ? "Unlike" : "Like") + " (" + postLikes.length + ")";
        likeButton.addEventListener("click", function onLikeClick() {
            if (!currentUserId) {
                window.location.href = "login.html";
                return;
            }
            const result = DataManager.toggleLike(post.id);
            if (!isResultSuccess(result)) {
                notify(getResultMessage(result, "Could not update like."));
                return;
            }
            if (typeof config.onChange === "function") {
                config.onChange();
            }
        });
        actionBar.appendChild(likeButton);

        const commentCount = document.createElement("span");
        commentCount.className = "muted";
        commentCount.textContent = postComments.length + " comment(s)";
        actionBar.appendChild(commentCount);

        if (showDetailLink) {
            const detailLink = document.createElement("a");
            detailLink.className = "btn btn-link btn-sm";
            detailLink.href = "post.html?id=" + encodeURIComponent(post.id);
            detailLink.textContent = "View Details";
            actionBar.appendChild(detailLink);
        }

        const commentsSection = document.createElement("section");
        commentsSection.className = "post-comments";
        const commentsHeader = document.createElement("h4");
        commentsHeader.textContent = "Comments";
        commentsSection.appendChild(commentsHeader);

        const commentsList = document.createElement("ul");
        commentsList.className = "comment-list";
        const comments = postComments.slice(-commentsLimit);
        if (comments.length === 0) {
            const emptyComment = document.createElement("li");
            emptyComment.className = "muted";
            emptyComment.textContent = "No comments yet.";
            commentsList.appendChild(emptyComment);
        } else {
            comments.forEach(function appendComment(comment) {
                commentsList.appendChild(createCommentItem(comment, post.id, currentUserId, config.onChange));
            });
        }
        commentsSection.appendChild(commentsList);

        if (showCommentForm) {
            const form = document.createElement("form");
            form.className = "comment-form";
            const input = document.createElement("input");
            input.type = "text";
            input.name = "comment";
            input.maxLength = 200;
            input.placeholder = "Write a comment...";
            input.required = true;
            const button = document.createElement("button");
            button.type = "submit";
            button.className = "btn btn-primary btn-sm";
            button.textContent = "Comment";
            form.appendChild(input);
            form.appendChild(button);

            form.addEventListener("submit", function onCommentSubmit(event) {
                event.preventDefault();
                if (!currentUserId) {
                    window.location.href = "login.html";
                    return;
                }
                const commentText = input.value.trim();
                const result = DataManager.addComment(post.id, commentText);
                if (!isResultSuccess(result)) {
                    notify(getResultMessage(result, "Could not add comment."));
                    return;
                }
                form.reset();
                if (typeof config.onChange === "function") {
                    config.onChange();
                }
            });

            commentsSection.appendChild(form);
        }

        article.appendChild(header);
        article.appendChild(content);
        if (postImage) {
            article.appendChild(postImage);
        }
        article.appendChild(actionBar);
        article.appendChild(commentsSection);

        return article;
    }

    function renderPostList(container, posts, options) {
        container.textContent = "";
        if (!posts.length) {
            const empty = document.createElement("p");
            empty.className = "empty-state";
            empty.textContent = "No posts yet.";
            container.appendChild(empty);
            return;
        }
        posts.forEach(function appendPost(post) {
            container.appendChild(createPostCard(post, options));
        });
    }

    window.postUI = {
        formatDateTime: formatDateTime,
        createPostCard: createPostCard,
        renderPostList: renderPostList,
    };

    function loadPost() {
        const params = new URLSearchParams(window.location.search);
        const postId = params.get("id");
        const container = document.querySelector(".single-post");

        if (!container) {
            return;
        }

        if (!postId) {
            container.innerHTML = "<h2>Post Details</h2><p>Post not found.</p>";
            return;
        }

        const post = DataManager.getPostsById(postId);

        if (!post) {
            container.innerHTML = "<h2>Post Details</h2><p>Post not found.</p>";
            return;
        }

        const currentUser = DataManager.getCurrentUser();
        const currentUserId = currentUser ? currentUser.id : null;

        container.innerHTML = "<h2>Post Details</h2>";

        const postCard = window.postUI.createPostCard(post, {
            currentUserId: currentUserId,
            showCommentForm: true,
            commentsLimit: 100,
            showDetailLink: false,
            onChange: loadPost
        });

        container.appendChild(postCard);
    }
    window.loadPost = loadPost;
})();
