document.addEventListener("DOMContentLoaded", function () {
  function getCurrentUser() {
    const savedUser = localStorage.getItem("currentUser");
    return savedUser ? JSON.parse(savedUser) : null;
  }

  function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  }

  function setupLogout() {
    const logoutElements = document.querySelectorAll("#logoutBtn, [data-logout]");

    logoutElements.forEach(function (element) {
      element.addEventListener("click", function (event) {
        event.preventDefault();
        logout();
      });
    });
  }

  function populateUserUI(currentUser) {
    if (!currentUser) {
      return;
    }

    const navUserName = document.getElementById("navUserName");
    const currentUserTargets = document.querySelectorAll("[data-current-user]");
    const avatarTargets = document.querySelectorAll("[data-current-avatar]");

    if (navUserName) {
      navUserName.textContent = currentUser.username;
    }

    currentUserTargets.forEach(function (target) {
      target.textContent = currentUser.username;
    });

    avatarTargets.forEach(function (target) {
      target.src = currentUser.avatar || "https://via.placeholder.com/50";
      target.alt = currentUser.username + " avatar";
    });
  }

  const currentUser = getCurrentUser();
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const publicPages = ["index.html", "login.html", "register.html"];

  setupLogout();
  populateUserUI(currentUser);

  if (!currentUser && publicPages.indexOf(currentPage) === -1) {
    window.location.href = "login.html";
    return;
  }

  if (currentPage === "feed.html" && typeof loadFeed === "function") {
    loadFeed();
  } else if (currentPage === "post.html" && typeof loadPost === "function") {
    loadPost();
  } else if (currentPage === "profile.html" && typeof loadProfile === "function") {
    loadProfile();
  }
});