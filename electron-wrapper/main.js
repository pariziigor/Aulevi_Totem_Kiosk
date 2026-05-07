const { app, BrowserWindow, globalShortcut } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;
let pythonProcess;
let isQuitting = false; // Tipagem booleana estrita

function startPythonBackend() {
  // O caminho assume a estrutura gerada (venv no Windows)
  const pythonExecutable = path.join(__dirname, '../backend/venv/Scripts/python.exe');
  const backendDirectory = path.join(__dirname, '../backend');

  console.log("[Watchdog]: Iniciando motor de cálculo Python...");
  
  // Executa o Uvicorn diretamente via módulo Python
  pythonProcess = spawn(pythonExecutable, ['-m', 'uvicorn', 'main:app', '--port', '8000'], { 
    cwd: backendDirectory 
  });

  pythonProcess.stdout.on('data', (data) => console.log(`[FastAPI]: ${data}`));
  pythonProcess.stderr.on('data', (data) => console.error(`[FastAPI Error]: ${data}`));

  // Lógica principal do Watchdog
  pythonProcess.on('close', (code) => {
    console.log(`[Watchdog]: Processo Python encerrado com código ${code}`);
    
    // Validação lógica estrita: Só reinicia se o fechamento não foi comandado pelo sistema
    if (isQuitting === false) {
      console.warn("[Watchdog]: Falha detectada no backend. Iniciando protocolo de recuperação em 3 segundos...");
      setTimeout(startPythonBackend, 3000);
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true, // Kiosk mode mandatório
    kiosk: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false, // Prevenção contra injeções de script
      contextIsolation: true
    }
  });

  // Proteção contra encerramento via interface (Alt+F4 ou gestos)
  mainWindow.on('close', (e) => {
    if (isQuitting === false) {
      e.preventDefault();
    }
  });

  mainWindow.loadURL('http://localhost:5173');
}

app.whenReady().then(() => {
  startPythonBackend();
  createWindow();
  
  // Bloqueio em nível de hardware/SO para garantir operação exclusiva
  globalShortcut.register('CommandOrControl+R', () => { return false; });
  globalShortcut.register('CommandOrControl+Shift+R', () => { return false; });
  globalShortcut.register('CommandOrControl+Esc', () => { return false; });
  globalShortcut.register('Alt+Tab', () => { return false; });
});

// Encerramento controlado da árvore de processos
app.on('before-quit', () => {
  isQuitting = true;
  if (pythonProcess) {
    console.log("[Watchdog]: Desligando motor Python...");
    pythonProcess.kill();
  }
});