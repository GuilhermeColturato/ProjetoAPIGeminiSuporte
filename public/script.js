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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        });

        const data = await response.json();
        updateLastMessage(data.error || data.response, 'ai');
    } catch (error) {
        updateLastMessage('Ocorreu um erro ao buscar a resposta.', 'ai');
    }
});

function mdToHtml(md) {
    let html = md;
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    // Lists (simple unordered)
    html = html.replace(/^\s*-\s(.*)/gm, '<ul><li>$1</li></ul>');
    html = html.replace(/<\/ul>\n<ul>/g, ''); // Join consecutive lists
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    return html;
}

function appendMessage(text, sender, isLoading = false) {
    const bubble = document.createElement('div');
    bubble.classList.add('chat-bubble', `${sender}-bubble`);
    if (isLoading) bubble.classList.add('loading');

    const messageText = document.createElement('div');
    messageText.classList.add('message-text');
    messageText.innerHTML = mdToHtml(text);

    bubble.appendChild(messageText);
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function updateLastMessage(text, sender) {
    const loadingBubble = chatBox.querySelector('.loading .message-text');
    if (loadingBubble) {
        loadingBubble.innerHTML = mdToHtml(text);
        loadingBubble.parentElement.classList.remove('loading');
    } else {
        appendMessage(text, sender);
    }
}
