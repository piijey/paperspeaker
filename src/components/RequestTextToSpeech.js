import { useState, useEffect } from 'react';

export const useRequestTextToSpeech = (text, ipcRenderer, setSysMessage) => {
    const [speechFilePath, setSpeechFilePath] = useState('');

    useEffect(() => {
        if ( text.length > 0 ) {
            ipcRenderer.invoke('create-speech', text).then((filepath) => {
                setSpeechFilePath(process.env.PUBLIC_URL + filepath)
                setSysMessage(`Speech File: ${filepath}`);
                });
            }
    }, [text]);

    return { speechFilePath };
};
