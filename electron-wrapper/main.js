// electron-wrapper/main.js
const { app, BrowserWindow, globalShortcut } = require('electron');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true, // Kiosk mode base
    kiosk: true,      // Bloqueia a saída do app
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false, // Segurança aprimorada
      contextIsolation: true
    }
  });

  // Bloqueio de fechamento acidental
  mainWindow.on('close', (e) => {
    e.preventDefault();
  });

  mainWindow.loadURL('http://localhost:5173'); // Apontamento para o Vite em dev
}

app.whenReady().then(() => {
  createWindow();
  
  // Bloqueio rigoroso de atalhos
  globalShortcut.register('CommandOrControl+R', () => { return false; });
  globalShortcut.register('CommandOrControl+Shift+R', () => { return false; });
  globalShortcut.register('CommandOrControl+Esc', () => { return false; });
  globalShortcut.register('Alt+Tab', () => { return false; });
});