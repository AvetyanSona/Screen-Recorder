const {app, globalShortcut, ipcMain,Menu,Tray} = require('electron');
const menubar = require('menubar');
const path = require('path');
const { fork } = require('child_process');
const screen = require('electron').screen;

let mainMenuBlockStyle = true;
// const iconPath = path.join(__dirname,  'assets','camera_16x16.png');
const ps = fork(`${__dirname}/server.js`);
const isMac = (process.platform === 'darwin');
const isWin = (process.platform === 'win32');
const isLinux = (process.platform === 'linux');

// Quit when all windows are closed.

app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (!isMac) {
        app.quit();
    }
});

app.on('will-quit', function () {
    // Unregister all shortcuts.
    globalShortcut.unregisterAll()
    // Unregister keyshortcuts.
    globalShortcut.unregister('CommandOrControl+X');
});

ipcMain.on( "setMyGlobalVariable", ( event, mainMenuBlockStyle ) => {
    global.mainMenuBlockStyle = mainMenuBlockStyle;
});

app.on('ready', () => {
    let icon = path.join(__dirname,  'assets','camera_48x48.png');
    if (isMac) {
        icon = path.join(__dirname,  'assets','camera_16x16.png');
    }
    const { net } = require('electron');
    const tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open', click:  function(){
                mb.window.show();
            } },
        { label: 'Quit', click: () => { app.quit(); } }
    ]);
    tray.setContextMenu(contextMenu);
    let displays = screen.getAllDisplays();
    let width;
    let height;
    for(var i in displays)
    {
        width = displays[i].bounds.width;
        height = displays[i].bounds.height;
    }
    const mb = menubar({
        index: path.join('file://', __dirname, '/index.html'),
        icon: icon,
        width: 300,
        height: 470,
        x:width-300,
        y: isLinux ? 0 : height-470,
        tray:tray,
        movable:true,
        resizable: true,
        showDockIcon: false,
        preloadWindow: true,
        webPreferences: {
            nodeIntegration: true
        },
        alwaysOnTop:true,
        skipTaskbar:true,
    });

    // Register a shortcut listener.
    const ret = globalShortcut.register('CommandOrControl+Shift+W', function () {
        if (mb.window.isVisible()) {
            mb.window.hide()
        } else {
            mb.window.show()
        }
    })
    if (!ret) {
        console.log('registration failed')
    }
    mb.showWindow();
    mb.window.openDevTools();
});

