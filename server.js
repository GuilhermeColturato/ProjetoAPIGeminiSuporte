const express = require('express');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined in the .env file');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-pro';

app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'O prompt é obrigatório' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: geminiModel });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.json({ response: text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        if (error.message.includes('404 Not Found')) {
            res.status(500).json({
                error: `Erro: O modelo "${geminiModel}" não foi encontrado. Verifique se o nome do modelo está correto e se sua chave de API tem permissão para usá-lo.`
            });
        } else {
            res.status(500).json({ error: `Erro ao gerar resposta da API Gemini: ${error.message}` });
        }
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
