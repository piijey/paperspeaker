const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    createSpeech: (text) => ipcRenderer.invoke('create-speech', text)
});

console.log('preload!');
