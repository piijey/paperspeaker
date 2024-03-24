# paperspeaker
A Text-to-Speech Application build with React and Electron.

This app utilizes the [OpenAI Text-to-Speech (TTS) API](https://platform.openai.com/docs/guides/text-to-speech) for converting text into speech.


## Development Setup
- macOS (Sonoma, arm64)
- Node.js v20.9.0

To install and start the development server:
```sh
npm install
npm start
```

To run the app with Electron, ensure the development server is running first. Then, start the Electron app:
```sh
npm run electron-start
```

## Build
To build Electron app for macOS arm64:
```sh
npm run electron-pack
```

## Files
- An [OpenAI API key](https://help.openai.com/en/articles/4936850-where-do-i-find-my-openai-api-key) is required. Please acquire one on your own and save it in `~/Documents/paperspeaker/.env`.
- Speech files will be stored in `~/Documents/paperspeaker/speech_files/`.
- Log files will be created and saved in `~/Library/Logs/paperspeaker/` each time the app is opened.
