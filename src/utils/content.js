/* ═══════════════════════════════════════════════
   VELUM — Content & Interpretation Engine
   content.js
   ═══════════════════════════════════════════════ */

const CONTENT = (() => {

  // ── Sign personalities ────────────────────────
  const SIGN_TRAITS = {
    'Koç':      { element:'Ateş', quality:'Öncü', ruler:'Mars',    strength:'cesaret ve girişkenlik', challenge:'sabırsızlık ve dürtüsellik' },
    'Boğa':     { element:'Toprak', quality:'Sabit', ruler:'Venüs', strength:'kararlılık ve güvenilirlik', challenge:'inatçılık ve değişime direnç' },
    'İkizler':  { element:'Hava', quality:'Değişken', ruler:'Merkür', strength:'uyumluluk ve iletişim', challenge:'kararsızlık ve yüzeysellik' },
    'Yengeç':   { element:'Su', quality:'Öncü', ruler:'Ay',        strength:'empati ve sezgi', challenge:'aşırı hassasiyet ve geçmişe takılı kalma' },
    'Aslan':    { element:'Ateş', quality:'Sabit', ruler:'Güneş',  strength:'liderlik ve yaratıcılık', challenge:'kibir ve onay ihtiyacı' },
    'Başak':    { element:'Toprak', quality:'Değişken', ruler:'Merkür', strength:'analitik derinlik ve özen', challenge:'aşırı eleştiri ve mükemmeliyetçilik' },
    'Terazi':   { element:'Hava', quality:'Öncü', ruler:'Venüs',   strength:'adalet duygusu ve diplomasi', challenge:'karar vermekte zorlanma' },
    'Akrep':    { element:'Su', quality:'Sabit', ruler:'Plüton',   strength:'dönüşüm gücü ve sezgi', challenge:'kıskançlık ve kontrolcülük' },
    'Yay':      { element:'Ateş', quality:'Değişken', ruler:'Jüpiter', strength:'özgürlük sevgisi ve iyimserlik', challenge:'sorumsuzluk ve abartı' },
    'Oğlak':   { element:'Toprak', quality:'Öncü', ruler:'Satürn', strength:'disiplin ve uzun vadeli vizyon', challenge:'duygusal mesafe ve iş takıntısı' },
    'Kova':     { element:'Hava', quality:'Sabit', ruler:'Uranüs', strength:'özgünlük ve insancıllık', challenge:'duygusal kopukluk' },
    'Balık':    { element:'Su', quality:'Değişken', ruler:'Neptün', strength:'sezgi, şefkat ve manevi derinlik', challenge:'sınır koymak ve gerçekçiliği korumak' },
  };

  // ── Transit descriptions ──────────────────────
  const TRANSIT_TITLES = [
    { symbol:'♃', name:'Jüpiter', aspect:'üçgen', badge:'Harmonik' },
    { symbol:'♄', name:'Satürn',  aspect:'kare',  badge:'Zorlayıcı' },
    { symbol:'☿', name:'Merkür',  aspect:'transit', badge:'Aktif' },
  ];

  // ── Today banner ──────────────────────────────
  function getTodayBanner(state) {
    const { sun, moon, asc, name } = state;
    const today = new Date();
    const dayIdx = today.getDay();
    const phase = ASTRUM.lunarPhase(today.toISOString().split('T')[0]);
    const transits = ASTRUM.currentTransits();
    const activePlanet = transits[dayIdx % transits.length];

    const title = `${activePlanet.name} ${activePlanet.sign}'de — ${getEnergyTitle(sun, moon)}`;

    const text = `Bugün ${phase.name} dönemindeyiz. ${asc} Yükselişin Ay'ın güncel ${activePlanet.sign} konumuyla rezonans içinde — ` +
      `${SIGN_TRAITS[moon]?.strength || 'içgüdüsel güç'} devrede. Ancak ${SIGN_TRAITS[sun]?.challenge || 'dikkat edilmesi gereken noktalar'} konusunda farkındalıklı ol.`;

    const pills = [
      `${activePlanet.symbol} ${activePlanet.name} ${activePlanet.sign}'de`,
      `${phase.name}`,
      `${asc} Yükselen Aktif`,
    ];

    return { title, text, pills };
  }

  function getEnergyTitle(sun, moon) {
    const combos = {
      'Boğa+Balık': 'Maddi ve Manevi Denge',
      'Koç+Akrep':  'Güç ve Dönüşüm Vakti',
      'İkizler+Yay':'Zihin Genişliyor',
      'Yengeç+Oğlak':'Aile ve Kariyer Dengesi',
    };
    return combos[`${sun}+${moon}`] || combos[`${moon}+${sun}`] || `${sun} Enerjisi Yükseliyor`;
  }

  // ── Transit list ──────────────────────────────
  function getTransitList(state) {
    const transits = ASTRUM.currentTransits();
    const natalPlanets = state.planets || [];
    const aspects = ASTRUM.calcAspects(natalPlanets, transits);

    const items = aspects.slice(0, 3).map(asp => {
      const planet = transits.find(p => p.name === asp.transit);
      return {
        symbol: planet?.symbol || '⊙',
        title: `${asp.transit} ${asp.aspect} natal ${asp.natal}`,
        text: getAspectText(asp, state),
        badge: asp.nature === 'harmonik' ? 'Harmonik' : asp.nature === 'zorlayıcı' ? 'Zorlayıcı' : 'Aktif',
        isChallenge: asp.nature === 'zorlayıcı',
      };
    });

    // Fallback if no aspects
    if (items.length === 0) {
      return [{
        symbol: '☿', title: `Merkür ${state.sun}'e transit`,
        text: `Zihinsel netlik yüksek. Uzun süredir ertelediğin önemli konuşmaları bugün yapabilirsin.`,
        badge: 'Aktif', isChallenge: false,
      }];
    }

    return items;
  }

  function getAspectText(asp, state) {
    const sun = state.sun, moon = state.moon;
    const texts = {
      'Üçgen':   `Bu harmonik açı sana kolaylık ve akış sunuyor. ${state.name} için sezgisel kararlar vermek bu dönemde daha isabetli olabilir.`,
      'Kare':    `Zorlayıcı bir gerilim alanı açılıyor. Bu enerji seninle çalışmana izin verirse büyük büyüme kapısı açılır — dirençle değil, bilinçle yaklaş.`,
      'Kavuşum': `Güçlü bir enerji yoğunlaşması. Bu dönem ${sun} doğanı tüm gücüyle hissettiriyor.`,
      'Sextil':  `Fırsatlar kapısı aralık. Küçük adımlarla büyük değişimlerin önünü açabilirsin.`,
      'Zıt':     `Bir kutup gerilimi söz konusu. İlişkilerinde ya da iç dünyanda yüzleşilmesi gereken bir gerçek su yüzüne çıkıyor olabilir.`,
    };
    return texts[asp.aspect] || `Bu transit döneminde ${moon} Ayının derinliğinden yararlanabilirsin.`;
  }

  // ── Forecast content ──────────────────────────
  function getDailyForecast(state) {
    const { sun, moon, asc } = state;
    const st = SIGN_TRAITS[sun] || {};
    const mt = SIGN_TRAITS[moon] || {};
    const at = SIGN_TRAITS[asc] || {};

    const sunPct = 60 + ((new Date().getDate()) % 30);
    const moonPct = 55 + ((new Date().getDate() * 3) % 35);
    const mercPct = 50 + ((new Date().getDate() * 2) % 40);

    return {
      sun: {
        text: `${sun} Güneşinin ${st.element || ''} elementinden gelen ${st.strength || 'güçlü yönleri'} bugün ön plana çıkıyor. ` +
          `${at.ruler ? at.ruler + ' yönetimindeki ' + asc + ' Yükselişin' : asc + ' Yükselişin'} pratik kararlar için destek sağlıyor. ` +
          `${st.challenge ? 'Dikkat: ' + st.challenge + ' eğilimi bu dönemde güçlenebilir.' : ''}`,
        pct: Math.min(sunPct, 95),
      },
      moon: {
        text: `${moon} Ayının ${mt.element || 'Su'} enerjisi duygusal alanında derin bir akış yaratıyor. ` +
          `${mt.strength ? mt.strength.charAt(0).toUpperCase() + mt.strength.slice(1) + ' kapasiten' : 'Sezgisel yetkin'} bugün zirvede. ` +
          `Ancak ${mt.challenge || 'duygusal sınırlar'} konusunda kendinle dürüst ol.`,
        pct: Math.min(moonPct, 95),
      },
      mercury: {
        text: `Merkür şu an doğum haritanın üçüncü evi bölgesinden geçiyor. Yazılı ve sözlü iletişimde netlik artıyor. ` +
          `${sun} doğanın analitik yönü öne çıkıyor — bugün önemli görüşmeler için uygun bir gün olabilir.`,
        pct: Math.min(mercPct, 95),
      },
    };
  }

  function getWeeklyForecast(state) {
    const { sun, moon, asc } = state;
    return {
      main: `Bu hafta ${sun} Güneşinin sabit doğası sana zemin sağlarken, ` +
        `${moon} Ayın duygusal akışkanlığı ilişkilerinde sezgisel bir rehber oluyor. ` +
        `Pazartesi-Çarşamba arası Ay döngüsü yavaşlıyor — bu sürede yeni başlangıçlardan kaçın, eski işleri tamamla. ` +
        `Perşembe akşamı Ay yeni konjonktüre giriyor: yeni niyetler belirlemek için mükemmel.`,
      warning: `Salı-Perşembe arası Merkür-Mars karesi yüzünden iletişimde sürtüşmeler olabilir. ` +
        `${sun} Güneşinin sabrı seni koruyor olsa da aceleci kararlardan kaçın. ` +
        `Finansal konularda bu hafta imza atmak için bekle — Mars retro etkisi arka planda.`,
    };
  }

  function getMonthlyForecast(state) {
    const { sun, moon, asc } = state;
    const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
    const m = new Date().getMonth();
    const nextM = months[(m + 1) % 12];

    const main = `Bu ay ${sun} Güneşinin natal konumuna Güneş transiti yaklaşıyor — kişisel yenilenme için güçlü bir pencere. ` +
      `${asc} Yükselişinin yöneticisi bu ay kariyer ve görünürlük alanında kapıları zorlayabilir. ` +
      `${nextM} başında başlayan yeni Ay döngüsü aşk ve yaratıcı projeler için olumlu bir enerji getiriyor.`;

    const today = new Date();
    const d = today.getDate();
    const dates = [
      { date: `${Math.min(d+2, 28)} ${months[m]}`, event: `Dolunay — Duygusal bir zirvede kararlar netleşiyor`, type: 'Ay Döngüsü' },
      { date: `${Math.min(d+7, 28)} ${months[m]}`, event: `Venüs ${ASTRUM.SIGNS[(ASTRUM.SIGNS.indexOf(sun)+3)%12]}'e giriyor — İlişkilerde yumuşama`, type: 'Gezegen Geçişi' },
      { date: `${Math.min(d+12, 28)} ${months[m]}`, event: `Jüpiter natal Güneşine üçgen açı — Şans zirvesi`, type: 'Kişisel Transit' },
      { date: `3 ${nextM}`, event: `Yeni Ay — Yeni niyet belirleme zamanı`, type: 'Ay Döngüsü' },
    ];

    return { main, dates };
  }

  function getUpcomingPeriods(state) {
    const { sun, moon, asc } = state;
    const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
    const m = new Date().getMonth();

    const intro = `Önümüzdeki altı ayda üç büyük dönem öne çıkıyor. ${sun} Güneşinin doğası uzun vadeli değişimlere temkinli yaklaşır, ` +
      `ancak dış gezegenler köklü dönüşümler başlatıyor. Bu süreçler kolay olmayabilir; ` +
      `ancak büyük olasılıkla kalıcı bir güç kazanımıyla sonuçlanacak.`;

    const items = [
      { date: `${months[(m+1)%12]}–${months[(m+2)%12]}`, event: `Satürn natal ${asc} Yükselişine kare açı — Yapısal yeniden yapılanma`, type: 'Zorlayıcı · ~8 hafta' },
      { date: `${months[(m+3)%12]} 2025`, event: `Jüpiter natal Güneşine kavuşum — Kariyer ve vizyon zirvesi`, type: 'Fırsat · ~4 hafta' },
      { date: `${months[(m+5)%12]} 2025`, event: `Venüs natal ${moon} Ay konumuna geçiş — Derin duygusal bağlar`, type: 'İlişki · ~3 hafta' },
    ];

    return { intro, items };
  }

  // ── AI System Prompt ──────────────────────────
  function buildAISystemPrompt(state) {
    const { name, sun, moon, asc, ascDeg, planets, birthDate, birthTime, birthCity } = state;
    const transits = ASTRUM.currentTransits();
    const aspects = planets ? ASTRUM.calcAspects(planets, transits) : [];
    const phase = ASTRUM.lunarPhase(new Date().toISOString().split('T')[0]);
    const sunTrait = SIGN_TRAITS[sun] || {};
    const moonTrait = SIGN_TRAITS[moon] || {};
    const ascTrait = SIGN_TRAITS[asc] || {};

    return `Sen VELUM platformunun yapay zeka astroloğusun. Adın "Velum". Türkçe konuş.

KULLANICI BİLGİLERİ:
- İsim: ${name}
- Doğum tarihi: ${birthDate} | Saat: ${birthTime} | Şehir: ${birthCity}
- Güneş burcu: ${sun} (${sunTrait.element} elementi, ${sunTrait.quality} niteliği, ${sunTrait.ruler} yöneticisi)
  Güç: ${sunTrait.strength}
  Zorluk: ${sunTrait.challenge}
- Ay burcu: ${moon} (${moonTrait.element} elementi)
  Güç: ${moonTrait.strength}
  Zorluk: ${moonTrait.challenge}
- Yükselen: ${asc} ${ascDeg}° (${ascTrait.element} elementi, ${ascTrait.ruler} yöneticisi)
- Gezegenler: ${(planets || []).map(p => `${p.name} ${p.sign} ${p.deg}°`).join(', ')}

GÜNCEL GÖKYÜZÜ (bugünün transitleri):
${transits.map(t => `${t.name}: ${t.sign} ${t.deg}°`).join('\n')}

AKTİF AÇILAR (natal ↔ transit):
${aspects.slice(0, 5).map(a => `${a.transit} ${a.aspect} natal ${a.natal} (${a.orb}° orb, ${a.nature})`).join('\n') || 'Belirgin açı yok'}

AY EVRESİ: ${phase.name} (${phase.days} gün)

GÖREV VE TARZ:
1. Bu kişinin kendi haritasına özgü, kişiselleştirilmiş yorumlar yap. Genel burç yorumları yapma.
2. Hem güçlü hem zorlu yanları dürüstçe belirt. Yalnızca övücü olma.
3. Kader kesinliği iddia etme — "olabilir", "bir ihtimal", "sembolik olarak" gibi dil kullan.
4. Haritadaki gerçek konumlara (derece, element, aspect) atıf yap.
5. Yanıtlar 3-5 cümle, doğal ve güven veren bir ses tonuyla.
6. Gerektiğinde şiirsel ama her zaman anlaşılır bir dil kullan.
7. Cevabın başında tekrar "Merhaba" deme — konuşma akışını koru.`;
  }

  return {
    SIGN_TRAITS,
    getTodayBanner,
    getTransitList,
    getDailyForecast,
    getWeeklyForecast,
    getMonthlyForecast,
    getUpcomingPeriods,
    buildAISystemPrompt,
  };

})();
