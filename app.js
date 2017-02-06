const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const ipcMain = require('electron').ipcMain;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let locationWindow;
let opacity;

let ignoreMouseEvents = false;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
  });

  locationWindow = new BrowserWindow({
    width: 400,
    height: 100,
    parent: mainWindow,
    show: false,
    resizable: false,
    modal: true,
    alwayOnTop: true,
  });

  locationWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'window.html'),
    protocol: 'file:',
    slashes: true
  }));

  locationWindow.on('closed', () => {
      locationWindow = null;
  });

  ipcMain.on('toggleLocationWindow', function () {
    if (locationWindow.isVisible())
      locationWindow.hide()
    else
      locationWindow.show()
  });

  ipcMain.on('loadUrl', function (event, arg) {
    mainWindow.loadURL(arg);

  });

  // and load the index.html of the app.
  mainWindow.loadURL("https://channel9.msdn.com"

    // url.format({
    // pathname: path.join(__dirname, 'index.html'),
    // protocol: 'file:',
    // slashes: true
  //})
  );

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  mainWindow.webContents.on('did-finish-load', function() {

    if(mainWindow.webContents.canGoBack()) {
      menu.items[1].submenu.items[4].enabled = true;
    } else {
      menu.items[1].submenu.items[4].enabled = false;
    }

    if(mainWindow.webContents.canGoForward()) {
      menu.items[1].submenu.items[5].enabled = true;
    } else {
      menu.items[1].submenu.items[5].enabled = false;
    }

    if(opacity < 1) {
      setOpacity(opacity);
    }

    mainWindow.webContents.insertCSS('html,body { -webkit-app-region: drag !important }');
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    locationWindow = null;
    mainWindow = null;
  });

  const {app, Menu} = require('electron');
  const template = [
    {
      label: 'Location',
      submenu: [
        {
          label: 'Go to URL',
          accelerator: 'CmdOrCtrl+L',
          click () { locationWindow.show() }
        },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click () { mainWindow.webContents.reload() }
        },
        {
          label: 'Clear',
          click () {  }
        },
        {
          type: 'separator'
        },
        {
          label: 'Back',
          accelerator: 'CmdOrCtrl+[',
          enabled: false,
          click () { goBack(); }
        },
        {
          label: 'Forward',
          accelerator: 'CmdOrCtrl+]',
          enabled: false,
          click () { goForward(); }
        }
      ]
    },
    {
      label: 'Appearance',
      submenu: [
        {
          label: 'Opacity',
          submenu: [
            {
              label: '100%',
              click () { setOpacity(1) }
            },
            {
              label: '75%',
              click () { setOpacity(0.75) }
            },
            {
              label: '50%',
              click () { setOpacity(0.5) }
            },
            {
              label: '10%',
              click () { setOpacity(0.1) }
            }
          ]
        },
        {
          label: 'Zoom',
          submenu: [
            {
              label: 'Zoom In',
              accelerator: 'CmdOrCtrl+Plus',
              click () { zoomIn() }
            },
            {
              label: 'Zoom Out',
              accelerator: 'CmdOrCtrl+-',
              click () { zoomOut() }
            },
            {
              label: 'Reset',
              click () { zoomReset() }
            }
          ]
        },
        {
          label: 'Enable click through',
          type: "checkbox",
          checked: false,
          click() { setIgnoreMouseEvents(); }
        },
        {
          label: 'Float above all spaces',
          type: "checkbox",
          checked: false,
          click() { setVisibleOnAllWorkspaces(); }
        }
      ]
    }
  ]

  function setOpacity(value) {
    opacity = value;
    if(opacity < 1) {
      mainWindow.webContents.insertCSS('html,body { background-color: transparent !important; opacity: '+opacity+' !important; -webkit-app-region: drag !important;}')
    } else {
      mainWindow.webContents.reload();
    }
  }

  function zoomIn() {
    let currentLevel = electron.webFrame.getZoomLevel();
    if (currentLevel >= .9) { return; }
    electron.webFrame.setZoomLevel(currentLevel+.1);
  }

  function zoomOut() {
    let currentLevel = electron.webFrame.getZoomLevel();
    if (currentLevel <= .1) { return; }
    electron.webFrame.setZoomLevel(currentLevel-.1);
  }

  function zoomReset() {
    electron.webFrame.setZoomLevel(0);
  }

  function goBack() {
    if(mainWindow.webContents.canGoBack())
      mainWindow.webContents.goBack();
  }

  function goForward() {
    if(mainWindow.webContents.canGoForward())
      mainWindow.webContents.goForward();
  }

  function setVisibleOnAllWorkspaces() {
      let isVisibleOnAllWorkspaces = mainWindow.isVisibleOnAllWorkspaces();
      if(!isVisibleOnAllWorkspaces) {
         mainWindow.setVisibleOnAllWorkspaces(true);
      } else {
        mainWindow.setVisibleOnAllWorkspaces(false);
      }
  }

  function setIgnoreMouseEvents() {
      if(!ignoreMouseEvents) {
         mainWindow.setIgnoreMouseEvents(true);
         ignoreMouseEvents = true;
      } else {
        mainWindow.setIgnoreMouseEvents(false);
        ignoreMouseEvents = false;
      }
  }

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          type: 'separator'
        },
        {
          role: 'hide'
        },
        {
          role: 'hideothers'
        },
        {
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          role: 'quit'
        }
      ]
    })
    template[1].submenu.push();
    template[2].submenu.push();
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.on('app-command', (e, cmd) => {
  // Navigate the window back when the user hits their mouse back button
  if (cmd === 'browser-backward' && mainWindow.webContents.canGoBack()) {
    mainWindow.webContents.goBack()
  }
  if (cmd === 'browser-forward' && mainWindow.webContents.canGoForward()) {
    mainWindow.webContents.goForward()
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
});

