(function uiModule() {
  "use strict";

  function ensureToastRoot() {
    var root = document.getElementById("toastRoot");
    if (root) {
      return root;
    }
    root = document.createElement("div");
    root.id = "toastRoot";
    root.className = "toast-root";
    document.body.appendChild(root);
    return root;
  }

  function notify(message, type) {
    var root = ensureToastRoot();
    var toast = document.createElement("div");
    toast.className = "toast " + (type || "info");
    toast.textContent = message;
    root.appendChild(toast);

    setTimeout(function () {
      toast.classList.add("show");
    }, 10);

    setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () {
        toast.remove();
      }, 200);
    }, 2800);
  }

  function openProfileEditor(user, onSave) {
    var overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    var modal = document.createElement("div");
    modal.className = "modal-card";

    modal.innerHTML = [
      '<h3>Edit Profile</h3>',
      '<label for="modalBioInput">Bio</label>',
      '<textarea id="modalBioInput" rows="4" maxlength="220" placeholder="Write a short bio..."></textarea>',
      '<label for="modalAvatarInput">Profile Picture</label>',
      '<input id="modalAvatarInput" type="file" accept="image/*" />',
      '<p class="muted modal-help">Leave image empty if you only want to update bio.</p>',
      '<div class="modal-actions">',
      '  <button type="button" class="btn btn-secondary" id="modalCancelBtn">Cancel</button>',
      '  <button type="button" class="btn btn-primary" id="modalSaveBtn">Save</button>',
      '</div>'
    ].join("");

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    var bioInput = modal.querySelector("#modalBioInput");
    var avatarInput = modal.querySelector("#modalAvatarInput");
    var cancelBtn = modal.querySelector("#modalCancelBtn");
    var saveBtn = modal.querySelector("#modalSaveBtn");

    bioInput.value = user.bio || "";

    function close() {
      overlay.remove();
    }

    cancelBtn.addEventListener("click", close);
    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        close();
      }
    });

    saveBtn.addEventListener("click", function () {
      var payload = { bio: bioInput.value.trim() };
      var file = avatarInput.files && avatarInput.files[0];

      if (!file) {
        onSave(payload);
        close();
        return;
      }

      var reader = new FileReader();
      reader.onload = function (event) {
        payload.profilePicture = event.target.result;
        onSave(payload);
        close();
      };
      reader.onerror = function () {
        notify("Could not read selected image.", "error");
      };
      reader.readAsDataURL(file);
    });
  }

  window.AppUI = {
    notify: notify,
    openProfileEditor: openProfileEditor
  };
})();
