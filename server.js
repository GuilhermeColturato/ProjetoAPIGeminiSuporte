// server.js — REST v1 com detecção automática de modelo disponível
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config({ override: true });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) throw new Error("GEMINI_API_KEY is not defined in the .env file");

const BASE = "https://generativelanguage.googleapis.com/v1";

// candidatos estáveis no v1 (evitar *-latest e nomes antigos)
const CANDIDATES = ["gemini-1.5-pro-002", "gemini-1.5-flash-002"];

let SELECTED_MODEL = null;

/** Lista modelos habilitados para esta chave e escolhe um suportado */
async function pickSupportedModel() {
  const url = `${BASE}/models?key=${encodeURIComponent(API_KEY)}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    throw new Error(`ListModels falhou: [${resp.status} ${resp.statusText}] ${txt}`);
  }
  const data = await resp.json();
  const available = new Set((data.models || []).map(m => m.name?.replace("models/", "")));
  for (const m of CANDIDATES) {
    if (available.has(m)) return m;
  }
  // Se nenhum dos candidatos estiver disponível, tente o primeiro modelo retornado
  if (data.models?.[0]?.name) return data.models[0].name.replace("models/", "");
  throw new Error("Nenhum modelo suportado encontrado para esta API key.");
}

/** Chama generateContent no v1 */
async function callGemini(model, prompt) {
  const url = `${BASE}/models/${model}:generateContent?key=${encodeURIComponent(API_KEY)}`;
  // payload mínimo v1
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    const err = new Error(`[${resp.status} ${resp.statusText}] ${text}`);
    err.status = resp.status;
    err.statusText = resp.statusText;
    throw err;
  }
  const data = await resp.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("\n") ||
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "";
  return text || "(Sem conteúdo retornado pelo modelo.)";
}

app.post("/api/generate", async (req, res) => {
  try {
    let { prompt } = req.body || {};
    prompt = (prompt ?? "").toString().trim();

    if (!prompt) return res.status(400).json({ error: "O prompt é obrigatório." });
    if (prompt.length > 2000) return res.status(400).json({ error: "O prompt não pode exceder 2000 caracteres." });

    // se ainda não escolhemos, escolhe na primeira chamada
    if (!SELECTED_MODEL) {
      SELECTED_MODEL = await pickSupportedModel();
      console.log(`Modelo selecionado: ${SELECTED_MODEL}`);
    }

    const t0 = Date.now();
    const text = await callGemini(SELECTED_MODEL, prompt);
    const latencyMs = Date.now() - t0;

    return res.status(200).json({ response: text, model: SELECTED_MODEL, latencyMs });
  } catch (err) {
    const status = err?.status || 500;
    const statusText = err?.statusText || "Internal Error";
    const message = err?.message || "Erro desconhecido";
    console.error("[Gemini HTTP Error]", { status, statusText, message });
    return res.status(500).json({
      error: `Erro ao gerar resposta da API Gemini: [${status} ${statusText}] ${message}`,
      note: "Verifique se a chave pertence ao projeto 'Google AI for Developers' e se há modelos listados em /v1/models.",
      triedCandidates: CANDIDATES,
    });
  }
});

app.get("/api/health", async (_req, res) => {
  try {
    if (!SELECTED_MODEL) {
      SELECTED_MODEL = await pickSupportedModel();
      console.log(`Modelo selecionado (health): ${SELECTED_MODEL}`);
    }
    res.json({ status: "ok", model: SELECTED_MODEL, port });
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
