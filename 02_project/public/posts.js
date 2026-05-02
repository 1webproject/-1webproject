(function () {
    "use strict";

    function formatDateTime(timestamp) {
        return new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(timestamp));
    }

    function getPostId() {
        const params = new URLSearchParams(window.location.search);
        return params.get("id");
    }

    async function getPost(postId) {
        const posts = await fetch("/api/posts").then((res) => res.json());

        return posts.find(function (post) {
            return post.id === postId;
        });
    }

    function buildComment(comment) {
        return `
      <li class="comment-item">
        <strong>${comment.user?.username || "Unknown"}</strong>
        <span>${comment.content}</span>
      </li>
    `;
    }

    function buildPost(post) {
        const currentUser = getCurrentUser();
        const comments = Array.isArray(post.comments) ? post.comments : [];

        return `
    <article class="post-card">
      <header>
        <h3>${post.user?.username || "Unknown User"}</h3>
        <p>${formatDateTime(post.createdAt)}</p>
      </header>

      <p>${post.content}</p>

      ${post.image
                ? `<img src="${post.image}" alt="Post image" class="post-image">`
                : ""
            }

      <section>
        <p>${post.likes.length} like(s)</p>
        <p>${comments.length} comment(s)</p>

        <h4>Comments</h4>

        <ul>
          ${comments.length
                ? comments
                    .map(function (comment) {
                        const canDelete =
                            currentUser && comment.userId === currentUser.id;

                        return `
                      <li class="comment-item">
                        <strong>${comment.user?.username || "Unknown"}</strong>
                        <span>${comment.content}</span>

                        ${canDelete
                                ? `<button type="button" class="delete-comment-btn" data-comment-id="${comment.id}">
                                Delete
                              </button>`
                                : ""
                            }
                      </li>
                    `;
                    })
                    .join("")
                : "<li>No comments yet.</li>"
            }
        </ul>

        <form id="commentForm">
          <input id="commentInput" type="text" placeholder="Write a comment..." required />
          <button type="submit">Comment</button>
        </form>
      </section>
    </article>
  `;
    }

    async function loadPost() {

        const container =
            document.querySelector(".single-post");

        if (!container) {
            return;
        }

        const postId = getPostId();

        if (!postId) {
            container.innerHTML =
                "<h2>Post Details</h2><p>Post not found.</p>";
            return;
        }

        const post = await getPost(postId);

        if (!post) {
            container.innerHTML =
                "<h2>Post Details</h2><p>Post not found.</p>";
            return;
        }

        container.innerHTML =
            "<h2>Post Details</h2>" +
            buildPost(post);
        const commentForm = document.getElementById("commentForm");
        const commentInput = document.getElementById("commentInput");

        if (commentForm && commentInput) {
            commentForm.addEventListener("submit", async function (event) {
                event.preventDefault();

                const currentUser = getCurrentUser();
                const content = commentInput.value.trim();

                if (!currentUser) {
                    window.location.href = "login.html";
                    return;
                }

                if (content === "") {
                    return;
                }

                await fetch("/api/comments", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        content,
                        userId: currentUser.id,
                        postId: post.id,
                    }),
                });

                await loadPost();
            });
        }

        document.querySelectorAll(".delete-comment-btn").forEach(function (button) {
            button.addEventListener("click", async function () {
                const commentId = button.getAttribute("data-comment-id");

                await fetch("/api/comments", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        commentId,
                    }),
                });

                await loadPost();
            });
        });
    }
    function getCurrentUser() {
        const user = localStorage.getItem("currentUser");
        return user ? JSON.parse(user) : null;
    }

    const backBtn =
        document.getElementById("backBtn");

    if (backBtn) {

        backBtn.addEventListener(
            "click",

            function () {
                window.history.back();
            }

        );

    }

    window.loadPost = loadPost;

})();