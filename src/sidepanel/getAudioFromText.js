const openaiKey = process.env.OPEN_API_KEY;

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
        return audioUrl;

    } catch (error) {
        console.error('Error generating speech:', error);
        return null;
    }
};


export {getAudioFromText};
