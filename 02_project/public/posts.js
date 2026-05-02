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

        const comments = Array.isArray(post.comments)
            ? post.comments
            : [];

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
                ? comments.map(buildComment).join("")
                : "<li>No comments yet.</li>"
            }
          </ul>
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
    }

    window.loadPost = loadPost;

})();