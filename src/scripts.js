(() => {
  // global state
  const state = {
    extensions: [],
    selfExtension: null
  };

  // layout classes
  const classes = {
    list: 'extensions',
    listItem: 'extensions__item',
    listItemActive: 'extensions__item--active',
    listItemIcon: 'extensions__icon',
    listItemName: 'extensions__name',
  };

  async function init() {
    try {
      await Promise.all([loadExtensions(), loadSelfExtension()]);
      prepareExtensions();
      render();
    } catch (e) {
      showError(e);
    }
  }

  async function loadExtensions() {
    await new Promise((resolve, reject) => {
      chrome.management.getAll((response) => {
        if (response.length - 1 > 0) {
          state.extensions = response;
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
        state.selfExtension = response;
        resolve();
      });
    });
  }

  function prepareExtensions() {
    const filtered = filterExtensions(state);
    const sortedByApphabet = sortExtensionsByAlhabet(filtered);
    state.extensions = sortedByApphabet;
  }

  function filterExtensions(globalState) {
    return globalState.extensions.filter(
      (item) =>
        item.type === "extension" &&
        item.id !== globalState.selfExtension.id &&
        (item.mayEnable || item.mayDisable)
    );
  }

  function sortExtensionsByAlhabet(list) {
    return [...list].sort((a, b) => {
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
  }

  function render() {
    const root = document.getElementById("root");
    root.onmousedown = () => false;
    root.addEventListener("click", toggleExtension);

    const extensionsList = buildExtensionsList(state);
    root.appendChild(extensionsList);
  }

  function buildExtensionsList(globalState) {
    const list = document.createElement("ul");
    list.className = classes.list;

    globalState.extensions.forEach((item) => {
      let extension = document.createElement("li");

      extension.dataset.id = item.id;
      extension.className = classes.listItem;

      const icon = document.createElement("img");
      icon.src = item.icons[0].url;
      icon.className = classes.listItemIcon;
      extension.appendChild(icon);

      const name = document.createElement("span");
      name.textContent = item.shortName || item.name;
      name.className = classes.listItemName;
      extension.appendChild(name);

      if (item.enabled) {
        extension.classList.add(classes.listItemActive);
      }

      list.appendChild(extension);
    });

    return list;
  }

  function toggleExtension({ target }) {
    const elem = target.closest(`.${classes.listItem}`);
    if (!elem) return;

    const id = elem.dataset.id;
    const isActive = elem.classList.contains(classes.listItemActive);

    chrome.management.setEnabled(id, !isActive);

    elem.classList.toggle(classes.listItemActive);
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

  document.addEventListener("DOMContentLoaded", init);
})();
