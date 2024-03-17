// electron-starter.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const OpenAI = require('openai');
const openai = new OpenAI();

async function createSpeechFile(inputText) {
    const now = new Date().toISOString().replaceAll(':', '-');
    const speechFileName = `/speech_files/speech.${now}.mp3`;
    let speechFile = path.resolve(__dirname+'/public/'+speechFileName);
    console.log('createSpeechFile', speechFile); //このログはターミナルに出力される
    //speechFile = path.resolve(__dirname+`/speech_files/speech.mp3`); //for debug

    try {
        const mp3 = await openai.audio.speech.create({
            model: "tts-1-hd",
            voice: "alloy",
            input: inputText,
        });
        const buffer = Buffer.from(await mp3.arrayBuffer());
        await fs.promises.writeFile(speechFile, buffer);
        return speechFileName;
    } catch (error) {
        console.error('failed to create speechFile:', error);
        throw error;
    }
}

ipcMain.handle('create-speech', async (event, inputText) => {
    const filePath = await createSpeechFile(inputText);
    return filePath; //これがレンダラープロセスに返る
});


async function createWindow() {
    const isDev = await import('electron-is-dev'); //Dynamic import for ES module
    // ブラウザウィンドウを作成
    const win = new BrowserWindow({
        width: 500,
        height: 500,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: true,
        },
    });

    // Reactアプリをロード
    const startUrl = isDev
        ? 'http://localhost:3000' // 開発中は開発サーバーのURL
        : `file://${path.join(__dirname, '../build/index.html')}`; // 本番用はビルド後のパス
    win.loadURL(startUrl);

    // 開発者ツールを開く
    win.webContents.openDevTools();
}

app.whenReady().then(createWindow);
