const openaiKey = process.env.OPEN_API_KEY;
let mediaRecorder;
let audioChunks = [];

function getAudioStream() {
    return navigator.mediaDevices
        .getUserMedia({video: false, audio: true})
        .catch((err) => console.error(`you got an error: ${err}`));
}

window.addEventListener('DOMContentLoaded', async () => {
    const stream = await getAudioStream();
    if (stream) {
        console.log('not getting error', stream);
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.start();
    } else {
        console.log('getting error');
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.message === 'stopRecording') {

        mediaRecorder.stop();
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, {type: 'audio/wav'});
            console.log('audioBlob', audioBlob);
            // playAudio(audioBlob)
            transcribeSpeech(audioBlob);
        };
    }
});

// const playAudio = (audioBlob) => {
//     const audioUrl = URL.createObjectURL(audioBlob);
//     console.log('audio URL',audioUrl);
//     if (audioUrl) {
//         const audio = new Audio(audioUrl);
//         audio.play()
//             .then(() => {
//                 console.log('Audio is playing');
//             })
//             .catch((error) => {
//                 console.error('Error playing audio:', error);
//             });
//     }
// };

const transcribeSpeech = async (audioBlob) => {

    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.mp3');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${openaiKey}`,
        },
        body: formData,
    });

    const data = await response.json();
    chrome.runtime.sendMessage({action: 'transcribedText', data: data.text});
};

