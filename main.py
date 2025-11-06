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
