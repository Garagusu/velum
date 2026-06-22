# ✦ VELUM — Kişisel Astroloji Platformu

Gerçek bir astrolog deneyimini taklit eden, yapay zeka destekli premium astroloji web uygulaması.

## Özellikler

- **Doğum haritası hesaplama** — Güneş, Ay, Yükselen, 8 gezegen, 12 ev
- **Etkileşimli harita çarkı** — Aspekt çizgileri, gezegen sembolleri, Canvas 2D
- **Kişisel günlük öngörüler** — Sadece kişiye özel, genel burç yorumu değil
- **Haftalık / Aylık / Büyük Dönemler** — Transit bazlı analizler
- **Yapay Zeka Astrolog** — Claude (Anthropic) ile gerçek zamanlı sohbet
- **Karanlık kozmik tema** — Animasyonlu yıldız arka planı, premium hissiyat
- **Mobil uyumlu** — Responsive tasarım

---

## Kurulum

### 1. Projeyi klonla
```bash
git clone https://github.com/KULLANICI_ADIN/velum.git
cd velum
```

### 2. Dosya yapısı
Ekstra kurulum gerektirmez — saf HTML/CSS/JS projesidir.

```
velum/
├── index.html
├── public/
│   └── favicon.svg
└── src/
    ├── styles/
    │   ├── main.css
    │   ├── chart.css
    │   └── chat.css
    ├── utils/
    │   ├── astro.js       # Gezegen hesaplama motoru
    │   └── content.js     # Yorum ve içerik üretimi
    ├── components/
    │   ├── stars.js       # Animasyonlu yıldız arka planı
    │   ├── chart.js       # Canvas doğum haritası
    │   └── chat.js        # AI sohbet bileşeni
    └── app.js             # Ana uygulama yöneticisi
```

### 3. API Key ayarla
`src/components/chat.js` içinde:
```js
const API_KEY = 'YOUR_ANTHROPIC_API_KEY';
```
gerçek anahtarınla değiştir.

> ⚠️ **Güvenlik Notu:** API anahtarını doğrudan frontend koduna koymak üretim ortamı için önerilmez.
> Bunun yerine bir backend proxy kullan (bkz. aşağıdaki Backend Proxy bölümü).

### 4. Tarayıcıda aç
```bash
# Python ile basit sunucu:
python3 -m http.server 3000

# ya da Node.js ile:
npx serve .
```
Sonra `http://localhost:3000` adresine git.

---

## Backend Proxy (Önerilen)

API anahtarını güvende tutmak için minimal bir Express proxy:

```js
// server.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
app.use(express.static('.'));

app.post('/api/chat', async (req, res) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(req.body),
  });
  const data = await response.json();
  res.json(data);
});

app.listen(3000);
```

Sonra `chat.js` içindeki URL'yi `/api/chat` olarak güncelle.

---

## Mobil Uygulama (Sonraki Adım)

Bu projeyi React Native'e taşımak için önerilen yaklaşım:

```bash
npx create-expo-app velum-mobile
cd velum-mobile
```

Taşıma haritası:
| Web Bileşeni     | React Native Karşılığı             |
|------------------|------------------------------------|
| `<canvas>`       | `react-native-svg` + `expo-gl`     |
| CSS animations   | `react-native-reanimated`          |
| `localStorage`   | `@react-native-async-storage`      |
| `fetch` API      | Aynı                               |

---

## Teknik Notlar

### Gezegen Hesaplaması
`astro.js` basitleştirilmiş orbital periyot formülleri kullanır. Profesyonel doğruluk için:
- [astronomy-engine](https://github.com/cosinekitty/astronomy) (JS, ücretsiz)
- [Swiss Ephemeris WASM](https://github.com/timotejroiko/swisseph-v2) (yüksek doğruluk)

### AI Astrolog
Claude `claude-sonnet-4-6` modeli kullanır. System prompt:
- Kullanıcının tüm doğum haritasını içerir
- Güncel gökyüzü transitlerini içerir
- Aktif aspektleri (natal ↔ transit) içerir
- Ay evresini içerir

---

## Lisans
MIT — Özgürce kullan, değiştir, dağıt.

---

*Yapay Zeka ile inşa edildi · Claude (Anthropic) tarafından desteklendi*
