(() => {
  let extensions = [];
  let selfExtension = null;

  // layout classes
  const listClass = "extensions";
  const listItemClass = "extensions__item";
  const listItemActiveClass = "extensions__item--active";
  const listIconClass = "extensions__icon";
  const listNameClass = "extensions__name";

  async function init() {
    try {
      await Promise.all([loadExtensions(), loadSelfExtension()]);
      await filterExtensions();
      await sortByAlhabet();
      render();
    } catch (e) {
      showError(e);
    }
  }

  async function loadExtensions() {
    await new Promise((resolve, reject) => {
      chrome.management.getAll((result) => {
        if (result.length - 1 > 0) {
          extensions = result;
          resolve();
        } else {
          reject("You have no extensions yet");
        }
      });
    });
  }

  async function loadSelfExtension() {
    await new Promise((resolve) => {
      chrome.management.getSelf((response) => {
        selfExtension = response;
        resolve();
      });
    });
  }

  async function filterExtensions() {
    await new Promise((resolve) => {
      extensions = extensions.filter(
        (item) =>
          item.type === "extension" &&
          item.id !== selfExtension.id &&
          (item.mayEnable || item.mayDisable)
      );
      resolve();
    });
  }

  async function sortByAlhabet() {
    await new Promise((resolve) => {
      extensions = extensions.sort((a, b) => {
        const aName = a.shortName || a.name;
        const bName = b.shortName || b.name;
        switch (true) {
          case aName < bName:
            return -1;
          case aName > bName:
            return 1;
          default:
            return 0;
        }
      });
      resolve();
    });
  }

  function render() {
    const root = document.getElementById("root");
    root.onmousedown = () => false;
    root.addEventListener("click", toggleExtension);

    const extensionsList = buildExtensionsNodeList();
    root.appendChild(extensionsList);
  }

  function buildExtensionsNodeList() {
    const list = document.createElement("ul");
    list.className = listClass;

    extensions.forEach((item) => {
      let extension = document.createElement("li");

      extension.dataset.id = item.id;
      extension.className = listItemClass;

      const icon = document.createElement("img");
      icon.src = item.icons[0].url;
      icon.className = listIconClass;
      extension.appendChild(icon);

      const name = document.createElement("span");
      name.textContent = item.shortName || item.name;
      name.className = listNameClass;
      extension.appendChild(name);

      if (item.enabled) {
        extension.classList.add(listItemActiveClass);
      }

      list.appendChild(extension);
    });

    return list;
  }

  function toggleExtension({ target }) {
    const elem = target.closest(`.${listItemClass}`);
    if (!elem) return;

    const id = elem.dataset.id;
    const isActive = elem.classList.contains(listItemActiveClass);

    chrome.management.setEnabled(id, !isActive);

    elem.classList.toggle(listItemActiveClass);
  }

  function showError(error) {
    const message = typeof error === "object" ? error.message : error;

    showNote(message, "error");
    console.error(error);
  }

  function showNote(message, type) {
    const classes = {
      error: "note--error",
    };
    const note = document.createElement("div");
    note.className = `note ${classes[type] || ""}`.trim();
    note.innerText = message;

    const root = document.getElementById("root");
    root.appendChild(note);
  }

  document.addEventListener("DOMContentLoaded", init());
})();
