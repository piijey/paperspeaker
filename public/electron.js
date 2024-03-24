const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const DEBUG = false;

let logFilePath = null;
async function logToFileAsync(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\n`;
    try {
        if (!logFilePath){
            logFilePath = path.join(app.getPath('logs'), `app.${timestamp}.log`);
            console.log(`log file: ${logFilePath}`);
        }
        await fs.appendFile(logFilePath, logMessage);
    } catch (error) {
        console.error("Failed to log to file:", error);
    };
};

const appFolderPath = path.join(app.getPath('documents'), 'paperspeaker');
require('dotenv').config({ path: path.join(appFolderPath, '.env') });
const OpenAI = require('openai');
let openai = null;

async function prepareApi(){
    if (!process.env.OPENAI_API_KEY) {
        await logToFileAsync(`OPENAI_API_KEY is not set in ${path.join(appFolderPath, '.env')}.`);
        return
    };
    openai = new OpenAI();
    await logToFileAsync(`OPENAI_API_KEY is set in ${path.join(appFolderPath, '.env')}`)
};

async function createSpeechFile(inputText) {
    await logToFileAsync(`inputText: ${inputText}`);

    if ( DEBUG || inputText == "DEBUG" || !openai ) {
        try{
            const speechFile = path.resolve(appFolderPath + '/speech_files/speech.mp3');
            const buffer = await fs.readFile(speechFile);
            await logToFileAsync(`speech file: ${speechFile}`);
            return buffer
        } catch (error) {
            await logToFileAsync(`failed to open speechFile: ${appFolderPath + '/speech_files/speech.mp3'}`);
            throw error;
        };
    };

    const now = new Date().toISOString().replaceAll(':', '-');
    const speechFile = path.resolve(appFolderPath + `/speech_files/speech.${now}.mp3`);

    try {
        const mp3 = await openai.audio.speech.create({
            model: "tts-1-hd",
            voice: "alloy",
            input: inputText,
        });
        const buffer = Buffer.from(await mp3.arrayBuffer());
        await fs.writeFile(speechFile, buffer);
        await logToFileAsync(`speech file: ${speechFile}`);
        return buffer;
    } catch (error) {
        await logToFileAsync(`failed to create speechFile: ${appFolderPath + '/speech_files/speech.mp3'}`);
        throw error;
    };
};

ipcMain.handle('create-speech', async (event, inputText) => {
    const buffer = await createSpeechFile(inputText);
    return buffer; //これがレンダラープロセスに返る
});

let mainWindow;
async function createWindow() {
    await logToFileAsync('createWindow start.');
    let isDev = false;
    try {
        const isDevModule = await import('electron-is-dev'); //Dynamic import for ES module
        isDev = isDevModule.default;
        await logToFileAsync(`Set development mode: ${isDev}.`);
    } catch (error) {
        await logToFileAsync('Failed to import electron-is-dev, assuming production mode.');
        console.error(error);
    };

    const preload = isDev
        ? path.join(__dirname, 'preload.js')
        : path.join(process.resourcesPath, 'app.asar', 'build/preload.js');
    await logToFileAsync(`preload: ${preload}`);

    mainWindow = new BrowserWindow({
        width: 500,
        height: 500,
        webPreferences: {
            preload: preload,
            nodeIntegration: true,
            contextIsolation: true,
        },
    });
    await logToFileAsync("BrowserWindow has been instantiated.");

    if (isDev) {
        mainWindow.webContents.openDevTools(); // 開発者ツールを開く
    };

    // Reactアプリをロード
    const startUrl = isDev
        ? 'http://localhost:3000' // 開発中は開発サーバーのURL
        : `file://${path.join(__dirname, '../build/index.html')}`; // 本番用はビルド後のパス
    mainWindow.loadURL(startUrl)
        .catch(error => logToFileAsync(error) );

    await prepareApi();
    await logToFileAsync("app is ready.");
    mainWindow.on('closed', () => mainWindow = null);
};

app.on('ready', async () => {
    await logToFileAsync('on ready');
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
  
  app.on('activate', async () => {
    if (mainWindow === null) {
        await logToFileAsync('on activate');
        createWindow();
    }
  });
