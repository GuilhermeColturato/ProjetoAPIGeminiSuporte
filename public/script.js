const form = document.getElementById('chat-form');
const promptInput = document.getElementById('prompt-input');
const chatBox = document.getElementById('chat-box');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const prompt = promptInput.value.trim();
    if (!prompt) return;

    appendMessage(prompt, 'user');
    promptInput.value = '';

    appendMessage('Carregando...', 'ai', true);

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        const data = await response.json();
        updateLastMessage(data.error ? data.error : data.response, 'ai');
    } catch (error) {
        updateLastMessage('Ocorreu um erro ao buscar a resposta.', 'ai');
    }
});

function appendMessage(text, sender, isLoading = false) {
    const bubble = document.createElement('div');
    bubble.classList.add('chat-bubble', `${sender}-bubble`);
    if (isLoading) {
        bubble.classList.add('loading');
    }
    bubble.textContent = text;
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function updateLastMessage(text, sender) {
    const loadingBubble = chatBox.querySelector('.loading');
    if (loadingBubble) {
        loadingBubble.textContent = text;
        loadingBubble.classList.remove('loading');
    } else {
        appendMessage(text, sender);
    }
}
