// server.js
const express = require('express');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in the .env file');
}

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
// Lista modelos direto no REST v1beta (sem usar SDK)
app.get('/models', async (_req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;

    // Node 18+ já tem fetch global
    const r = await fetch(url);
    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ error: `HTTP ${r.status}: ${txt}` });
    }
    const data = await r.json();

    // Retorna só os nomes para ficar limpo
    const names = (data.models || []).map(m => m.name);
    return res.json({ models: names });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});


app.use(express.static('public'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

/* =========================
   1) Classificador simples
   ========================= */

const TECH_KEYWORDS = [
  // redes / SO / linha de comando
  'ip','ipv4','ipv6','dns','gateway','proxy','wifi','wi-fi','rede','roteador','modem','ethernet',
  'ping','traceroute','ipconfig','ifconfig','cmd','prompt','powershell','terminal',
  'porta','porta 80','porta 3000','firewall','antivirus','antivírus','malware',

  // sistemas / hardware
  'windows','linux','ubuntu','macos','driver','placa de rede','adaptador','bios','uefi',
  'cpu','gpu','ram','ssd','hd','processador','placa-mae','placa-mãe',

  // dev / web
  'npm','node','nodemon','docker','git','github','api','server','backend','frontend',
  'http','https','rest','json','yaml','env','variavel de ambiente','variável de ambiente',
  'configuracao','configuração','instalacao','instalação','atualizacao','atualização','deploy','build',

  // termos gerais
  'tecnologia','informática','programação','sistemas','software','hardware',
  'erro','bug','log','exception','stack trace','timeout','latencia','latência'
];

const OFFTOPIC_KEYWORDS = [
  'namoro','relacionamento','amor','receita','comida','futebol','jogo do',
  'fofoca','signo','horoscopo','horóscopo','politica','política','eleicao','eleição',
  'celebridade','música','musica','filme','série','serie','astrologia','viagem','turismo'
];

function norm(s) {
  return (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function scoreByKeywords(text, keywords) {
  let score = 0;
  for (const k of keywords) {
    const kk = norm(k).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b${kk}\\b`, 'g');
    const matches = text.match(re);
    if (matches) score += matches.length;
  }
  return score;
}

/**
 * Retorna { isTech, confidence }
 * - techScore >= 2  => é tech (alta confiança)
 * - offScore >= 2 && techScore === 0 => não é tech (alta confiança)
 * - senão => em dúvida, tratamos como tech (para NÃO bloquear indevidamente)
 */
function classifyTopic(userText) {
  const text = norm(userText);
  const techScore = scoreByKeywords(text, TECH_KEYWORDS);
  const offScore  = scoreByKeywords(text, OFFTOPIC_KEYWORDS);

  if (techScore >= 2) return { isTech: true,  confidence: 0.9 };
  if (offScore >= 2 && techScore === 0) return { isTech: false, confidence: 0.9 };
  return { isTech: true, confidence: 0.5 }; // favorece responder
}

/* =========================
   2) Respostas rápidas
   ========================= */

function quickAnswers(userMessage) {
  const msg = norm(userMessage);

  // "como ver o IP do meu computador?"
  if (/(ver|descobrir|saber).*\bip\b/.test(msg) || /\bipconfig\b/.test(msg)) {
    return `
Windows
1) Pressione Win + R → digite: cmd
2) No Prompt, rode: ipconfig
3) Veja “Endereço IPv4”.

Linux/macOS
1) Abra o terminal
2) Linux: ifconfig ou ip a
   macOS: ifconfig | grep "inet "

IP público (externo): acesse https://meuip.com.br
`.trim();
  }

  // adicione outros atalhos aqui, se quiser…

  return null;
}

/* =========================
   3) Prompt de sistema (modelo)
   ========================= */

const SYSTEM_PROMPT = `
Você é um assistente de SUPORTE TÉCNICO e TECNOLOGIA.
Responda dúvidas sobre computador, internet, redes, sistemas operacionais, erros, configuração,
desenvolvimento (Node, npm, Docker, Git), APIs, etc.
Se a pergunta for claramente fora de tecnologia (ex.: namoro, receitas, futebol), recuse gentilmente.
Em caso de dúvida, NÃO recuse: peça um esclarecimento objetivo em UMA frase e tente ajudar.
Use linguagem clara e, quando for passo a passo, liste em itens numerados.
`;

/* =========================
   4) Rota principal
   ========================= */

app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'O prompt é obrigatório' });
  }

  // Classificação: só recusar se for claramente fora de tecnologia
  const { isTech, confidence } = classifyTopic(prompt);
  if (!isTech && confidence >= 0.8) {
    return res.status(400).json({
      response:
        'Desculpe, eu só posso responder dúvidas de suporte técnico e tecnologia. ' +
        'Exemplos: redes, IP, internet, Windows/Linux, erros de programas, configuração de APIs, npm, Docker, Git etc.'
    });
  }

  // Respostas rápidas (evitam chamar o modelo à toa)
  const qa = quickAnswers(prompt);
  if (qa) {
    return res.json({ response: qa });
  }

  // Prompt do usuário com instruções adicionais
  const enhancedPrompt = `
Responda em português.
Seja direto e objetivo.
Use listas (bullets) ou passos numerados quando for tutorial.
Inclua blocos de código apenas quando necessário.
Pergunta do usuário: "${prompt}"
`.trim();

  try {
    // Modelo Gemini com instrução de sistema
    const model = genAI.getGenerativeModel({
      model: geminiModel,
      systemInstruction: SYSTEM_PROMPT
    });

    const result = await model.generateContent(enhancedPrompt);
    const response = result?.response?.text?.() ||
                     result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
                     '(Sem texto retornado pelo modelo)';
    return res.json({ response: response.trim() });
  } catch (error) {
    console.error('Gemini API Error:', error);
    if (
      (error.message && error.message.includes('404 Not Found')) ||
      (error.message && error.message.includes('API key not valid'))
    ) {
      return res.status(500).json({
        error: `Erro: Ocorreu um problema com a API do Gemini. Verifique se o modelo "${geminiModel}" está correto e se sua chave de API é válida.`
      });
    }
    return res.status(500).json({ error: `Erro ao gerar resposta da API Gemini: ${error.message}` });
  }
});

app.get('/', (_req, res) => res.send('Servidor ok'));

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
