# 🤖 Suporte Técnico com API Gemini

![Node.js](https://img.shields.io/badge/Node.js-20.x-blue.svg)
![Express](https://img.shields.io/badge/Express-Framework-green.svg)
![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)

Aplicação de **suporte técnico automatizado** desenvolvida em **Node.js com Express**, integrada à **API Gemini (Google Generative AI)**.  
O projeto tem como objetivo fornecer respostas automáticas para dúvidas técnicas, uso de sistemas e configurações de produtos ou serviços, simulando um sistema moderno de atendimento inteligente.

---

## 🧩 Tecnologias Utilizadas

- **Node.js**
- **Express**
- **API Gemini (Google Generative AI)**
- **JavaScript**
- **dotenv**
- **API REST**

---

## 🧠 Objetivo

Criar uma **API em Node.js** que:
- Aceita um prompt de texto via requisição **POST**;
- Envia o conteúdo para o modelo configurado na variável de ambiente `GEMINI_MODEL`;
- Utiliza o modelo `gemini-2.5-flash`.
- Retorna a resposta gerada em formato **JSON**.
- Fornece uma interface web para interagir com a API.

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
git clone https://github.com/GuilhermeColturato/ProjetoAPIGeminiSuporte.git
cd gemini-suporte-api
```

### 2️⃣ Instalar dependências

```bash
npm install
```

### 3️⃣ Criar arquivo `.env`

Crie um arquivo `.env` na raiz do projeto, a partir do arquivo `.env.example`, e adicione suas credenciais:

```env
# Sua chave de API do Google AI Studio
GEMINI_API_KEY=sua_chave_aqui

# Modelo oficial e recomendado para o projeto.
# Se esta variável não for definida, o sistema usará 'gemini-1.5-pro' como padrão.
GEMINI_MODEL=gemini-2.5-flash
```

**⚠️ Importante:** Se você encontrar um erro "404 Not Found" ao tentar gerar uma resposta, verifique se o modelo especificado em `GEMINI_MODEL` está correto e se sua chave de API tem as permissões necessárias para acessá-lo.

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
👉 [http://localhost:3000](http://localhost:3000)

---

## 🧰 Dependências

| Pacote                  | Descrição                                   |
| ----------------------- | ------------------------------------------- |
| **express**             | Framework web moderno e performático        |
| **dotenv**              | Leitura das variáveis de ambiente do `.env` |
| **@google/generative-ai**| Biblioteca oficial do Google Gemini         |
| **nodemon**             | Dependência de desenvolvimento para reiniciar o servidor automaticamente       |


