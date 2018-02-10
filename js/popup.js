
; (function () {

  function getExtensions() {
    chrome.management.getAll(renderExtensions);
  }

  function renderExtensions(extensions) {
    extensions = getFilteredExtensions(extensions) || [];

    if (!extensions.length) {
      showNote('You have no extensions yet');
      return;
    }

    const app = document.getElementById('ext-app');

    app.addEventListener('click', toggleExtension);
    app.onmousedown = () => false;

    app.appendChild(getExtensionsNodeList(extensions));
  }

  function getFilteredExtensions(extensions) {
    return extensions.filter((item) => item.type === 'extension');
  }

  function getExtensionsNodeList(extensions) {
    let list = document.createElement('ul');
    list.className = 'ext-list';

    extensions.forEach((item) => {
      let listItem = document.createElement('li');

      listItem.textContent = item.name;
      listItem.dataset.id = item.id;
      listItem.className = 'ext-list__item';

      let icon = document.createElement('img');
      icon.src = item.icons[0].url;
      icon.className = 'ext-list__icon';

      listItem.insertAdjacentElement('afterBegin', icon);

      if (item.enabled) {
        listItem.classList.add('ext-list__item--active');
      }

      list.appendChild(listItem);
    });

    return list;
  }

  function toggleExtension(event) {
    const item = event.target;

    if (!item.closest('.ext-list__item')) return;

    const id = item.dataset.id;
    const isActive = item.classList.contains('ext-list__item--active');

    chrome.management.setEnabled(id, !isActive);

    item.classList.toggle('ext-list__item--active');
  }

  function showNote(text) {
    let note = document.createElement('div');
    note.className = 'ext-note';
    note.innerHTML = text;

    document.getElementById('ext-app').appendChild(note);
  }

  document.addEventListener('DOMContentLoaded', getExtensions);

})();
