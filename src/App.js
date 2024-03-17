import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [submittedValue, setSubmittedValue] = useState('');
  const [sysMessage, setSysMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedValue(inputValue);
  };


  const [speechFilePath, setSpeechFilePath] = useState('');

  useEffect(() => {
    setInputValue('');
    if ( submittedValue.length > 0 ) {
      if (window.electron && window.electron.createSpeech) {
        window.electron.createSpeech(submittedValue).then((filePath) => {
          setSpeechFilePath(process.env.PUBLIC_URL + filePath)
          setSysMessage(`Speech File: ${filePath}`);
        });
      } else {
        setSysMessage('text-to-speech を利用するには Electron で実行してね');
      }
    } //submittedValue.length
  }, [submittedValue]);

  const audioRef = useRef(null);

  useEffect(() => {
    if ( !speechFilePath ){ return }
    const audioElement = audioRef.current;
    audioElement.src = speechFilePath;
    audioElement.play()
      .catch(err => setSysMessage(`failed to play audio: ${speechFilePath}, ${err}`))
  }, [speechFilePath]);


  return (
    <div className="App">
      <header className="App-header">
        <h1>
          PaperSpeaker
        </h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit">Submit</button>
        </form>
        <div>
          <audio id="audioPlayer" className="audio-player" ref={audioRef} controls></audio>
        </div>
        <div className="submitted-text">Text:<br/>{submittedValue}</div>
        <div className="submitted-text">{sysMessage}</div>
      </header>
    </div>
  );
};

export default App;
