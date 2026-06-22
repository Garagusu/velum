/* ═══════════════════════════════════════════════
   VELUM — AI Chat Component
   chat.js  —  Groq API (ücretsiz, hızlı)
   Sonradan Claude'a geçmek için sadece
   GROQ_API_KEY ve API_URL değiştir.
   ═══════════════════════════════════════════════ */

const Chat = (() => {

  // ── API Ayarları ─────────────────────────────
  // Groq: console.groq.com → API Keys → Create
  // Key önce sessionStorage'dan, sonra config.js'den okunur
  const GROQ_API_KEY = sessionStorage.getItem('velum_groq_key')
    || (typeof CONFIG !== 'undefined' ? CONFIG.GROQ_API_KEY : null);
  const API_URL      = 'https://api.groq.com/openai/v1/chat/completions';
  const MODEL        = 'llama-3.3-70b-versatile'; // Groq'un en iyi ücretsiz modeli

  // Claude'a geçince bu iki satırı şununla değiştir:
  // const API_URL = 'https://api.anthropic.com/v1/messages';
  // const MODEL   = 'claude-sonnet-4-6';

  let chatHistory = [];
  let isLoading   = false;

  // ── Init ──────────────────────────────────────
  function init(state) {
    chatHistory = [];

    const intro = document.getElementById('ai-intro');
    if (intro) {
      intro.textContent =
        `Merhaba ${state.name}! ` +
        `${state.sun} Güneşin, ${state.moon} Ayın ve ${state.asc} Yükselişinle ` +
        `zengin bir harita görüyorum. Ne merak ediyorsun?`;
    }

    document.querySelectorAll('.quick-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.dataset.question;
        if (q) sendMessage(q, state);
      });
    });

    document.getElementById('chat-send-btn')
      ?.addEventListener('click', () => sendFromInput(state));

    const input = document.getElementById('chat-input');
    if (input) {
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendFromInput(state);
        }
      });
      input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
      });
    }
  }

  function sendFromInput(state) {
    const input = document.getElementById('chat-input');
    const msg   = input?.value.trim();
    if (!msg) return;
    input.value = '';
    input.style.height = 'auto';
    sendMessage(msg, state);
  }

  // ── Send ──────────────────────────────────────
  async function sendMessage(text, state) {
    if (isLoading) return;

    // Key yoksa kullanıcıya bildir
    const key = sessionStorage.getItem('velum_groq_key')
      || (typeof CONFIG !== 'undefined' ? CONFIG.GROQ_API_KEY : null);
    if (!key || key === 'YOUR_GROQ_API_KEY_HERE') {
      appendMessage('AI sohbet için Groq API key gerekli. Ana sayfaya dön ve formdaki alana key'ini gir.', 'astrologer');
      return;
    }

    isLoading = true;

    appendMessage(text, 'user');
    const typing = appendTyping();

    try {
      chatHistory.push({ role: 'user', content: text });

      const systemPrompt = CONTENT.buildAISystemPrompt(state);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1000,
          messages: [
            { role: 'system', content: systemPrompt },
            ...chatHistory.slice(-12),
          ],
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${response.status}`);
      }

      const data  = await response.json();
      const reply = data.choices?.[0]?.message?.content?.trim()
        || 'Kozmik bağlantı kurulamadı, birazdan tekrar dene.';

      chatHistory.push({ role: 'assistant', content: reply });
      typing.remove();
      appendMessage(reply, 'astrologer');

    } catch (err) {
      typing.remove();
      const fallback = getFallbackResponse(text, state);
      chatHistory.push({ role: 'assistant', content: fallback });
      appendMessage(fallback, 'astrologer');
      console.warn('Chat error:', err.message);
    } finally {
      isLoading = false;
    }
  }

  // ── DOM helpers ───────────────────────────────
  function appendMessage(text, role) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const now  = new Date();
    const time = now.getHours().toString().padStart(2,'0') + ':' +
                 now.getMinutes().toString().padStart(2,'0');

    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.innerHTML = `
      <div class="msg-bubble">${escapeHtml(text)}</div>
      <div class="msg-time">${role === 'user' ? 'Sen' : 'Velum'} · ${time}</div>`;

    container.appendChild(div);
    div.scrollIntoView({ behavior: 'smooth', block: 'end' });
    return div;
  }

  function appendTyping() {
    const container = document.getElementById('chat-messages');
    if (!container) return { remove: () => {} };

    const div = document.createElement('div');
    div.className = 'msg astrologer';
    div.innerHTML = `
      <div class="msg-bubble">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>`;

    container.appendChild(div);
    div.scrollIntoView({ behavior: 'smooth', block: 'end' });
    return div;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }

  // ── Offline fallback ──────────────────────────
  function getFallbackResponse(question, state) {
    const { sun, moon, asc } = state;
    const q = question.toLowerCase();

    if (q.includes('aşk') || q.includes('sevgi') || q.includes('ilişki')) {
      return `${sun} Güneşin ve ${moon} Ayının kombinasyonu aşk konusunda derin ama seçici bir yapı gösteriyor. ` +
        `Kolay güvenmezsin — bu zayıflık değil, yüksek standartların. ` +
        `Venüs haritanda sekizinci evi etkiliyor; yüzeysel bağlar seni tatmin etmez.`;
    }
    if (q.includes('kariyer') || q.includes('para') || q.includes('iş')) {
      return `${asc} Yükselişin kariyer konusunda sana ciddi ve güvenilir bir görünüm veriyor. ` +
        `${sun} Güneşinin gücü uzun vadeli projelerde parıldıyor — ` +
        `anlık kazanımlardan çok kalıcı inşaatlara odaklan.`;
    }
    if (q.includes('güçlü') || q.includes('zayıf') || q.includes('yan')) {
      return `En büyük gücün: ${sun} Güneşinden gelen kararlılık ve ${moon} Ayından gelen derin sezgi. ` +
        `Zorlu tarafın ise ${asc} Yükselişinin bazen aşırı kontrol isteği. ` +
        `Bu ikisi dengede tutulursa güçlü bir bütünleşme olabilir.`;
    }

    return `(API bağlantısı yok — önce console.groq.com'dan ücretsiz key al ve chat.js'e yapıştır.) ` +
      `Haritana baktığımda ${sun}-${moon}-${asc} üçlüsü oldukça ilginç bir dinamik gösteriyor.`;
  }

  return { init, sendMessage };

})();
