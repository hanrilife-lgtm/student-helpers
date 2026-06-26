/******************************************************
 *  ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
 ******************************************************/
let currentSubject = 'termeh';
let consentGiven = false;

const contentData = {
  termeh: `
    <h2>Теоретическая механика</h2>
    <p>Термех изучает движение и равновесие тел под действием сил.</p>
    <h3>Статика</h3>
    <div class="formula-box"><span class="label">Момент силы</span>$$M = F \\cdot d$$</div>
    <h3>Кинематика</h3>
    <div class="formula-box"><span class="label">Путь при равномерном движении</span>$$s = v \\cdot t$$</div>
    <h3>Динамика</h3>
    <div class="formula-box"><span class="label">Второй закон Ньютона</span>$$F = m \\cdot a$$</div>
    <h2 style="margin-top:40px;">ИИ-репетитор</h2>
    <p>Опиши свою задачу — ИИ поможет разобраться.</p>
    <div id="aiContainer"></div>
  `,
  sopromat: `
    <h2>Сопротивление материалов</h2>
    <p>Сопромат изучает поведение твёрдых тел под нагрузкой. <strong>ИИ-репетитор поможет с чертежами.</strong></p>
    <h3>Закон Гука</h3>
    <div class="formula-box"><span class="label">Закон Гука</span>$$\\sigma = E \\cdot \\varepsilon$$</div>
    <h2 style="margin-top:40px;">ИИ-репетитор</h2>
    <p>Опиши свою задачу — ИИ поможет разобраться.</p>
    <div id="aiContainer"></div>
  `,
  tos: `
    <h2>Теория обработки сигналов</h2>
    <p>ТОС изучает сигналы. <strong>ИИ-репетитор поможет с графиками.</strong></p>
    <h3>Ряд Фурье</h3>
    <div class="formula-box"><span class="label">Ряд Фурье</span>$$f(t) = a_0 + \\sum_{n=1}^{\\infty} \\left( a_n \\cos(n\\omega t) + b_n \\sin(n\\omega t) \\right)$$</div>
    <h2 style="margin-top:40px;">ИИ-репетитор</h2>
    <p>Опиши свою задачу — ИИ поможет разобраться.</p>
    <div id="aiContainer"></div>
  `
};

// ========== ТЕМА ==========
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  document.getElementById('themeIcon').textContent = next === 'dark' ? '☀️' : '🌙';
  document.getElementById('themeLabel').textContent = next === 'dark' ? 'Светлая тема' : 'Тёмная тема';
  localStorage.setItem('theme', next);
}
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
document.getElementById('themeIcon').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
document.getElementById('themeLabel').textContent = savedTheme === 'dark' ? 'Светлая тема' : 'Тёмная тема';

// ========== ЧАСТИЦЫ ==========
function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (Math.random() * 10 + 10) + 's';
    p.style.animationDelay = Math.random() * 10 + 's';
    container.appendChild(p);
  }
}
createParticles();

// ========== АВТОРИЗАЦИЯ (простой email) ==========
function checkConsent() {
  consentGiven = document.getElementById('consentRules').checked && document.getElementById('consentPrivacy').checked;
}

function showModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function loginWithEmail() {
  const email = document.getElementById('emailInput').value.trim();
  const errorEl = document.getElementById('authError');
  if (!email) { errorEl.textContent = 'Введите email'; return; }
  if (!consentGiven) { errorEl.textContent = 'Необходимо согласиться с правилами и политикой'; return; }

  localStorage.setItem('userEmail', email);
  errorEl.textContent = '';
  showMainScreen();
}

function logoutUser() {
  localStorage.removeItem('userEmail');
  document.getElementById('authScreen').classList.remove('hidden');
  document.getElementById('mainScreen').classList.add('hidden');
}

function showMainScreen() {
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('mainScreen').classList.remove('hidden');
  if (!document.getElementById('content').innerHTML) {
    document.getElementById('content').innerHTML = contentData.termeh;
    if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([document.getElementById('content')]).catch(() => {});
    setTimeout(initAITutor, 200);
  }
}

if (localStorage.getItem('userEmail')) {
  showMainScreen();
}

// ========== ПЕРЕКЛЮЧЕНИЕ ПРЕДМЕТОВ ==========
const menuButtons = document.querySelectorAll('.menu-btn');
const contentDiv = document.getElementById('content');
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');

menuButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    menuButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSubject = btn.dataset.subject;
    contentDiv.innerHTML = contentData[currentSubject];
    if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([contentDiv]).catch(() => {});
    setTimeout(initAITutor, 100);
  });
});

menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
document.addEventListener('click', (e) => { if (!sidebar.contains(e.target) && e.target !== menuToggle) sidebar.classList.remove('open'); });

// ========== ИИ-РЕПЕТИТОР ==========
const SYSTEM_PROMPTS = {
  termeh: `Ты — репетитор по термеху. Помогай студенту разобраться, не давая готовых ответов. Используй сократовский метод. Формулы в LaTeX.`,
  sopromat: `Ты — репетитор по сопромату. Помогай студенту разобраться, в том числе с чертежами. Формулы в LaTeX.`,
  tos: `Ты — репетитор по ТОС. Помогай студенту разобраться, в том числе с графиками. Формулы в LaTeX.`
};

const WELCOME_TEXTS = {
  termeh: 'Привет! Я ИИ-репетитор по термеху. Расскажи задачу 🙂',
  sopromat: 'Привет! Я ИИ-репетитор по сопромату. Расскажи задачу, можешь прикрепить фото чертежа 🙂',
  tos: 'Привет! Я ИИ-репетитор по ТОС. Расскажи задачу, можешь прикрепить фото сигнала 🙂'
};

const GEMINI_API_KEY = window.GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.5-flash';

let chatHistory = [];
let msgCounter = 0;
let pendingImage = null;

function appendMessage(role, text, isLoading, imageDataUrl) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  const id = 'msg-' + (msgCounter++);
  div.id = id;
  div.className = 'msg ' + role + (isLoading ? ' loading' : '');
  if (imageDataUrl) { const img = document.createElement('img'); img.src = imageDataUrl; img.className = 'msg-thumb'; div.appendChild(img); }
  const span = document.createElement('span'); span.className = 'msg-text';
  span.textContent = isLoading ? 'Думаю…' : text;
  div.appendChild(span);
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}

function updateMessage(id, text) {
  const div = document.getElementById(id);
  if (!div) return;
  div.classList.remove('loading');
  const span = div.querySelector('.msg-text');
  if (span) span.textContent = text; else div.textContent = text;
  if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([div]).catch(() => {});
  document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
}

function handleImageSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    pendingImage = { mediaType: file.type, base64: dataUrl.split(',')[1], previewUrl: dataUrl };
    document.getElementById('imagePreviewThumb').src = dataUrl;
    document.getElementById('imagePreview').style.display = 'flex';
  };
  reader.readAsDataURL(file);
}

function removePendingImage() { pendingImage = null; document.getElementById('chatImageInput').value = ''; document.getElementById('imagePreview').style.display = 'none'; }

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text && !pendingImage) return;
  const apiKey = GEMINI_API_KEY;
  if (!apiKey) { appendMessage('assistant', 'API-ключ Gemini не найден.', false); return; }
  const displayText = text || 'Вот фото задачи.';
  appendMessage('user', displayText, false, pendingImage ? pendingImage.previewUrl : null);
  const parts = [];
  if (pendingImage) parts.push({ inline_data: { mime_type: pendingImage.mediaType, data: pendingImage.base64 } });
  parts.push({ text: displayText });
  chatHistory.push({ role: 'user', parts: parts });
  input.value = '';
  removePendingImage();
  const loadingId = appendMessage('assistant', '', true);
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: chatHistory, systemInstruction: { parts: [{ text: SYSTEM_PROMPTS[currentSubject] }] } }) });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const reply = data.candidates?.[0]?.content?.parts?.map(p => p.text).join('\n') || 'Нет ответа.';
    chatHistory.push({ role: 'model', parts: [{ text: reply }] });
    updateMessage(loadingId, reply);
  } catch (e) { chatHistory.pop(); updateMessage(loadingId, 'Ошибка: ' + e.message); }
}

function clearChat() { chatHistory = []; document.getElementById('chatMessages').innerHTML = ''; appendMessage('assistant', WELCOME_TEXTS[currentSubject], false); }

function getAIHTML() {
  return `
    <div class="chat-box">
      <div class="chat-messages" id="chatMessages"></div>
      <div class="image-preview" id="imagePreview" style="display:none;"><img id="imagePreviewThumb" alt="Превью"><button class="remove-image-btn" onclick="removePendingImage()">✕</button></div>
      <div class="chat-input-row">
        <textarea id="chatInput" placeholder="Опиши задачу..."></textarea>
        <div class="chat-buttons">
          <input type="file" id="chatImageInput" accept="image/*" style="display:none;" onchange="handleImageSelect(event)">
          <button class="btn-secondary" onclick="document.getElementById('chatImageInput').click()">📷</button>
          <button onclick="sendChatMessage()">Отправить</button>
          <button class="btn-secondary" onclick="clearChat()">Очистить</button>
        </div>
      </div>
    </div>
  `;
}

function initAITutor() {
  const aiContainer = document.getElementById('aiContainer');
  if (!aiContainer) return;
  aiContainer.innerHTML = getAIHTML();
  const chatInput = document.getElementById('chatInput');
  if (chatInput) chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } });
  const msgContainer = document.getElementById('chatMessages');
  if (msgContainer && msgContainer.children.length === 0) { appendMessage('assistant', WELCOME_TEXTS[currentSubject], false); }
}
