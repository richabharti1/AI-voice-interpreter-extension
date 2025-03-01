import {Box, CssBaseline, IconButton, ThemeProvider, Typography} from '@mui/material';
import {useEffect, useState, useRef} from 'react';
import ReactDom from 'react-dom/client';
import theme from './appTheme';
import {getAudioFromText, stopAudio} from './getAudioFromText';
import './sidepanel.css';
import MicIcon from '@mui/icons-material/Mic';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import getResponseFromChatGpt from './getResponseFromChatGpt';


let createdWindowId;
const App = () => {
    const [startRecording, setStartRecording] = useState(false);
    const [textFromSpeech, setTextFromSpeech] = useState('');
    const [responseFromChatGpt, setResponseFromChatGpt] = useState('');
    const recordingIdRef = useRef(0);

    const toggleRecording = () => {
        setStartRecording(prevState => {
            if (prevState === false) {
                setTextFromSpeech('');
                setResponseFromChatGpt('');
                stopAudio();
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
                        chrome.tabs.sendMessage(activeTab.id, {message: 'stopRecording', id: recordingIdRef.current});
                        console.log('hi');
                    } else {
                        console.log('No active tab found in the window with ID', createdWindowId);
                        console.log('hello');
                    }
                });
            }
            // Update id only if we just started a new recording
            if (prevState == false) {
                recordingIdRef.current = (recordingIdRef.current + 1) % 100;
            }
            return !prevState;
        });
    };

    useEffect(() => {
        const handleMessage = (message, sender, sendResponse) => {
            if (message.action === 'transcribedText') {
                console.log('Received message:', message.data);
                const processed_id = message.id;
                if (processed_id === recordingIdRef.current) {
                    setTextFromSpeech(message.data);
                    getResponseFromChatGpt(message.data, processed_id).then(response => {
                        if (response.id === recordingIdRef.current) {
                            setResponseFromChatGpt(response.data);
                            getAudioFromText(response.data);
                        } else {
                            console.log('Ignoring response because new recording started.');
                        }
                    });
                } else {
                    console.log('Ignoring response because new recording started.');
                }
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);

        return () => {
            chrome.runtime.onMessage.removeListener(handleMessage);
        };
    }, []);

    return (
        <Box>
            <Typography variant="h5" sx={{fontWeight: 'bold'}}>GPT Voice Chat</Typography>
            <Box sx={{
                background: 'white',
                height: 100,
                overflowY: 'auto', // Makes the content scrollable
                padding: '16px',
                borderRadius: '16px',
                boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px, rgb(51, 51, 51) 0px 0px 0px 3px',
            }}>
                <Typography variant="body1" component="h1">{textFromSpeech}</Typography>
            </Box>
            <Box sx={{marginTop: '10px', textAlign: 'center'}}>
                <IconButton
                    sx={{
                        background: startRecording ? '#FF0000' : '#888888',
                        ':hover': {
                            background: startRecording ? '#FFCCCC' : '#BBBBBB',
                        },
                    }}
                    onClick={toggleRecording}
                ><MicIcon/></IconButton>
            </Box>
            <Box sx={{
                background: 'white',
                minHeight: 30,
                overflowY: 'auto', // Makes the content scrollable
                padding: '16px',
                borderRadius: '16px',
                boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px, rgb(51, 51, 51) 0px 0px 0px 3px',
                marginTop: '10px',
            }}>
                {startRecording === false && textFromSpeech !== '' && responseFromChatGpt === '' && <MoreHorizIcon sx={{
                    animation: 'flicker 1.5s infinite',
                    animationDelay: '0.1s', // Staggered effect
                    '@keyframes flicker': {
                        '0%': {opacity: 0.2},
                        '50%': {opacity: 1},
                        '100%': {opacity: 0.2},
                    },
                }}/>}
                <Typography variant="body1" component="h1">{responseFromChatGpt}</Typography>
            </Box>
        </Box>
    );
};

const root = ReactDom.createRoot(document.getElementById('root'));
root.render(
    <ThemeProvider theme={theme}>
        <CssBaseline/>
        <App/>
    </ThemeProvider>,
);
