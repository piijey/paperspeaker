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


  const [speechURL, setSpeechURL] = useState('');

  useEffect(() => {
    setInputValue('');
    if ( submittedValue.length > 0 ) {
      if (window.electron && window.electron.createSpeech) {
        setSysMessage(`creating speech ...`);
        window.electron.createSpeech(submittedValue).then((buffer) => {
          const blob = new Blob([buffer], {type:'audio/mp3'});
          const url = URL.createObjectURL(blob);
          setSpeechURL(url)
          setSysMessage(`Speech File is Ready.`);
        });
      } else {
        setSysMessage('text-to-speech を利用するには Electron で実行してね');
      }
    } //submittedValue.length
  }, [submittedValue]);

  const audioRef = useRef(null);

  useEffect(() => {
    if ( !speechURL ){ return }
    const audioElement = audioRef.current;
    audioElement.src = speechURL;
    audioElement.play()
      .catch(err => setSysMessage(`failed to play audio: ${err}`))
  }, [speechURL]);


  return (
    <div className="App">
      <header className="App-header">
        <h1>
          PaperSpeaker
        </h1>
        <form onSubmit={handleSubmit} id="submit-text">
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
