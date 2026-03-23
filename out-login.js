DataManager.initSampleData();

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");
  
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const errorDiv = document.getElementById("login-error");

        if (!email || !password) {
          errorDiv.textContent = "Please fill in all fields.";
          return;
        }

        const users = DataManager.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            DataManager.setCurrentUser(user);
            window.location.href = "index.html";
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
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const confirmPassword = document.getElementById("confirm-password").value.trim();
      const profilePicture = document.getElementById("profile-picture").value.trim();
      const bio = document.getElementById("bio").value.trim();
      const errorDiv = document.getElementById("register-error");

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

        const result = DataManager.addUser({
            username, 
            email, 
            password, 
            profilePicture, 
            bio});

        if (result.success) {
            alert("Registration successful! You can now log in.");
            window.location.href = "login.html";
        } else {
            errorDiv.textContent = result.message;
        }
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const logoutButton = document.getElementById("logout-button");
  
  if (logoutButton) {
    logoutButton.addEventListener("click", function (event) {
      event.preventDefault();
      DataManager.logout();
      window.location.href = "login.html";
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const currentUser = DataManager.getCurrentUser();
  const isAuthpage = window.location.pathname.includes("login.html") 
    || window.location.pathname.includes("register.html");

  if (currentUser && !isAuthpage) {
    window.location.href = "login.html";
    return;
  }
  
  if (!currentUser && !isAuthpage) {
    window.location.href = "index.html";
  }


if (currentUser) {
  const welcomeSpan = document.getElementById("welcome-user");
  const navAvatar = document.getElementById("nav-avatar");
  const currentUserAvatar = document.getElementById("current-user-avatar");
  const commenterAvatar = document.getElementById("commenter-avatar");

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
