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

const techKeywords = [
    'tecnologia', 'informática', 'programação', 'redes', 'sistemas',
    'software', 'hardware', 'configuração', 'ambiente', 'navegador',
    'api', 'backend', 'frontend', 'erro', 'bug', 'servidor', 'banco de dados',
    'código', 'desenvolvimento', 'instalação', 'driver', 'firewall',
    'javascript', 'python', 'java', 'c#', 'php', 'html', 'css', 'sql'
];

function isTechSupportRelated(prompt) {
    const lowerCasePrompt = prompt.toLowerCase();
    return techKeywords.some(keyword => lowerCasePrompt.includes(keyword));
}

app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'O prompt é obrigatório' });
    }

    if (!isTechSupportRelated(prompt)) {
        return res.status(400).json({
            response: 'Desculpe, eu só posso responder dúvidas de suporte técnico e tecnologia. Por favor, reformule sua pergunta nesse contexto.'
        });
    }

    const enhancedPrompt = `
        Responda à seguinte pergunta de suporte técnico em português.
        Seja direto e objetivo.
        Use listas (bullets) ou passos numerados para facilitar a leitura.
        Inclua blocos de código apenas quando for estritamente necessário.
        A pergunta é: "${prompt}"
    `;

    try {
        const model = genAI.getGenerativeModel({ model: geminiModel });
        const result = await model.generateContent(enhancedPrompt);
        const response = await result.response;
        const text = response.text();
        res.json({ response: text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        if (error.message.includes('404 Not Found') || error.message.includes('API key not valid')) {
            res.status(500).json({
                error: `Erro: Ocorreu um problema com a API do Gemini. Verifique se o modelo "${geminiModel}" está correto e se sua chave de API é válida.`
            });
        } else {
            res.status(500).json({ error: `Erro ao gerar resposta da API Gemini: ${error.message}` });
        }
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
