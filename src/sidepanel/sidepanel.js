import {Box, Button, CssBaseline, ThemeProvider, Typography} from '@mui/material';
import {useState} from 'react';
import ReactDom from 'react-dom/client';
import theme from './appTheme';
import getAudioFromText from './getAudioFromText';
import './sidepanel.css';


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
        height: 300,
        background: 'white',
        zIndex: 2147483647,
        display: 'block !important',
    },
};

let createdWindowId;
// let textFromSpeech;
const App = () => {
    const [startRecording, setStartRecording] = useState(false);
    const [textFromSpeech, setTextFromSpeech] = useState('');

    const toggleRecording = () => {
        if (startRecording === false) {
            chrome.windows.create({
                width: 500,
                height: 500,
                type: 'panel',
                url: chrome.runtime.getURL('recorder/recorder.html'),
            }, (window) => {
                createdWindowId = window.id;
            });
        } else {
            chrome.tabs.query({windowId: createdWindowId, active: true}, (tabs) => {
                if (tabs.length > 0) {
                    console.log(createdWindowId, tabs[0].id);
                    const activeTab = tabs[0];
                    chrome.tabs.sendMessage(activeTab.id, {message: 'stopRecording'});
                    console.log('hi');
                } else {
                    console.log('No active tab found in the window with ID', createdWindowId);
                    console.log('hello');
                }
            });
        }
        setStartRecording(!startRecording);

    };
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'transcribedText') {
            console.log('Received message:', message.data);
            setTextFromSpeech(message.data);
            // textFromSpeech = message.data;
        }
    });
    const playAudio = () => {
        console.log('textFromSpeech', textFromSpeech);
        if (textFromSpeech) {
            getAudioFromText(textFromSpeech);
        } else {
            console.log('no text to convert to speech');
        }
    };
    return (
        <Box>
            <Typography variant="h5" sx={{fontWeight:'bold'}}>GPT Voice Chat</Typography>
            <Box sx={{
                background: 'white',
                height: 231,
                overflowY: 'auto', // Makes the content scrollable
                padding: '16px',
                borderRadius: '16px',
                boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px, rgb(51, 51, 51) 0px 0px 0px 3px',
            }}>
                <Typography variant="body1" component="h1">
                    {textFromSpeech}
                </Typography>
            </Box>
            <Box sx={{marginTop: '10px', textAlign: 'center'}}>
                <Box>
                    <Button variant="contained" disabled={startRecording === true} sx={{marginRight: '5px'}}
                            onClick={toggleRecording}>start
                        recording</Button>
                    <Button variant="contained" disabled={startRecording === false} onClick={toggleRecording}>stop
                        recording</Button>
                </Box>
                <Box sx={{marginTop: '10px'}}>
                    <Button variant="contained" onClick={playAudio}>Play Audio</Button>
                </Box>
            </Box>
        </Box>
    );
};

const root = ReactDom.createRoot(document.getElementById('root'));
root.render(
    <ThemeProvider theme={theme}>
        <App/>
    </ThemeProvider>
);
