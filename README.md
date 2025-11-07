# 🤖 Gemini API Technical Support

![Node.js](https://img.shields.io/badge/Node.js-20.x-blue.svg)
![Express](https://img.shields.io/badge/Express-Framework-green.svg)
![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)

This project is a technical support application that uses the Gemini API to answer technical questions, usage doubts, and product or service configurations.

---

## 🧠 Objective

Create a **Node.js API** that:
- Accepts a text prompt via a **POST** request;
- Sends the content to the **Gemini 1.5 Flash model**;
- Returns the generated response in **JSON** format.
- Provides a simple web interface to interact with the API.

---

## ⚙️ Prerequisites

- Node.js **20.x+**
- Active account on [Google AI Studio](https://aistudio.google.com/)
- A **valid API key** (`GOOGLE_API_KEY`)
  🔗 Generate your key at: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- Consult the **costs and usage limits** at:
  💰 [https://ai.google.dev/pricing?hl=pt-br](https://ai.google.dev/pricing?hl=pt-br)

---

## 📦 Installation and Configuration

### 1️⃣ Clone the repository

```bash
git clone https://github.com/seuusuario/gemini-suporte-api.git
cd gemini-suporte-api
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Create `.env` file

Create a `.env` file in the project root containing:

```env
GOOGLE_API_KEY=your_key_here
```

---

## 🧩 Main code (`server.js`)

```javascript
const express = require('express');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ response: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate response from Gemini API' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
```

---

## ▶️ Running the Server

```bash
npm start
```

Access at:
👉 [http://127.0.0.1:3000](http://127.0.0.1:3000)

---

## 🧪 API Test

### Via **cURL**

```bash
curl -X POST http://127.0.0.1:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explain what a generative AI is in a few words"}'
```

### Expected Response

```json
{
  "response": "Generative AI creates new content, such as text, images, or sounds, by learning patterns from large volumes of data."
}
```

---

## 🧰 Dependencies

| Package                  | Description                                   |
| ----------------------- | ------------------------------------------- |
| **express**             | Modern and performant web framework        |
| **dotenv**              | Reading environment variables from `.env` |
| **@google/generative-ai**| Official Google Gemini library         |
| **nodemon**             | Development dependency for auto-restarting the server       |

---

## 🧾 License

This project is under the **MIT** license.
Feel free to use, modify, and share.

---

### 👨‍💻 Author

Developed by **Jules**
 ✉️ [jules@example.com](mailto:jules@example.com)
