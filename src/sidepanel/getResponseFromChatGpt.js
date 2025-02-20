const openaiKey = process.env.OPEN_API_KEY;

const getResponseFromChatGpt = async (query)=>{
    return await requestChatGpt(query)
}


const requestChatGpt = async (query) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo", // You can choose a different model (e.g., "gpt-3.5-turbo")
            messages: [
                { role: "user", content: query }
            ]
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}


export default getResponseFromChatGpt;
