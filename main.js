const electron = require('electron');
const { app, BrowserWindow, globalShortcut } = electron;

const fs = require('fs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

// Globalne promenljive za putanju do media direktorijuma
const putanja = `${app.getAppPath()}\\media`;
// array za pojedinacne medije
let mediji = [];
let vremePrikazaSlike = 5000;
let periodZaProveru = 30000;

function createWindow() {
  // Create a browser window that fills the whole screen.
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  if (process.platform !== 'darwin') {
    win = new BrowserWindow({
      width,
      height,
      resizable: false,
      fullscreen: true,
      frame: false,
      backgroundColor: '#000',
      title: 'bivap',
      //icon: '',
      alwaysOnTop: true,
      movable: false
    });
    checkForFolderChanges();
    sendImagesToRenderer();
  };

  // and load the index.html of the app.
  win.loadFile('index.html');

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
};

function checkForFolderChanges(){
  fs.stat(putanja, (err) => {
    if (!err) {
      console.log(`${new Date()} - ${putanja} proverena za nove sadrzaje`);
      fs.readdir(putanja, (err, items) => {
        mediji = [];
        if (!err) {
          for (var i=0; i<items.length; i++) {
            mediji.push(`${putanja}\\${items[i]}`);
            console.log("main.js - " + mediji);
          }
        } else {
          console.log(`${new Date()} - ${putanja} nije spremna za citanje`);
        }
      });
    }
    else if (err.code = 'ENOENT') {
      console.log(`${new Date()} - doslo je do greske sa ${putanja}`);
    }
  })
  setTimeout(checkForFolderChanges, periodZaProveru);
}

function sendImagesToRenderer(){
  win.webContents.send('send-slike', `${mediji}`);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  // Osiguraj da program moze da bude aktivan samo u jednom prozoru
  app.requestSingleInstanceLock()

  // Register a 'CommandOrControl+q' shortcut listener.
  globalShortcut.register('CommandOrControl+q', () => {
    // Quit the app
    app.quit();
  });

  globalShortcut.register('CommandOrControl+Shift+o', () => {
    // Show options.
    showOptions;
  });
});

app.on('second-instance', function (event, argv, cwd) {
  // Posto je prethodno pri kreiranju sa app.requestSingleInstanceLock()
  // definisano da samo jedna aktivna kopija programa moze da bude pokrenuta
  // ovde moze da se definise ponasanje u slucaju da se pokrene ponovo.
  console.log('Dozvoljena je samo jedna instanca u on ready eventu prilikom kreiranja!');
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  };
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  };
});
