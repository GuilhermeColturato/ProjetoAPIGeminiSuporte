// server.js — REST v1, sem SDK, com fallback de modelo e health
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

console.log(">> HTTP v1 mode (no SDK)");

// v1 endpoints e modelos válidos
const BASE = "https://generativelanguage.googleapis.com/v1";
const CANDIDATES = ["gemini-1.5-pro-002", "gemini-1.5-flash-002"];

let SELECTED_MODEL = null;

async function listModels() {
  const url = `${BASE}/models?key=${encodeURIComponent(API_KEY)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`[${r.status}] ListModels falhou: ${await r.text()}`);
  const j = await r.json();
  return (j.models || []).map(m => (m.name || "").replace("models/", ""));
}

async function pickModel() {
  const available = new Set(await listModels());
  for (const m of CANDIDATES) if (available.has(m)) return m;
  if (available.size) return Array.from(available)[0]; // último recurso
  throw new Error("Nenhum modelo suportado retornado em /v1/models para esta API key.");
}

async function callGemini(model, prompt) {
  const url = `${BASE}/models/${model}:generateContent?key=${encodeURIComponent(API_KEY)}`;
  const body = { contents: [{ parts: [{ text: prompt }]}] };
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    const err = new Error(`[${r.status} ${r.statusText}] ${txt}`);
    err.status = r.status;
    err.statusText = r.statusText;
    throw err;
  }
  const data = await r.json();
  const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("\n") || "";
  return text || "(Sem conteúdo retornado pelo modelo.)";
}

app.post("/api/generate", async (req, res) => {
  try {
    const prompt = (req.body?.prompt ?? "").toString().trim();
    if (!prompt) return res.status(400).json({ error: "O prompt é obrigatório." });
    if (!SELECTED_MODEL) {
      SELECTED_MODEL = await pickModel();
      console.log(`>> Modelo escolhido: ${SELECTED_MODEL}`);
    }
    const t0 = Date.now();
    const text = await callGemini(SELECTED_MODEL, prompt);
    const latencyMs = Date.now() - t0;
    res.json({ response: text, model: SELECTED_MODEL, latencyMs });
  } catch (e) {
    const status = e?.status || 500;
    console.error("Gemini HTTP Error:", e.message);
    res.status(500).json({
      error: `Erro ao gerar resposta da API Gemini: ${e.message}`,
      hint: "Verifique se a chave é de 'Google AI for Developers' e quais modelos /v1/models retorna.",
    });
  }
});

app.get("/api/health", async (_req, res) => {
  try {
    if (!SELECTED_MODEL) SELECTED_MODEL = await pickModel();
    res.json({ status: "ok", model: SELECTED_MODEL, port });
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
