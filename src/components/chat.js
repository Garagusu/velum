/* ═══════════════════════════════════════════════
   VELUM — AI Chat Component
   chat.js
   ═══════════════════════════════════════════════ */

const Chat = (() => {

  const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

  // Replace with your API key or use a backend proxy
  // For production: NEVER expose API key in frontend — use a backend route
  const API_KEY = 'YOUR_ANTHROPIC_API_KEY';

  let chatHistory = [];
  let isLoading = false;

  // ── Init ──────────────────────────────────────
  function init(state) {
    chatHistory = [];
    const intro = document.getElementById('ai-intro');
    if (intro) {
      intro.textContent = `Merhaba ${state.name}! ` +
        `${state.sun} Güneşin, ${state.moon} Ayın ve ${state.asc} Yükselişinle zengin bir harita görüyorum. ` +
        `Haritanda özellikle merak ettiğin bir alan var mı?`;
    }

    // Quick question buttons
    document.querySelectorAll('.quick-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.dataset.question;
        if (q) sendMessage(q, state);
      });
    });

    // Send button
    const sendBtn = document.getElementById('chat-send-btn');
    if (sendBtn) sendBtn.addEventListener('click', () => sendFromInput(state));

    // Enter key
    const input = document.getElementById('chat-input');
    if (input) {
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendFromInput(state);
        }
      });
      // Auto-resize textarea
      input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
      });
    }
  }

  function sendFromInput(state) {
    const input = document.getElementById('chat-input');
    const msg = input?.value.trim();
    if (!msg) return;
    input.value = '';
    input.style.height = 'auto';
    sendMessage(msg, state);
  }

  // ── Send message ──────────────────────────────
  async function sendMessage(text, state) {
    if (isLoading) return;
    isLoading = true;

    appendMessage(text, 'user');

    const typing = appendTyping();

    try {
      chatHistory.push({ role: 'user', content: text });

      const systemPrompt = CONTENT.buildAISystemPrompt(state);

      const response = await fetch(ANTHROPIC_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: systemPrompt,
          messages: chatHistory.slice(-12),  // keep last 12 turns
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply = data.content
        ?.filter(b => b.type === 'text')
        .map(b => b.text)
        .join('') || 'Kozmik bağlantı kurulamadı, birazdan tekrar dene.';

      chatHistory.push({ role: 'assistant', content: reply });
      typing.remove();
      appendMessage(reply, 'astrologer');

    } catch (err) {
      typing.remove();
      const fallback = getFallbackResponse(text, state);
      chatHistory.push({ role: 'assistant', content: fallback });
      appendMessage(fallback, 'astrologer');
      console.warn('Chat API error:', err.message);
    } finally {
      isLoading = false;
    }
  }

  // ── DOM helpers ───────────────────────────────
  function appendMessage(text, role) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const div = document.createElement('div');
    div.className = `msg ${role}`;

    const now = new Date();
    const time = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    const senderLabel = role === 'user' ? 'Sen' : 'Velum';

    div.innerHTML = `
      <div class="msg-bubble">${escapeHtml(text)}</div>
      <div class="msg-time">${senderLabel} · ${time}</div>
    `;

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

  // ── Offline/error fallbacks ───────────────────
  function getFallbackResponse(question, state) {
    const { sun, moon, asc } = state;
    const q = question.toLowerCase();

    if (q.includes('aşk') || q.includes('sevgi') || q.includes('ilişki')) {
      return `${sun} Güneşin ve ${moon} Ayının kombinasyonu aşk konusunda karmaşık bir tablo çiziyor. ` +
        `Sezgisel derinliğin güçlü bir partner için çekici; ancak duygusal güvende ihtiyaç duyduğun sabır bulmak zaman alabilir. ` +
        `Venüs haritanda sekizinci evi etkiliyor — bu derin bağlar kurduğunu, ama kolay güvenmediğini gösteriyor.`;
    }

    if (q.includes('kariyer') || q.includes('para') || q.includes('iş')) {
      return `${asc} Yükselişin kariyer konusunda sana ciddi bir görünüm veriyor. ` +
        `${sun} Güneşinin gücü uzun vadeli projelerde parıldıyor — anlık kazanımlardan çok kalıcı inşaatlara odaklan. ` +
        `Önümüzdeki aylarda Jüpiter transiti kariyer kapılarını zorlayabilir, ama hazırlıklı olmak gerekiyor.`;
    }

    if (q.includes('güçlü') || q.includes('zayıf') || q.includes('yan')) {
      return `${sun} Güneşinin en büyük gücü: kararlılık ve içten gelen bir güvenilirlik hissi. ` +
        `${moon} Ayının getirdiği sezgisel derinlik seni birçok kişiden farklı kılıyor. ` +
        `Zorlu tarafın ise ${asc} Yükselişinin bazen aşırı kontrol isteği ve duygusal mesafeye çekilme eğilimi. ` +
        `Bu ikisi dengede tutulursa güçlü bir bütünleşme olabilir.`;
    }

    return `Haritana baktığımda ${sun}-${moon}-${asc} üçlüsü oldukça ilginç bir dinamik gösteriyor. ` +
      `Şu an API bağlantısı geçici olarak kesildi — birazdan tekrar dene, daha derin bir analiz için buradayım.`;
  }

  return { init, sendMessage };

})();
