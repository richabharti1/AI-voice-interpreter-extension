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
            transcribeSpeech(audioBlob);
        };
    }
});

const transcribeSpeech = async (audioBlob) => {
    // Prepare form data for the request
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

    // Parse and log the response
    const data = await response.json();
    console.log('hello',data.text);
};

