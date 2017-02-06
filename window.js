window.onresize = doLayout;

onload = function() {
  doLayout();

  const ipcRenderer = require('electron').ipcRenderer;
  var cancelButton = document.getElementById('cancelButton');
  cancelButton.addEventListener('click', function () {
    ipcRenderer.send('toggleLocationWindow')
  });

  var loadButton = document.getElementById('loadButton');
  loadButton.addEventListener('click', function () {
    var url = document.querySelector('#location').value;
    ipcRenderer.send('loadUrl', url)
    ipcRenderer.send('toggleLocationWindow')
  });
}

function doLayout() {
  var controls = document.querySelector('#controls');
  var controlsHeight = controls.offsetHeight;
}