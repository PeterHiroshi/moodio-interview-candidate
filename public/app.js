/** @typedef {{ id: string, title: string, image: string }} Card */
const form = /** @type {HTMLFormElement} */ (document.querySelector('#access-form'));
const apiInput = /** @type {HTMLInputElement} */ (document.querySelector('#api-url'));
const tokenInput = /** @type {HTMLInputElement} */ (document.querySelector('#token'));
const canvas = /** @type {HTMLElement} */ (document.querySelector('#canvas'));
const message = /** @type {HTMLElement} */ (document.querySelector('#message'));
const count = /** @type {HTMLElement} */ (document.querySelector('#count'));
/** @type {Card[]} */
let cards = [];
let apiUrl = '';
let token = '';

/** @param {string} path @param {RequestInit} [options] */
async function api(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, { ...options, headers: { Authorization: `Bearer ${token}` } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

function render() {
  count.textContent = `· ${cards.length} cards`;
  canvas.replaceChildren(...cards.map(card => {
    const article = document.createElement('article');
    article.className = 'card';
    const image = document.createElement('img');
    image.src = card.image;
    image.alt = '';
    const footer = document.createElement('div');
    footer.className = 'card-footer';
    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = card.title;
    const sub = document.createElement('div');
    sub.className = 'card-subtitle';
    sub.textContent = 'IMAGE · DIRECTION';
    const label = document.createElement('div');
    label.append(title, sub);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-button';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', `Copy ${card.title}`);
    button.addEventListener('click', () => copyCard(card.id));
    footer.append(label, button);
    article.append(image, footer);
    return article;
  }));
}

/** @param {string} id */
async function copyCard(id) {
  try {
    const result = await api(`/api/cards/${encodeURIComponent(id)}/copy`, { method: 'POST' });
    cards = [...cards, result.card];
    render();
  } catch (error) {
    message.textContent = error instanceof Error ? error.message : 'Could not copy card.';
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  apiUrl = apiInput.value.replace(/\/$/, '');
  token = tokenInput.value.trim();
  message.textContent = 'Connecting…';
  try {
    const result = await api('/api/cards');
    cards = result.cards;
    render();
    message.textContent = 'Connected. Your canvas is ready.';
  } catch (error) {
    cards = [];
    render();
    message.textContent = error instanceof Error ? error.message : 'Could not connect.';
  }
});
