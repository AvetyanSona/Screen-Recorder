const {app, globalShortcut, ipcMain} = require('electron');
const menubar = require('menubar')
const path = require('path')
const isMac = process.platform === 'darwin';
const { fork } = require('child_process')
const ps = fork(`${__dirname}/server.js`)

let mainWindow;
let mainMenuBlockStyle = true;
// global.sharedObj = {value: mainMenuBlockStyle};
// console.log('mainjs',mainMenuBlockStyle);

// app.on('window-all-closed', () => {
//   if (process.platform != 'darwin')
//     app.quit();
// });

//app.setPath("userData", __dirname + "/saved_recordings");

// Quit when all windows are closed.

app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    //if (process.platform !== 'darwin') {
        app.quit();
    //}
})

app.on('will-quit', function () {
    // Unregister all shortcuts.
    globalShortcut.unregisterAll()
})
ipcMain.on( "setMyGlobalVariable", ( event, mainMenuBlockStyle ) => {
    global.mainMenuBlockStyle = mainMenuBlockStyle;
} );
app.on('ready', () => {
    const { net } = require('electron');
    let icon = '/assets/camera_48x48.png';
    if (isMac) {
        icon = '/assets/camera_16x16.png';
    }
    const mb = menubar({
        index: path.join('file://', __dirname, '/index.html'),
        icon: path.join(__dirname, '/assets/camera_48x48.png'),
        width: 290,
        height: 470,
        resizable: true,
        showDockIcon: false,
        preloadWindow: true,
        webPreferences: {
            nodeIntegration: true
        }
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
    // mainWindow = new BrowserWindow({width: 500, height: 800});

  // mainWindow.loadURL('file://' + __dirname + '/index.html');

  // mainWindow.on('closed', () => {
  //   mainWindow = null;
  // });
});

