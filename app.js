
document.addEventListener("DOMContentLoaded", function () {
    function getCurrentUser() {
        if (typeof DataManager !== "undefined" && typeof DataManager.getCurrentUser === "function") {
            return DataManager.getCurrentUser();
        }

        const savedUser = localStorage.getItem("currentUser_user");
        return savedUser ? JSON.parse(savedUser) : null;
    }

    const currentUser = getCurrentUser();
    const currentPage = window.location.pathname.split("/").pop();

    const publicPages = ["index.html", "login.html", "register.html", ""];

    if (!currentUser && publicPages.indexOf(currentPage) === -1) {
        window.location.href = "login.html";
        return;
    }

    if (currentPage === "feed.html") {
        if (typeof loadFeed === "function") {
            loadFeed();
        }
    } else if (currentPage === "post.html") {
        if (typeof loadPost === "function") {
            loadPost();
        }
    } else if (currentPage === "profile.html") {
        if (typeof loadProfile === "function") {
            loadProfile();
        }
    }
});