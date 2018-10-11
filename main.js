const {app, globalShortcut} = require('electron');
const menubar = require('menubar')
const path = require('path')

let mainWindow;

app.on('window-all-closed', () => {
  if (process.platform != 'darwin')
    app.quit();
});

app.setPath("userData", __dirname + "/saved_recordings");

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('will-quit', function () {
    // Unregister all shortcuts.
    globalShortcut.unregisterAll()
})

app.on('ready', () => {
    const mb = menubar({
        index: path.join('file://', __dirname, '/index.html'),
        icon: path.join(__dirname, '/assets/camera_48x48.png'),
        width: 280,
        height: 300,
        resizable: false,
        showDockIcon: false,
        preloadWindow: true
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

    mb.showWindow()


    // mainWindow = new BrowserWindow({width: 500, height: 800});

  // mainWindow.loadURL('file://' + __dirname + '/index.html');

  // mainWindow.on('closed', () => {
  //   mainWindow = null;
  // });
});
