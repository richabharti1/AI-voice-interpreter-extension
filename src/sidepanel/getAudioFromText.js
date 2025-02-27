const openaiKey = process.env.OPEN_API_KEY;
let audio = null;

const getAudioFromText = async (text) => {
    // console.log('text',text);
    try {
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiKey}`,
            },
            body: JSON.stringify({
                model: 'tts-1',
                voice: 'alloy',
                input: text,
            }),
        });

        const audioData = await response.blob();
        const audioUrl = URL.createObjectURL(audioData);
        if (audioUrl) {
            if (audio) {
                audio.pause();  // Stop any previously playing audio
                audio.src = "";  // Release the URL to free memory
            }
            audio = new Audio(audioUrl);
            audio.play()
                .then(() => {
                    console.log('Audio is playing');
                })
                .catch((error) => {
                    console.error('Error playing audio:', error);
                });
        }

    } catch (error) {
        console.error('Error generating speech:', error);
    }

};

// Function to stop the audio
const stopAudio = () => {
    if (audio) {
        audio.pause();
        audio.src = ""; // Free up the resource
        console.log("Audio stopped");
    }
};

export { getAudioFromText, stopAudio };
