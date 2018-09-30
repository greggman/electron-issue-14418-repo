import path from 'path';
import electron from 'electron';  // eslint-disable-line

const isDevMode = process.env.NODE_ENV === 'development';
const isOSX = process.platform === 'darwin';

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const windowInfosById = {};
const windows = [];

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;

function makeCloseWindowHandler(window) {
  const id = window.id;

  return function handleCloseWindow() {
    const ndx = windows.indexOf(window);
    windows.splice(ndx, 1);
    delete windowInfosById[id];
    window.removeListener('closed', handleCloseWindow);
    if (windows.length === 0) {
      app.quit();
    }
  };
}

function createWindow() {
  const url = `file://${path.normalize(path.join(__dirname, '..', '..', '..', 'app', 'index.html'))}`;
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    defaultEncoding: 'utf8',
    show: true,
    webPreferences: {
      webSecurity: false,
    },
  });

  console.log('loading:', url);
  window.loadURL(url);
  if (isDevMode) {
    window.webContents.openDevTools();
  }

  window.on('closed', makeCloseWindowHandler(window));
  windows.unshift(window);
  windowInfosById[window.id] = {
    window: window,
  };

  return window;
}

function setupMenus() {
  const fileMenuTemplate = {
    label: 'File',
    submenu: [
      {
        label: 'New Window',
        accelerator: 'CmdOrCtrl-N',
        click() {
          createWindow();
        },
      },
      {
        label: 'Close Window',
        accelerator: isOSX ? 'Cmd-W' : 'Alt-F4',
        click(item, focusedWindow) {
          focusedWindow.close();
        },
      },
    ],
  };

  const menuTemplate = [
    fileMenuTemplate,
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.reload();
          }
        },
        {
          label: 'Toggle Full Screen',
          click(item, focusedWindow) {
            if (focusedWindow) {
              sendAction(focusedWindow.webContents, 'toggleFullscreen');
            }
          }
        },
        {
          label: 'Toggle Developer Tools',
          click(item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.toggleDevTools();
            }
          }
        },
      ]
    },
    {
      label: 'Window',
      role: 'window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        },
      ]
    },
  ];

  if (isOSX) {
    const name = electron.app.getName();
    menuTemplate.unshift({
      label: name,
      submenu: [
        {
          label: 'Services',
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          label: `Hide ${name}`,
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Alt+H',
          role: 'hideothers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click() { app.quit(); }
        },
      ]
    });
  }

  if (!isOSX) {
    fileMenuTemplate.submenu.push(
      {
        type: 'separator',
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() { app.quit(); }
      },
    );
  }

  const menu = electron.Menu.buildFromTemplate(menuTemplate);
  electron.Menu.setApplicationMenu(menu);
}

function start() {
  setupMenus();
  createWindow();
}

app.on('ready', () => {
  start();
});

app.on('window-all-closed', () => {
  app.quit();
});

