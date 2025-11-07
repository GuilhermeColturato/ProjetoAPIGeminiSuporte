const form = document.getElementById('prompt-form');
const promptInput = document.getElementById('prompt-input');
const responseContainer = document.getElementById('response-container');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const prompt = promptInput.value;
  responseContainer.innerHTML = 'Carregando...';

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (data.error) {
      responseContainer.innerHTML = data.error;
    } else {
      responseContainer.innerHTML = data.response;
    }
  } catch (error) {
    responseContainer.innerHTML = 'Ocorreu um erro ao buscar a resposta.';
  }
});
