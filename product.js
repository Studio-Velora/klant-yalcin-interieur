/* =========================================================================
   Yalcin — Product detail page logic
   URL: product.html?slug=agena
   ========================================================================= */

function fmt(amount) {
  return '€ ' + parseFloat(amount).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const PROD_COLL_LABELS = {
  'vloerkleden-tapijten': 'Vloerkleden & Tapijten',
  'pvc-vloeren':          'PVC Vloeren',
  'laminaat':             'Laminaat',
};

/* ---- Description copy per collection ---- */
const DESCRIPTIONS = {
  'vloerkleden-tapijten': (p) => `
    <p class="lead" style="margin-bottom:1.4rem">De <strong>${p.title}</strong> is een premium vloerkleed uit de Lifestyle Interior collectie — handgeselecteerd op kwaliteit, kleur en duurzaamheid. Dit kleed combineert esthetiek met functionaliteit en voegt direct warmte en karakter toe aan elke ruimte.</p>
    <p>Met zijn zorgvuldig geweven structuur en warme kleurpalet past de ${p.title} naadloos in moderne, Scandinavische én klassieke interieurs. Het materiaal — ${p.specs?.materiaal || 'hoogwaardig synthetisch'} — is gekozen om jarenlang mooi te blijven, ook bij intensief gebruik.</p>
    <h4 style="font-family:var(--display);font-size:1.3rem;color:var(--ink);margin:1.6rem 0 .8rem">Waarom dit kleed?</h4>
    <ul style="padding-left:1.2rem;color:var(--ink-soft);line-height:2">
      <li>Ideaal voor ${p.specs?.ruimte || 'de woonkamer'} — ook bij druk gebruik</li>
      <li>Eenvoudig te onderhouden — zelfreinigende vezels</li>
      <li>Geschikt voor ${p.specs?.geschiktVoer || 'vloerverwarming'}</li>
      <li>Verkrijgbaar in meerdere maten op aanvraag</li>
      <li>Gratis professionele neerlegging door ons team</li>
    </ul>
    <p style="margin-top:1.4rem">Twijfelt u of dit kleed past bij uw interieur? Vraag een gratis staal aan of kom langs in onze showroom aan de Apeldoornselaan in Den Haag.</p>
  `,
  'pvc-vloeren': (p) => `
    <p class="lead" style="margin-bottom:1.4rem">De <strong>${p.title}</strong> PVC vloer combineert tijdloze uitstraling met uitzonderlijke duurzaamheid. Watervast, krasbestendig en ideaal voor drukke ruimtes — van de woonkamer tot de keuken.</p>
    <p>PVC vloeren zijn de perfecte keuze als u wilt genieten van een warme, houtachtige look zonder de onderhoudsbehoefte van massief hout. De ${p.title} is eenvoudig te leggen en nog eenvoudiger schoon te houden.</p>
    <h4 style="font-family:var(--display);font-size:1.3rem;color:var(--ink);margin:1.6rem 0 .8rem">Voordelen</h4>
    <ul style="padding-left:1.2rem;color:var(--ink-soft);line-height:2">
      <li>100% watervast — geschikt voor badkamer en keuken</li>
      <li>Krasbestendig — ideaal voor huishoudens met huisdieren</li>
      <li>Geschikt voor ${p.specs?.geschiktVoer || 'vloerverwarming'}</li>
      <li>Geluidsdempend en comfortabel onder de voet</li>
      <li>Vakkundige montage door eigen team</li>
    </ul>
  `,
  'laminaat': (p) => `
    <p class="lead" style="margin-bottom:1.4rem">De <strong>${p.title}</strong> laminaatvloer brengt de warmte van hout naar uw woning — duurzaam, betaalbaar en tijdloos. Een keuze die jarenlang mooi blijft.</p>
    <p>Laminaat is al decennia lang de meest gekozen vloer in Nederland — en niet voor niets. De ${p.title} biedt een authentieke houtlook met de robuustheid van modern laminaat. Eenvoudig te leggen, eenvoudig te onderhouden.</p>
    <h4 style="font-family:var(--display);font-size:1.3rem;color:var(--ink);margin:1.6rem 0 .8rem">Voordelen</h4>
    <ul style="padding-left:1.2rem;color:var(--ink-soft);line-height:2">
      <li>Slijtvaste toplaag — klasse AC4 of hoger</li>
      <li>Klik-systeem — snel en schoon gelegd</li>
      <li>Geschikt voor ${p.specs?.geschiktVoer || 'vloerverwarming'}</li>
      <li>Hygiënisch — geen spleten waar vuil in kan kruipen</li>
      <li>Volledige afwerking inclusief plinten</li>
    </ul>
  `,
};

const FAQS = {
  'vloerkleden-tapijten': [
    { q: "In welke maten is dit kleed verkrijgbaar?", a: "Dit kleed is standaard verkrijgbaar in de aangegeven afmeting. Andere maten zijn vaak op aanvraag mogelijk. Neem contact op via 070 390 7020 of kom langs in onze showroom." },
    { q: "Is dit kleed geschikt voor vloerverwarming?", a: "De meeste kleden uit onze collectie zijn geschikt voor vloerverwarming. Controleer de specificaties of vraag ons om advies. Als vuistregel geldt: maximaal 28°C oppervlaktetemperatuur." },
    { q: "Kan ik een staal aanvragen?", a: "Ja! U kunt gratis een staal aanvragen via onze offertepagina of telefonisch. Zo kunt u de kleur en textuur thuis bekijken voordat u beslist." },
    { q: "Hoe onderhoud ik dit kleed?", a: "Stofzuig regelmatig op een lage stand. Behandel vlekken direct met een vochtige doek en dep — nooit wrijven. Voor dieptereiniging adviseren wij een professioneel tapijtreinigingsbedrijf." },
    { q: "Leveren jullie ook een antisliponderlaag?", a: "Ja, bij ons kunt u ook een kwalitatieve antisliponderlaag bestellen, speciaal voor gebruik op laminaat of PVC vloeren. Vraag ernaar bij uw bestelling." },
  ],
  'pvc-vloeren': [
    { q: "Is deze PVC vloer geschikt voor alle ondergronden?", a: "Onze PVC vloeren zijn geschikt op meeste vlakke en droge ondergronden. Bij oneffenheden adviseren wij eerst te egaliseren. Wij doen altijd een gratis inmeting en controleren de ondergrond ter plekke." },
    { q: "Kan ik PVC leggen op bestaande tegels?", a: "Ja, in veel gevallen is dat mogelijk. De tegels moeten vlak, schoon en stevig zijn. Onze monteurs beoordelen dit tijdens de gratis inmeting." },
    { q: "Hoe lang gaat een PVC vloer mee?", a: "Een kwalitatieve PVC vloer gaat 15–25 jaar mee bij normaal gebruik. De slijtlaagdikte (0,3 mm of 0,55 mm) bepaalt de duurzaamheid. Wij adviseren u altijd de juiste keuze voor uw situatie." },
    { q: "Zijn jullie PVC vloeren geschikt voor bedrijfsruimtes?", a: "Ja, ons PVC-aanbod omvat ook producten met een zwaardere slijtlaag, geschikt voor commercieel gebruik. Neem contact op voor meer informatie." },
  ],
  'laminaat': [
    { q: "Moet ik een ondervloer leggen bij laminaat?", a: "Ja, een goede ondervloer is essentieel. Deze zorgt voor geluidsisolatie, warmte en compenseert kleine oneffenheden. Wij adviseren en leveren de juiste ondervloer voor uw situatie." },
    { q: "Kan laminaat krimpen of uitzetten?", a: "Laminaat heeft een kleine bewegingsruimte nodig aan de randen (circa 10 mm). Dit wordt afgedekt door de plinten. Onze monteurs houden hier altijd rekening mee." },
    { q: "Hoe lang duurt de montage?", a: "Afhankelijk van de oppervlakte en het type ruimte duurt een gemiddelde montage 1–2 dagen. Bij het inmeten geeft u een nauwkeurige tijdsinschatting." },
    { q: "Kan ik laminaat zelf leggen of doen jullie dat?", a: "Wij bieden vakkundige montage door ons eigen team. U kunt ook enkel het materiaal kopen en zelf leggen — dit is aan u. De prijs op de productpagina is exclusief montage tenzij anders aangegeven." },
  ],
};

/* ---- Render product page ---- */
function renderProduct(product, allProducts) {
  const imgs   = product.images;
  const specs  = product.specs || {};
  const fl     = product.flooring || null;   // vloeren: prijs per m² + pak
  const price  = fmt(product.price);
  const stock  = specs.voorraad || 5;
  const coll   = PROD_COLL_LABELS[product.collection] || product.collectionLabel || '';
  const isLow  = stock <= 4;

  /* Prijs-rij: vloeren tonen prijs per m², kleden per stuk */
  const priceRowHtml = fl
    ? `<div class="prod-price-row">
         <span class="prod-price-main">${fmt(fl.pricePerM2)}<span class="prod-price-unit">/m²</span></span>
         <span class="prod-price-note">incl. 21% btw · pak ${fmt(fl.pricePerPack)} (${fl.m2PerPack} m²)</span>
       </div>`
    : `<div class="prod-price-row">
         <span class="prod-price-main">${price}</span>
         <span class="prod-price-note">incl. 21% btw</span>
       </div>`;

  /* Koop-blok: vloeren krijgen m²-calculator, kleden de gewone qty */
  const buyHtml = fl
    ? `<div class="m2calc" data-m2pp="${fl.m2PerPack}" data-pricepack="${fl.pricePerPack}" data-loss="${fl.cuttingLossPct || 7}">
         <label class="m2calc-label" for="m2Input">Wat is je oppervlakte?</label>
         <div class="m2calc-input-row">
           <input type="number" id="m2Input" min="0" step="0.1" placeholder="0" inputmode="decimal">
           <span class="m2calc-unit">m²</span>
         </div>
         <label class="m2calc-loss">
           <input type="checkbox" id="m2Loss" checked>
           <span>Snijverlies toevoegen (${fl.cuttingLossPct || 7}%) <small>aanbevolen</small></span>
         </label>
         <div class="m2calc-result" id="m2Result" hidden>
           <div class="m2calc-line"><span>Benodigd</span><strong id="m2Need">—</strong></div>
           <div class="m2calc-line"><span>Aantal pakken</span><strong id="m2Packs">—</strong></div>
           <div class="m2calc-line m2calc-total"><span>Totaal</span><strong id="m2Total">—</strong></div>
         </div>
         <button class="btn-add-cart" id="addToCartBtn" disabled>
           <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
           Voeg toe aan winkelwagen
         </button>
       </div>`
    : `<div class="add-row">
         <div class="qty-wrap">
           <button class="qty-btn" id="qtyDec" aria-label="Minder">−</button>
           <span class="qty-num" id="qtyNum">1</span>
           <button class="qty-btn" id="qtyInc" aria-label="Meer">+</button>
         </div>
         <button class="btn-add-cart" id="addToCartBtn">
           <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
           In winkelwagen
         </button>
         <button class="btn-wishlist" aria-label="Opslaan als favoriet">
           <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
         </button>
       </div>`;

  /* Breadcrumb */
  document.getElementById('breadcrumbColl').textContent = coll;
  document.getElementById('breadcrumbColl').href = `webshop.html?filter=${product.collection}`;
  document.getElementById('breadcrumbTitle').textContent = product.title;
  document.title = `${product.title} — Yalcin Tapijt & Woninginrichting`;
  document.getElementById('pageTitle').textContent = `${product.title} — Yalcin Tapijt & Woninginrichting`;
  document.getElementById('pageDesc').content = `Bekijk ${product.title} bij Yalcin. ${specs.materiaal || ''} ${specs.afmetingen || ''}. Bestel online of kom langs in Den Haag.`;

  /* Gallery HTML */
  const thumbs = imgs.length > 1
    ? imgs.map((img, i) =>
        `<img class="gallery-thumb ${i === 0 ? 'on' : ''}" src="${img.url}" alt="${img.alt || product.title}" data-i="${i}">`
      ).join('')
    : '';

  /* Stock */
  const stockHtml = isLow
    ? `<div class="stock-row"><span class="stock-dot orange"></span><span class="stock-text">Nog ${stock} op voorraad</span><span class="stock-delivery">Bestel snel</span></div>`
    : `<div class="stock-row"><span class="stock-dot green"></span><span class="stock-text">Op voorraad</span><span class="stock-delivery">Levertijd: ${specs.leveringstijd || '3–5 werkdagen'}</span></div>`;

  /* Color swatch */
  const colorHtml = specs.kleurHex
    ? `<div class="prod-color"><label>Kleur — ${specs.kleur}</label><span class="color-swatch" style="background:${specs.kleurHex}"></span></div>`
    : '';

  /* Badges */
  const badges = [];
  if (isLow) badges.push(`<span class="gallery-badge hot">Nog ${stock} op voorraad</span>`);
  badges.push(`<span class="gallery-badge"><span class="dot"></span>Op voorraad</span>`);

  document.getElementById('productMain').innerHTML = `
    <div class="product-page">
      <!-- GALLERY -->
      <div class="prod-gallery">
        <div class="gallery-main">
          ${imgs[0] ? `<img id="mainImg" src="${imgs[0].url}" alt="${product.title}">` : `<div style="aspect-ratio:1;background:var(--sand)"></div>`}
          <div class="gallery-badge-wrap">${badges.join('')}</div>
        </div>
        ${thumbs ? `<div class="gallery-thumbs">${thumbs}</div>` : ''}
      </div>

      <!-- INFO PANEL -->
      <div class="prod-panel">
        <div class="prod-panel-inner">
          <div class="prod-eyebrow">
            <a class="prod-coll-link" href="webshop.html?filter=${product.collection}">${coll}</a>
            <span class="prod-sep"></span>
            <span class="prod-sku">SKU: ${specs.sku || '—'}</span>
          </div>

          <h1 class="prod-title">${product.title}</h1>
          <p class="prod-subtitle">
            ${specs.stijl ? `<strong>${specs.stijl}</strong> ·` : ''}
            ${specs.ruimte || 'Woonkamer'}
            ${specs.paalType ? ` · ${specs.paalType}` : ''}
          </p>

          <div class="prod-trust-row">
            <span class="pt-stars">★★★★★</span>
            <span class="pt-label">4,9 (5.013+)</span>
            <span class="pt-sep"></span>
            <span class="pt-label" style="color:var(--clay);font-weight:600">${specs.merk || 'Lifestyle Interior'}</span>
          </div>

          ${priceRowHtml}

          ${stockHtml}
          ${colorHtml}

          ${buyHtml}

          <button class="btn-quote" onclick="location.href='offerte.html'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Offerte aanvragen voor grotere hoeveelheden
          </button>

          <div class="payment-strip">
            <span>Betaalopties:</span>
            <span class="pay-badge">iDEAL</span>
            <span class="pay-badge">Creditcard</span>
            <span class="pay-badge">Achteraf</span>
            <span class="pay-badge">Bankoverschrijving</span>
          </div>

          <ul class="prod-usps">
            <li class="prod-usp">
              <svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              Gratis bezorging bij bestellingen boven €199
            </li>
            <li class="prod-usp">
              <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              Gratis inmeten op locatie in Den Haag en omstreken
            </li>
            <li class="prod-usp">
              <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              ${specs.garantie || '2 jaar fabrieksgarantie'}
            </li>
            <li class="prod-usp">
              <svg viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
              30 dagen retourrecht — geen vragen gesteld
            </li>
          </ul>
        </div>
      </div>
    </div>
  `;

  /* Gallery interactions */
  const mainImg = document.getElementById('mainImg');
  document.querySelectorAll('.gallery-thumb').forEach(t => {
    t.addEventListener('click', () => {
      mainImg.src = imgs[parseInt(t.dataset.i)].url;
      document.querySelectorAll('.gallery-thumb').forEach(x => x.classList.remove('on'));
      t.classList.add('on');
    });
  });

  /* Qty / m²-calculator */
  let doAdd;
  if (fl) {
    /* Vloeren: m²-calculator berekent aantal pakken */
    const calc = document.querySelector('.m2calc');
    const m2pp = parseFloat(calc.dataset.m2pp);
    const pricePack = parseFloat(calc.dataset.pricepack);
    const lossPct = parseFloat(calc.dataset.loss);
    const input = document.getElementById('m2Input');
    const lossChk = document.getElementById('m2Loss');
    const result = document.getElementById('m2Result');
    const addBtn = document.getElementById('addToCartBtn');
    let packs = 0;
    function recalc() {
      const m2 = parseFloat(input.value) || 0;
      if (m2 <= 0) { result.hidden = true; addBtn.disabled = true; packs = 0; return; }
      const eff = lossChk.checked ? m2 * (1 + lossPct / 100) : m2;
      packs = Math.ceil(eff / m2pp);
      const covered = (packs * m2pp).toFixed(2).replace('.', ',');
      document.getElementById('m2Need').textContent = eff.toFixed(2).replace('.', ',') + ' m²';
      document.getElementById('m2Packs').textContent = packs + ' pak' + (packs !== 1 ? 'ken' : '') + ' · ' + covered + ' m²';
      document.getElementById('m2Total').textContent = fmt(packs * pricePack);
      result.hidden = false;
      addBtn.disabled = false;
    }
    input.addEventListener('input', recalc);
    lossChk.addEventListener('change', recalc);
    doAdd = function () {
      if (packs <= 0) { input.focus(); return; }
      for (let i = 0; i < packs; i++) addToCart(product);
    };
    /* sticky qty heeft geen zin voor vloeren — verberg het */
    document.querySelector('.sticky-bar-qty')?.style.setProperty('display', 'none');
    document.getElementById('stickyAddBtn')?.addEventListener('click', () => {
      if (packs > 0) doAdd();
      else input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  } else {
    /* Kleden: gewone aantal-selector */
    let qty = 1;
    const setQty = (v) => {
      qty = Math.max(1, v);
      document.getElementById('qtyNum').textContent = qty;
      const sq = document.getElementById('stickyQtyNum');
      if (sq) sq.textContent = qty;
    };
    document.getElementById('qtyDec').addEventListener('click', () => setQty(qty - 1));
    document.getElementById('qtyInc').addEventListener('click', () => setQty(qty + 1));
    document.getElementById('stickyDec')?.addEventListener('click', () => setQty(qty - 1));
    document.getElementById('stickyInc')?.addEventListener('click', () => setQty(qty + 1));
    doAdd = function () { for (let i = 0; i < qty; i++) addToCart(product); };
    document.getElementById('stickyAddBtn')?.addEventListener('click', doAdd);
  }

  document.getElementById('addToCartBtn').addEventListener('click', doAdd);

  /* Sticky bar */
  document.getElementById('stickyTitle').textContent = product.title;
  document.getElementById('stickyPrice').textContent = price;
  const addBtn = document.getElementById('addToCartBtn');
  const stickyBar = document.getElementById('stickyBar');
  const observer = new IntersectionObserver(([e]) => {
    stickyBar.classList.toggle('show', !e.isIntersecting);
  }, { threshold: 0 });
  observer.observe(addBtn);

  /* ---- TABS ---- */
  document.getElementById('prodTabs').style.display = '';

  /* Beschrijving */
  const descFn = DESCRIPTIONS[product.collection] || ((p) => `<p>Premium product uit de collectie van Yalcin Tapijt & Woninginrichting. Vraag een gratis staal aan of kom langs in onze showroom in Den Haag.</p>`);
  document.getElementById('tab-beschrijving').innerHTML = descFn(product);

  /* Specificaties */
  const specRows = [
    ['Merk', specs.merk],
    ['SKU', specs.sku],
    ['Materiaal', specs.materiaal],
    ['Kleur', specs.kleur],
    ['Afmetingen', specs.afmetingen],
    ['Vorm', specs.vorm],
    ['Stijl', specs.stijl],
    ['Geschikt voor', specs.ruimte],
    // Vloer-specifieke eigenschappen (per m² verkocht)
    fl ? ['Prijs per m²', fmt(fl.pricePerM2)]                 : null,
    fl ? ['m² per pak', String(fl.m2PerPack).replace('.', ',') + ' m²'] : null,
    fl ? ['Planken per pak', fl.planksPerPack + ' planken']   : null,
    fl ? ['Prijs per pak', fmt(fl.pricePerPack)]              : null,
    specs.paalType   ? ['Paalhoogte', specs.paalHoogte]  : null,
    specs.paalType   ? ['Paaltype', specs.paalType]       : null,
    specs.gewicht    ? ['Gewicht', specs.gewicht]         : null,
    ['Geschikt voor vloerv.', specs.geschiktVoer],
    specs.antislip !== undefined ? ['Antislip', specs.antislip ? 'Ja' : 'Nee'] : null,
    ['Levertijd', specs.leveringstijd],
    ['Garantie', specs.garantie],
  ].filter(Boolean);

  document.getElementById('tab-specificaties').innerHTML = `
    <table class="spec-table">
      ${specRows.map(([k, v]) => v ? `<tr><td>${k}</td><td>${v}</td></tr>` : '').join('')}
    </table>
  `;

  /* Onderhoud & Garantie */
  document.getElementById('tab-onderhoud').innerHTML = `
    <h3 style="font-family:var(--display);font-size:1.6rem;color:var(--ink);margin-bottom:1rem">Onderhoud</h3>
    <p style="color:var(--ink-soft);max-width:62ch;line-height:1.75">${specs.onderhoud || 'Regelmatig stofzuigen. Vlekken direct deppen met een vochtige doek.'}</p>
    <h3 style="font-family:var(--display);font-size:1.6rem;color:var(--ink);margin:2rem 0 1rem">Garantie</h3>
    <p style="color:var(--ink-soft);max-width:62ch;line-height:1.75">${specs.garantie || '2 jaar fabrieksgarantie'} op fabricagefouten en materiaaldefecten. Schade door onjuist gebruik of onderhoud valt buiten de garantie. Neem bij garantiekwesties contact op via <a href="tel:+31703907020" style="color:var(--clay)">070 390 7020</a>.</p>
    <h3 style="font-family:var(--display);font-size:1.6rem;color:var(--ink);margin:2rem 0 1rem">Retourbeleid</h3>
    <p style="color:var(--ink-soft);max-width:62ch;line-height:1.75">U heeft 30 dagen retourrecht na ontvangst, mits het product ongebruikt en in originele verpakking is. Op maat gesneden en neergelegd materiaal kan niet worden geretourneerd.</p>
  `;

  /* FAQ */
  const faqs = FAQS[product.collection] || FAQS['vloerkleden-tapijten'];
  document.getElementById('tab-faq').innerHTML = `
    <div class="faq-list">
      ${faqs.map(faq => `
        <div class="faq-item">
          <button class="faq-q">
            ${faq.q}
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <div class="faq-a"><div class="faq-a-inner">${faq.a}</div></div>
        </div>
      `).join('')}
    </div>
  `;

  /* FAQ interactions */
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q').addEventListener('click', () => {
      const open = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!open) item.classList.add('open');
    });
  });

  /* Tab nav */
  document.querySelectorAll('.ptab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ptab-btn').forEach(b => b.classList.remove('on'));
      document.querySelectorAll('.ptab-content').forEach(c => c.classList.remove('on'));
      btn.classList.add('on');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('on');
    });
  });

  /* ---- RELATED PRODUCTS ---- */
  const related = allProducts
    .filter(p => p.slug !== product.slug && p.collection === product.collection)
    .sort(() => Math.random() - .5)
    .slice(0, 4);

  if (related.length > 0) {
    document.getElementById('relatedSection').style.display = '';
    document.getElementById('relatedGrid').innerHTML = related.map(rp => `
      <a class="prod-card" href="product.html?slug=${rp.slug}" data-reveal>
        <div class="prod-img-wrap">
          ${rp.images[0] ? `<img class="prod-img" src="${rp.images[0].url}" alt="${rp.title}" loading="lazy">` : `<div class="prod-img-ph">Afbeelding volgt</div>`}
        </div>
        <div class="prod-info">
          <div class="prod-coll">${PROD_COLL_LABELS[rp.collection] || ''}</div>
          <div class="prod-name">${rp.title}</div>
          <div class="prod-price">${fmt(rp.price)} <span class="prod-price-note">incl. btw</span></div>
        </div>
      </a>
    `).join('');
  }

  /* Reviews */
  document.getElementById('prodReviews').style.display = '';

  /* Scroll reveals */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
}

/* ---- Init ---- */
async function initProduct() {
  const params = new URLSearchParams(window.location.search);
  const slug   = params.get('slug');

  if (!slug) {
    window.location.href = 'webshop.html';
    return;
  }

  let products;
  try {
    const res = await fetch('products.json');
    products = await res.json();
  } catch (e) {
    document.getElementById('productMain').innerHTML = '<div style="padding:80px;text-align:center;color:var(--ink-faint)">Product kon niet worden geladen.</div>';
    return;
  }

  const product = products.find(p => p.slug === slug || p.handle === slug);
  if (!product) {
    window.location.href = 'webshop.html';
    return;
  }

  renderProduct(product, products);

  /* Cart buttons */
  document.getElementById('cartBtn')?.addEventListener('click', openCart);
  document.getElementById('cartClose')?.addEventListener('click', closeCart);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
  document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    if (cart.length === 0) return;
    const items = cart.map(i => `${i.variantId}:${i.qty}`).join(',');
    window.location.href = `https://${STORE}/cart/${items}`;
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

  updateCartUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProduct);
} else {
  initProduct();
}
