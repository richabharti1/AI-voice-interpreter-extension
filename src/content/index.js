import {AppBar, Box, CssBaseline, IconButton, Paper, Toolbar, Typography} from '@mui/material';
import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import MicIcon from '@mui/icons-material/Mic';


const newElement = document.createElement('div');
newElement.id = 'AI_EXTENSION-123456789';
document.body.appendChild(newElement);
const root = ReactDOM.createRoot(newElement);

const styles = {
    Box: {
        boxSizing: 'border-box',
        position: 'fixed',
        top: 11,
        right: 11,
        border: '3px black solid',
        borderStyle: 'inset',
        boxShadow: '5px 10px 8px #888888',
        width: 300,
        height: 120,
        background: 'white',
        zIndex: 2147483647,
        display: 'block !important',
    },
};

let mediaRecorder;
let audioChunks = [];
let stream;

const InjectElement = () => {
    const [recording, setRecording] = useState(false);


    const getAudioStream = () => {
        return navigator.mediaDevices
            .getUserMedia({video: false, audio: true})
            .catch((err) => console.error(`you got an error: ${err}`));
    };

    const startRecording = async () => {
        stream = await getAudioStream();

        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.start();
    };

    const stopRecording = () => {

        mediaRecorder.stop();

        mediaRecorder.onstop = async() => {
            const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
            const arrayBuffer = await audioBlob.arrayBuffer();
            chrome.runtime.sendMessage(
                {type: 'transcribeAudio', audioData: arrayBuffer});
        };

    };

    const toggleRecording = () => {
        if (recording === false) {
            startRecording();
            // chrome.runtime.sendMessage({action: 'startRecording'});
            setRecording(true);
        } else {
            stopRecording();
            // chrome.runtime.sendMessage({action: 'stopRecording'});
            setRecording(false);
        }
    };
    return (
        <Box sx={styles.Box}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div">
                        AI Voice Interpretor
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',  // Centers horizontally
                alignItems: 'center',         // Make sure the Box takes the full viewport height
            }}>
                <IconButton sx={{color: recording ? 'red' : 'black'}} onClick={toggleRecording}>
                    <MicIcon/>
                </IconButton>
            </Box>
        </Box>
    );
};

const App = () => {
    return (
        <>
            <CssBaseline/>
            <InjectElement/>;
        </>
    );
};

root.render(<App/>);

