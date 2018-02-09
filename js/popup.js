
; (function () {

  let app = null;
  let extIds = [];

  function init() {
    getExtensions();

    app = document.getElementById('ext-app');
    
    app.addEventListener('click', toggleExtension);
    app.onmousedown = () => false;
  }

  function getExtensions() {
    chrome.management.getAll(render);
  }

  function render(extensions) {
    extensions = extensions || [];
    extensions = extensions.filter((item) => !item.isApp);

    if (!extensions.length) return;

    app.appendChild(buildList(extensions));
  }

  function buildList(extensions) {
    let list = document.createElement('ul');
    list.className = 'ext-list';

    extensions.forEach((item) => {
      let listItem = document.createElement('li');

      listItem.textContent = item.name;
      listItem.dataset.id = item.id;
      listItem.className = 'ext-list__item';

      list.appendChild(listItem);
    });

    return list;
  }

  function toggleExtension(event) {
    const item = event.target;

    if (!item.closest('.ext-list__item')) return;

    item.classList.toggle('ext-list__item--active');
  }

  document.addEventListener('DOMContentLoaded', init);

})();
