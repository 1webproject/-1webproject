(function () {
  "use strict";

  function notify(message) {
    alert(message);
  }

  async function getUsers() {
    return fetch("/api/users").then((res) =>
      res.json()
    );
  }

  function getCurrentUser() {
    const user =
      localStorage.getItem(
        "currentUser"
      );

    return user
      ? JSON.parse(user)
      : null;
  }

  function setCurrentUser(user) {
    localStorage.setItem(
      "currentUser",
      JSON.stringify(user)
    );
  }

  document.addEventListener(
    "DOMContentLoaded",

    function () {

      const loginForm =
        document.getElementById(
          "login-form"
        );

      if (loginForm) {

        loginForm.addEventListener(
          "submit",

          async function (event) {

            event.preventDefault();

            const email =
              document
                .getElementById(
                  "email"
                )
                .value
                .trim()
                .toLowerCase();

            const password =
              document
                .getElementById(
                  "password"
                )
                .value
                .trim();

            const errorDiv =
              document.getElementById(
                "login-error"
              );

            const users =
              await getUsers();

            const user =
              users.find(function (u) {
                return (
                  u.email ===
                  email &&
                  u.password ===
                  password
                );
              });

            if (!user) {
              errorDiv.textContent =
                "Invalid email or password.";
              return;
            }

            setCurrentUser(
              user
            );

            window.location.href =
              "feed.html";
          }
        );
      }


      const registerForm =
        document.getElementById(
          "register-form"
        );

      if (registerForm) {

        registerForm.addEventListener(
          "submit",

          async function (event) {

            event.preventDefault();

            const username =
              document
                .getElementById(
                  "username"
                )
                .value
                .trim();

            const email =
              document
                .getElementById(
                  "email"
                )
                .value
                .trim()
                .toLowerCase();

            const password =
              document
                .getElementById(
                  "password"
                )
                .value
                .trim();

            const confirmPassword =
              document
                .getElementById(
                  "confirm-password"
                )
                .value
                .trim();

            const bio =
              document
                .getElementById(
                  "bio"
                )
                .value
                .trim();

            const errorDiv =
              document.getElementById(
                "register-error"
              );

            if (
              password !==
              confirmPassword
            ) {
              errorDiv.textContent =
                "Passwords do not match.";
              return;
            }

            await fetch(
              "/api/users",

              {
                method:
                  "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify(
                    {
                      username,
                      email,
                      password,
                      bio,
                    }
                  ),
              }
            );

            notify(
              "Registration successful."
            );

            window.location.href =
              "login.html";
          }
        );
      }


      const currentUser =
        getCurrentUser();

      const currentPage =
        window.location.pathname
          .split("/")
          .pop() ||
        "index.html";

      const isAuthPage =
        currentPage ===
        "login.html" ||
        currentPage ===
        "register.html";

      if (
        currentUser &&
        isAuthPage
      ) {
        window.location.href =
          "feed.html";
      }

      if (
        !currentUser &&
        !isAuthPage &&
        currentPage !==
        "index.html"
      ) {
        window.location.href =
          "login.html";
      }

    }
  );

})();