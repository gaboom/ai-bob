require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/ephemeral_key', async (req, res) => {
    try {
        const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const sessionData = await response.json();
        
        // Extract the secret from the 'client_secret.value' field
        const secret = sessionData.client_secret.value;

        if (!secret) {
            throw new Error("The 'client_secret' was not found in the session response from OpenAI.");
        }

        res.json({ secret: secret });
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: 'Failed to create session.' });
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    console.log(`Go to http://localhost:${port} to run the application.`);
});