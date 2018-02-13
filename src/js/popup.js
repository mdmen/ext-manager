
; (function () {

  let extensions = [];
  let selfExtension = {};

  function init() {
    Promise.all([getExtensions(), getSelf()])
      .catch(showNote)
      .then(filterExtensions)
      .then(renderExtensions)
      .catch(() => {
        showNote('Sorry, an error occurred');
      });
  }

  function getExtensions() {
    return new Promise((resolve, reject) => {
      chrome.management.getAll(result => {
        if (result.length - 1 > 0) {
          extensions = result;
          resolve();
        } else {
          reject('You have no extensions yet');
        }
      });
    });
  }

  function getSelf() {
    return new Promise(resolve => {
      chrome.management.getSelf(response => {
        selfExtension = response;
        resolve();
      });
    });
  }

  function filterExtensions() {
    extensions = extensions.filter(item => {
      return item.type === 'extension' && item.id !== selfExtension.id
    });
  }

  function renderExtensions() {
    const app = document.getElementById('ext-app');

    app.addEventListener('click', toggleExtension);
    app.onmousedown = () => false;

    app.appendChild(getExtensionsNodeList(extensions));
  }

  function getExtensionsNodeList(extensions) {
    let list = document.createElement('ul');
    list.className = 'ext-list';

    extensions.forEach((item) => {
      let listItem = document.createElement('li');

      listItem.textContent = item.shortName || item.name;
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

  document.addEventListener('DOMContentLoaded', init);

})();
