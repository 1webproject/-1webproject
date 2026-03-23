function getPosts() {
    return JSON.parse(localStorage.getItem("posts")) || [];
}

function savePosts(posts) {
    localStorage.setItem("posts", JSON.stringify(posts));
}

function likePost(postId) {
    const user = getCurrentUser();
    if (!user) return;

    let posts = getPosts();

    posts = posts.map(post => {
        if (post.id === postId) {
            post.likes = post.likes || [];

            const index = post.likes.indexOf(user.id);

            if (index === -1) {
                post.likes.push(user.id);
            } else {
                post.likes.splice(index, 1);
            }
        }
        return post;
    });

    savePosts(posts);
    renderPosts();
}

function addComment(postId, text) {
    const user = getCurrentUser();
    if (!user || !text.trim()) return;

    let posts = getPosts();

    posts = posts.map(post => {
        if (post.id === postId) {
            post.comments = post.comments || [];

            post.comments.push({
                id: generateId(),
                userId: user.id,
                text: text,
                createdAt: Date.now()
            });
        }
        return post;
    });

    savePosts(posts);
    renderPosts();
}

function followUser(targetUserId) {
    const user = getCurrentUser();
    if (!user) return;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    users = users.map(u => {
        if (u.id === user.id) {
            u.following = u.following || [];

            const index = u.following.indexOf(targetUserId);

            if (index === -1) {
                u.following.push(targetUserId);
            } else {
                u.following.splice(index, 1);
            }
        }
        return u;
    });

    localStorage.setItem("users", JSON.stringify(users));

    const updatedUser = users.find(u => u.id === user.id);
    setCurrentUser(updatedUser);

    location.reload();
}