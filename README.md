# 🤖 Gemini FastAPI – Integração Simples com a API do Google Gemini

![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-Framework-green.svg)
![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)

Este projeto demonstra uma integração **simples e funcional** entre o **FastAPI** e a **API Gemini (Google AI Studio)**.  
Ele recebe um *prompt* de texto e retorna a resposta gerada pelo modelo de IA.

---

## 🧠 Objetivo

Criar uma **API em Python** que:
- Aceita um *prompt* de texto via requisição **POST**;
- Envia o conteúdo para o **modelo Gemini 2.5 Flash**;
- Retorna a resposta gerada em formato **JSON**.

---

## ⚙️ Pré-requisitos

- Python **3.9+**
- Conta ativa no [Google AI Studio](https://aistudio.google.com/)
- Uma **chave de API válida** (`GOOGLE_API_KEY`)  
  🔗 Gere sua chave em: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- Consulte os **custos e limites de uso** em:  
  💰 [https://ai.google.dev/pricing?hl=pt-br](https://ai.google.dev/pricing?hl=pt-br)

---

## 📦 Instalação e Configuração

### 1️⃣ Clonar o repositório

```bash
git clone https://github.com/seuusuario/gemini-fastapi.git
cd gemini-fastapi

### 2️⃣ Criar ambiente virtual

```bash
python -m venv .venv
source .venv/bin/activate   # Linux / Mac
# .venv\Scripts\activate    # Windows
```

### 3️⃣ Instalar dependências

```bash
pip install -r requirements.txt
```

### 4️⃣ Criar arquivo `.env`

Crie um arquivo `.env` na raiz do projeto contendo:

```env
GOOGLE_API_KEY=sua_chave_aqui
```

---

## 🧩 Código principal (`main.py`)

```python
from fastapi import FastAPI
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Carrega variáveis do .env
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Modelo padrão
MODEL_NAME = "gemini-2.5-flash"

app = FastAPI()

# Listar modelos disponíveis
for m in genai.list_models():
    print(m.name)

# Modelo da requisição
class PromptRequest(BaseModel):
    prompt: str

@app.post("/generate")
def generate_text(request: PromptRequest):
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(request.prompt)
        return {"response": response.text}
    except Exception as e:
        return {"error": str(e)}
```

---

## ▶️ Executando o Servidor

```bash
uvicorn main:app --reload
```

Acesse em:
👉 [http://127.0.0.1:8000](http://127.0.0.1:8000)

Documentação interativa (Swagger UI):
👉 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🧪 Teste da API

### Via **cURL**

```bash
curl -X POST http://127.0.0.1:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explique o que é IA generativa em poucas palavras"}'
```

### Resposta esperada

```json
{
  "response": "A IA generativa cria novos conteúdos, como textos, imagens ou sons, aprendendo padrões de grandes volumes de dados."
}
```

---

## 🧰 Dependências

| Pacote                  | Descrição                                   |
| ----------------------- | ------------------------------------------- |
| **fastapi**             | Framework web moderno e performático        |
| **uvicorn**             | Servidor ASGI para executar o FastAPI       |
| **google-generativeai** | Biblioteca oficial do Google Gemini         |
| **python-dotenv**       | Leitura das variáveis de ambiente do `.env` |

---

## 🧩 Arquivo `requirements.txt`

```txt
fastapi
uvicorn
google-generativeai
python-dotenv
```

---

## ⚠️ Dicas

* Para listar todos os modelos disponíveis:

  ```python
  for m in genai.list_models():
      print(m.name)
  ```

---

## 💡 Próximos Passos

* Adicionar **CORS** para integrar com um front-end;
* Criar uma interface simples em **HTML/JS** para enviar prompts;
* Publicar no **Render**, **Railway** ou **Google Cloud Run**.

---

## 🧾 Licença

Este projeto está sob a licença **MIT**.
Sinta-se à vontade para usar, modificar e compartilhar.

---

### 👨‍💻 Autor

Desenvolvido por **André Silva**
 ✉️ [alsilva@uniara.edu.br](mailto:alsilva@uniara.edu.br)
