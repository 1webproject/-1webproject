DataManager.initSampleData();
function notify(message, type) {
  if (window.AppUI && typeof window.AppUI.notify === "function") {
    window.AppUI.notify(message, type || "error");
    return;
  }
  window.alert(message);
}

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const email = document.getElementById("email").value.trim().toLowerCase();
      const password = document.getElementById("password").value.trim();
      const errorDiv = document.getElementById("login-error");
      errorDiv.textContent = "";

      if (!email || !password) {
        errorDiv.textContent = "Please fill in all fields.";
        return;
      }

      const user = DataManager.getUserByEmail(email);

      if (user && user.password === password) {
        DataManager.setCurrentUser(user);
        window.location.href = "feed.html";
      } else {
        errorDiv.textContent = "Invalid email or password.";
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("register-form");

  if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim().toLowerCase();
      const password = document.getElementById("password").value.trim();
      const confirmPassword = document.getElementById("confirm-password").value.trim();
      const profilePictureInput = document.getElementById("profile-picture");
      const bio = document.getElementById("bio").value.trim();
      const errorDiv = document.getElementById("register-error");
      errorDiv.textContent = "";

      if (!username || !email || !password || !confirmPassword) {
        errorDiv.textContent = "Please fill in all required fields.";
        return;
      }

      if (password.length < 6) {
        errorDiv.textContent = "Password must be at least 6 characters long.";
        return;
      }

      if (password !== confirmPassword) {
        errorDiv.textContent = "Passwords do not match.";
        return;
      }

      if (!email.includes("@") || !email.includes(".")) {
        errorDiv.textContent = "Please enter a valid email address.";
        return;
      }

      function submitRegistration(profilePicture) {
        const result = DataManager.addUser({
          username,
          email,
          password,
          profilePicture: profilePicture || "",
          bio
        });

        if (result.success) {
          notify("Registration successful. Please log in.", "success");
          window.location.href = "login.html";
        } else {
          errorDiv.textContent = result.message;
        }
      }

      const file = profilePictureInput && profilePictureInput.files ? profilePictureInput.files[0] : null;

      if (!file) {
        submitRegistration("");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (loadEvent) {
        submitRegistration(loadEvent.target.result);
      };
      reader.onerror = function () {
        errorDiv.textContent = "Could not read selected image.";
      };
      reader.readAsDataURL(file);
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const currentUser = DataManager.getCurrentUser();
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const isAuthPage = currentPage === "login.html" || currentPage === "register.html";

  if (currentUser && isAuthPage) {
    window.location.href = "feed.html";
    return;
  }

  if (!currentUser && !isAuthPage && currentPage !== "index.html") {
    window.location.href = "login.html";
    return;
  }

  const welcomeSpan = document.getElementById("welcome-user");
  const navAvatar = document.getElementById("nav-avatar");
  const currentUserAvatar = document.getElementById("current-user-avatar");
  const commenterAvatar = document.getElementById("commenter-avatar");

  if (currentUser) {
    if (welcomeSpan) {
      welcomeSpan.textContent = `Welcome, ${currentUser.username}`;
    }

    if (navAvatar) {
      navAvatar.src = currentUser.profilePicture || "default-avatar.png";
    }

    if (currentUserAvatar) {
      currentUserAvatar.src = currentUser.profilePicture || "default-avatar.png";
    }

    if (commenterAvatar) {
      commenterAvatar.src = currentUser.profilePicture || "default-avatar.png";
    }
  }
});
