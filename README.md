# 🤖 Suporte Técnico com API Gemini

![Node.js](https://img.shields.io/badge/Node.js-20.x-blue.svg)
![Express](https://img.shields.io/badge/Express-Framework-green.svg)
![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)

Este projeto é uma aplicação de suporte técnico que utiliza a API Gemini para responder a perguntas técnicas, dúvidas de uso e configurações de produtos ou serviços.

---

## 🧠 Objetivo

Criar uma **API em Node.js** que:
- Aceita um prompt de texto via requisição **POST**;
- Envia o conteúdo para o modelo configurado na variável de ambiente `GEMINI_MODEL` (com fallback para `gemini-1.5-pro`);
- Retorna a resposta gerada em formato **JSON**.
- Fornece uma interface web simples para interagir com a API.

---

## ⚙️ Pré-requisitos

- Node.js **20.x+**
- Conta ativa no [Google AI Studio](https://aistudio.google.com/)
- Uma **chave de API válida** (`GEMINI_API_KEY`)
  🔗 Gere sua chave em: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- Consulte os **custos e limites de uso** em:
  💰 [https://ai.google.dev/pricing?hl=pt-br](https://ai.google.dev/pricing?hl=pt-br)

---

## 📦 Instalação e Configuração

### 1️⃣ Clonar o repositório

```bash
git clone https://github.com/seuusuario/gemini-suporte-api.git
cd gemini-suporte-api
```

### 2️⃣ Instalar dependências

```bash
npm install
```

### 3️⃣ Criar arquivo `.env`

Crie um arquivo `.env` na raiz do projeto contendo as seguintes variáveis:

```env
# Sua chave de API do Google AI Studio
GEMINI_API_KEY=sua_chave_aqui

# (Opcional) O modelo a ser utilizado. O padrão é gemini-1.5-pro.
GEMINI_MODEL=gemini-1.5-pro
```

---

## ▶️ Executando o Servidor

### Linux / macOS (bash)

```bash
npm start
```

### Windows (PowerShell)

```powershell
npm start
```

Acesse em:
👉 [http://127.0.0.1:3000](http://127.0.0.1:3000)

---

## 🧪 Teste da API

### Via **cURL** (bash)

```bash
curl -X POST http://127.0.0.1:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explique o que é IA generativa em poucas palavras"}'
```

### Via **PowerShell**

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:3000/api/generate -Method Post -ContentType "application/json" -Body '{"prompt": "Explique o que é IA generativa em poucas palavras"}'
```

### Resposta Esperada

```json
{
  "response": "A IA generativa cria novos conteúdos, como textos, imagens ou sons, aprendendo padrões de grandes volumes de dados."
}
```

---

## 🧰 Dependências

| Pacote                  | Descrição                                   |
| ----------------------- | ------------------------------------------- |
| **express**             | Framework web moderno e performático        |
| **dotenv**              | Leitura das variáveis de ambiente do `.env` |
| **@google/generative-ai**| Biblioteca oficial do Google Gemini         |
| **nodemon**             | Dependência de desenvolvimento para reiniciar o servidor automaticamente       |

---

## 🧾 Licença

Este projeto está sob a licença **MIT**.
Sinta-se à vontade para usar, modificar e compartilhar.
