/* =========================================================================
   Yalcin Webshop — laadt producten uit products.json
   Checkout via Shopify cart permalink
   ========================================================================= */

const STORE = 'yalcin-interieur-2.myshopify.com';

/* ---- Prijs formatteren ---- */
function formatPrice(amount) {
  return '€ ' + parseFloat(amount).toLocaleString('nl-NL', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  });
}

/* ---- State ---- */
let allProducts = [];
let cart        = JSON.parse(localStorage.getItem('yalcin_cart') || '[]');
let activeFilter = 'all';
let sortOrder    = 'title';
let searchQuery  = '';
let colorFilter  = new Set();

/* ---- Render product card ---- */
function renderCard(product) {
  const img   = product.images[0];
  const hasPrice = product.price > 0;
  const price = hasPrice ? formatPrice(product.price) : 'Prijs op aanvraag';

  const card = document.createElement('article');
  card.className = 'prod-card';
  card.dataset.coll = product.collection;
  card.setAttribute('role', 'listitem');

  card.innerHTML = `
    <div class="prod-img-wrap">
      ${img
        ? `<img class="prod-img" src="${img.url}" alt="${img.alt || product.title}" loading="lazy">`
        : `<div class="prod-img-ph">Afbeelding volgt</div>`
      }
      ${product.collectionLabel
        ? `<span class="prod-badge" style="background:var(--ink);font-size:.6rem">${product.collectionLabel}</span>`
        : ''}
      ${hasPrice ? `<button class="prod-quick-add" data-add="${product.id}" aria-label="Voeg ${product.title} toe aan winkelwagen">
        + In winkelwagen
      </button>` : ''}
    </div>
    <div class="prod-info">
      ${product.collectionLabel ? `<div class="prod-coll">${product.collectionLabel}</div>` : ''}
      <div class="prod-name">${product.title}</div>
      <div class="prod-price">${price}${hasPrice ? ' <span class="prod-price-note">incl. btw</span>' : ''}</div>
    </div>
  `;

  card.addEventListener('click', e => {
    if (e.target.closest('[data-add]')) return;
    window.location.href = `product.html?slug=${product.slug || product.handle}`;
  });

  card.querySelector('[data-add]')?.addEventListener('click', e => {
    e.stopPropagation();
    addToCart(product);
  });

  return card;
}

/* ---- Skeleton loaders ---- */
function renderSkeletons(count = 9) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  grid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    grid.innerHTML += `
      <div class="prod-skeleton">
        <div class="sk-img"></div>
        <div class="sk-body">
          <div class="sk-line w60"></div>
          <div class="sk-line w80"></div>
          <div class="sk-line w40"></div>
        </div>
      </div>`;
  }
}

/* ---- Filter & sort ---- */
function applyFilter() {
  let products = [...allProducts];

  if (activeFilter !== 'all') {
    products = products.filter(p => p.collection === activeFilter);
  }

  if (colorFilter.size) {
    products = products.filter(p => colorFilter.has(p.specs?.kleur || ''));
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    products = products.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.collectionLabel || '').toLowerCase().includes(q) ||
      (p.specs?.kleur || '').toLowerCase().includes(q) ||
      (p.specs?.materiaal || '').toLowerCase().includes(q)
    );
  }

  if (sortOrder === 'price-asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sortOrder === 'price-desc') {
    products.sort((a, b) => b.price - a.price);
  } else {
    products.sort((a, b) => a.title.localeCompare(b.title, 'nl'));
  }

  const grid  = document.getElementById('productGrid');
  const count = document.getElementById('productCount');
  grid.innerHTML = '';
  count.textContent = `${products.length} product${products.length !== 1 ? 'en' : ''}`;

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="shop-empty" style="grid-column:1/-1">
        <svg viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <p>Geen producten gevonden. Pas je zoekopdracht of filters aan.</p>
      </div>`;
    return;
  }

  products.forEach(p => {
    grid.appendChild(renderCard(p));
  });
}

/* ---- Modal ---- */
function openModal(product) {
  const overlay = document.getElementById('modalOverlay');
  const imgs    = product.images;
  const price   = formatPrice(product.price);

  const descriptions = {
    'vloerkleden-tapijten': 'Handgeselecteerd uit de Lifestyle Interior collectie. Warm van kleur, robuust van weefsel — gemaakt om jarenlang mooi te blijven. Verkrijgbaar in meerdere maten.',
    'pvc-vloeren': 'Watervast, slijtvast en onderhoudsvriendelijk. Ideaal voor woonkamers, keukens en gangen. Verkrijgbaar inclusief vakkundige montage in Den Haag en omstreken.',
    'laminaat': 'Warme houtlook met de duurzaamheid van laminaat. Strak en eenvoudig te combineren met elk interieur. Inclusief montage en afwerking naar keuze.',
    'gordijnen': 'Stijlvolle gordijnen die uw interieur compleet maken. Verkrijgbaar in diverse stoffen, kleuren en confectiematen. Inclusief opmeten en montage.',
    'parket': 'Massief en meerlaags parket voor een tijdloze uitstraling. Duurzaam, warm en geschikt voor vloerverwarming. Professionele plaatsing beschikbaar.',
    'tapijt': 'Comfortabel tapijt voor een warme en geluidsarme vloer. Verkrijgbaar in diverse dessins en kwaliteiten. Inclusief legservice.',
    'binnenzonwering': 'Functionele en decoratieve binnenzonwering. Van plissé en jaloeziën tot houten shutters. Op maat gemaakt en vakkundig gemonteerd.',
    'traprenovatie': 'Geef uw trap een nieuwe look met onze traprenovatie-oplossingen. PVC of laminaat overzetting, snel geplaatst en onderhoudsvriendelijk.',
    'cadeaubonnen': 'Verrras iemand met een cadeaubon van Yalcin Tapijt & Woninginrichting. Geldig op het gehele assortiment, van vloerkleden tot complete vloeren. 1 jaar geldig na aankoop.',
  };
  const desc = descriptions[product.collection] || 'Hoogwaardig materiaal uit onze curated collectie. Wilt u dit product zien of voelen? Kom langs in onze showroom in Den Haag.';

  const thumbsHtml = imgs.length > 1
    ? imgs.map((img, i) =>
        `<img class="modal-thumb ${i === 0 ? 'on' : ''}" src="${img.url}" alt="${img.alt || ''}" data-thumb="${i}">`
      ).join('')
    : '';

  overlay.querySelector('.modal-inner').innerHTML = `
    <div class="modal-gallery">
      <img class="modal-img" id="modalMainImg" src="${imgs[0]?.url || ''}" alt="${product.title}">
      ${thumbsHtml ? `<div class="modal-thumbs">${thumbsHtml}</div>` : ''}
    </div>
    <div class="modal-details">
      ${product.collectionLabel ? `<div class="modal-coll">${product.collectionLabel}</div>` : ''}
      <div class="modal-name">${product.title}</div>
      <div class="modal-price">${price} <span style="font-size:.9rem;font-weight:400;color:var(--ink-faint)">incl. btw</span></div>
      <p class="modal-desc">${desc}</p>
      <ul class="modal-features">
        <li>Gratis inmeten op locatie</li>
        <li>Professionele montage beschikbaar</li>
        <li>Stalen aanvragen mogelijk</li>
        <li>Thuisbezorgd of afhalen in Den Haag</li>
      </ul>
      <button class="modal-add" id="modalAddBtn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
        In winkelwagen
      </button>
    </div>
  `;

  overlay.querySelectorAll('.modal-thumb').forEach(t => {
    t.addEventListener('click', () => {
      const i = parseInt(t.dataset.thumb);
      overlay.querySelector('#modalMainImg').src = imgs[i].url;
      overlay.querySelectorAll('.modal-thumb').forEach(x => x.classList.remove('on'));
      t.classList.add('on');
    });
  });

  overlay.querySelector('#modalAddBtn')?.addEventListener('click', () => {
    addToCart(product);
    closeModal();
  });

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ---- Cart ---- */
function saveCart() {
  localStorage.setItem('yalcin_cart', JSON.stringify(cart));
}

/* ---- Animatie bij toevoegen aan winkelmandje ---- */
let lastClickEl = null;
document.addEventListener('click', e => { lastClickEl = e.target; }, true);
let lastCartAnim = 0;

function animateAddToCart() {
  const now = Date.now();
  if (now - lastCartAnim < 400) return;   // m²-calculator voegt meerdere pakken tegelijk toe
  lastCartAnim = now;

  const cartBtn = document.getElementById('cartBtn');
  const src = lastClickEl && lastClickEl.closest ? lastClickEl.closest('button') : null;

  /* Knop even "Toegevoegd" */
  if (src && !src._flash && src.matches('.btn-add-cart, .prod-quick-add, .modal-add')) {
    src._flash = true;
    const html = src.innerHTML;
    src.classList.add('is-added');
    src.innerHTML = '<svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2.4;margin-right:6px;vertical-align:-3px"><polyline points="20 6 9 17 4 12"/></svg>Toegevoegd';
    setTimeout(() => { src.innerHTML = html; src.classList.remove('is-added'); src._flash = false; }, 1400);
  }

  if (!cartBtn) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const to = cartBtn.getBoundingClientRect();
  const bump = () => {
    cartBtn.classList.remove('cart-bump'); void cartBtn.offsetWidth; cartBtn.classList.add('cart-bump');
    const bubble = document.getElementById('cartBubble');
    if (bubble) { bubble.classList.add('pop'); setTimeout(() => bubble.classList.remove('pop'), 500); }
  };
  if (reduce || !src || !to.width) { bump(); return; }

  /* Bolletje vliegt naar het mandje */
  const from = src.getBoundingClientRect();
  const dot = document.createElement('div');
  dot.className = 'fly-dot';
  dot.style.left = (from.left + from.width / 2 - 11) + 'px';
  dot.style.top  = (from.top + from.height / 2 - 11) + 'px';
  document.body.appendChild(dot);
  const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
  const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
  const anim = dot.animate([
    { transform: 'translate(0,0) scale(1)', opacity: 1 },
    { transform: `translate(${dx * .5}px,${dy * .5 - 40}px) scale(1.15)`, opacity: 1, offset: .45 },
    { transform: `translate(${dx}px,${dy}px) scale(.35)`, opacity: .9 }
  ], { duration: 650, easing: 'cubic-bezier(.5,0,.3,1)' });
  let done = false;
  const finish = () => { if (done) return; done = true; dot.remove(); bump(); };
  anim.onfinish = finish;
  setTimeout(finish, 800);   // vangnet als de browser de animatie pauzeert
}

function addToCart(product) {
  if (!product.variantId || !(product.price > 0)) return;
  const existing = cart.find(i => i.variantId === product.variantId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      variantId: product.variantId,
      title:     product.title,
      coll:      product.collectionLabel,
      price:     product.price,
      image:     product.images[0]?.url || null,
      qty:       1,
    });
  }
  saveCart();
  updateCartUI();
  animateAddToCart();
  showToast(`${product.title} toegevoegd`);
}

function removeFromCart(variantId) {
  cart = cart.filter(i => String(i.variantId) !== String(variantId));
  saveCart();
  updateCartUI();
}

function changeQty(variantId, delta) {
  const item = cart.find(i => String(i.variantId) === String(variantId));
  if (!item) return;
  item.qty = Math.max(0, item.qty + delta);
  if (item.qty === 0) cart = cart.filter(i => String(i.variantId) !== String(variantId));
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const total  = cart.reduce((s, i) => s + i.qty, 0);
  const bubble = document.getElementById('cartBubble');
  if (bubble) {
    bubble.textContent = total;
    bubble.classList.toggle('show', total > 0);
  }

  const badge = document.getElementById('cartCountBadge');
  if (badge) badge.textContent = `${total} item${total !== 1 ? 's' : ''}`;

  const itemsEl = document.getElementById('cartItems');
  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
        <p>Uw winkelwagen is leeg.<br>Voeg een product toe om te beginnen.</p>
      </div>`;
    const footer = document.getElementById('cartFooter');
    if (footer) footer.style.display = 'none';
    return;
  }

  const footer = document.getElementById('cartFooter');
  if (footer) footer.style.display = '';
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item" data-vid="${item.variantId}">
      ${item.image
        ? `<img class="ci-img" src="${item.image}" alt="${item.title}">`
        : `<div class="ci-img" style="background:var(--sand)"></div>`
      }
      <div class="ci-info">
        ${item.coll ? `<div class="ci-coll">${item.coll}</div>` : ''}
        <div class="ci-name">${item.title}</div>
        <div class="ci-qty">
          <button data-qty-dec="${item.variantId}" aria-label="Min">−</button>
          <span>${item.qty}</span>
          <button data-qty-inc="${item.variantId}" aria-label="Plus">+</button>
        </div>
        <button class="ci-remove" data-remove="${item.variantId}">Verwijderen</button>
      </div>
      <div class="ci-price">${formatPrice(item.price * item.qty)}</div>
    </div>
  `).join('');

  itemsEl.querySelectorAll('[data-qty-dec]').forEach(btn =>
    btn.addEventListener('click', () => changeQty(btn.dataset.qtyDec, -1)));
  itemsEl.querySelectorAll('[data-qty-inc]').forEach(btn =>
    btn.addEventListener('click', () => changeQty(btn.dataset.qtyInc, +1)));
  itemsEl.querySelectorAll('[data-remove]').forEach(btn =>
    btn.addEventListener('click', () => removeFromCart(btn.dataset.remove)));

  if (document.getElementById('cartSubtotal'))
    document.getElementById('cartSubtotal').textContent = formatPrice(subtotal);
  if (document.getElementById('cartTotal'))
    document.getElementById('cartTotal').textContent = formatPrice(subtotal);
}

function openCart() {
  document.getElementById('cartOverlay').classList.add('open');
  document.getElementById('cartPanel').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartPanel').classList.remove('open');
  document.body.style.overflow = '';
}

/* ---- Checkout via Shopify cart permalink ---- */
function checkout() {
  if (cart.length === 0) return;
  // Shopify cart permalink: /cart/variantId:qty,variantId:qty
  const items = cart.map(i => `${i.variantId}:${i.qty}`).join(',');
  window.location.href = `https://${STORE}/cart/${items}`;
}

/* ---- Toast ---- */
function showToast(msg) {
  let toast = document.getElementById('cartToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cartToast';
    toast.className = 'cart-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> ${msg}`;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ---- Categorie kiezen (tabs + categoriekaarten) ---- */
function setCategory(filter, scroll) {
  activeFilter = filter;
  document.querySelectorAll('.ftab').forEach(t => {
    const on = t.dataset.filter === filter;
    t.classList.toggle('on', on);
    t.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  document.querySelectorAll('.cat-card').forEach(c => {
    const on = c.dataset.filter === filter;
    c.classList.toggle('on', on);
    c.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  refreshColorOptions();
  applyFilter();
  if (scroll) {
    const bar = document.querySelector('.filter-bar');
    if (bar) window.scrollTo({ top: bar.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
  }
}

function setupCategoryCards() {
  document.querySelectorAll('.cat-card').forEach(card => {
    const coll  = card.dataset.filter;
    const items = allProducts.filter(p => p.collection === coll);
    const withImg = items.filter(p => p.images?.[0]?.url);
    const pic = withImg.find(p => p.images[0].url.startsWith('assets/')) || withImg[0];
    const imgUrl = pic ? pic.images[0].url : (coll === 'parket' ? 'assets/photo/gerenoveerde-trap-eiken.jpg' : '');
    if (imgUrl) card.querySelector('.cat-img').style.backgroundImage = `url("${imgUrl}")`;
    card.querySelector('.cat-count').textContent = `${items.length} producten`;
    card.setAttribute('aria-pressed', 'false');
    card.addEventListener('click', () => setCategory(activeFilter === coll ? 'all' : coll, true));
  });
}

/* ---- Kleurfilter (meerdere kleuren, met bolletje) ---- */
const COLOR_FALLBACK = {
  'eiken': '#c9a36b', 'naturel': '#d9c3a0', 'licht': '#e6dccb', 'wit': '#f4f1ea',
  'bruin': '#7a5a3f', 'grijze eiken': '#888070', 'donker': '#3f3a35', 'zwart': '#26231f',
  'grijs': '#9a9893', 'warm eiken': '#b08060'
};
function colorHex(name) {
  const p = allProducts.find(x => x.specs?.kleur === name && x.specs?.kleurHex);
  return p ? p.specs.kleurHex : (COLOR_FALLBACK[name.toLowerCase()] || '#cfc7b8');
}

let refreshColorOptions = () => {};
function setupColorFilter() {
  const btn   = document.getElementById('colorBtn');
  const panel = document.getElementById('colorPanel');
  const label = document.getElementById('colorBtnLabel');
  if (!btn || !panel) return;

  const build = () => {
    const counts = {};
    allProducts.forEach(p => {
      const k = p.specs?.kleur;
      if (k && (activeFilter === 'all' || p.collection === activeFilter)) counts[k] = (counts[k] || 0) + 1;
    });
    [...colorFilter].forEach(c => { if (!counts[c]) colorFilter.delete(c); });
    const colors = Object.keys(counts).sort((a, b) => a.localeCompare(b, 'nl'));
    panel.innerHTML = (colors.length ? colors.map(c => `
    <label class="color-opt">
      <input type="checkbox" value="${c}"${colorFilter.has(c) ? ' checked' : ''}>
      <span class="color-dot" style="background:${colorHex(c)}"></span>
      <span class="color-name">${c}</span>
      <span class="color-n">${counts[c]}</span>
    </label>`).join('') : '<p class="color-none">Geen kleurinformatie in deze categorie</p>') + `<button type="button" class="color-clear" id="colorClear">Wis kleurkeuze</button>`;
    updateLabel();
  };
  refreshColorOptions = build;

  function updateLabel() {
    const n = colorFilter.size;
    label.textContent = n === 0 ? 'Alle kleuren' : n === 1 ? [...colorFilter][0] : `${n} kleuren`;
    btn.classList.toggle('active', n > 0);
  }
  const close = () => { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
  const open  = () => {
    const r = btn.getBoundingClientRect();
    panel.style.top  = (r.bottom + 6) + 'px';
    panel.style.left = Math.max(8, Math.min(r.left, window.innerWidth - 268)) + 'px';
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
  };

  btn.addEventListener('click', e => { e.stopPropagation(); panel.hidden ? open() : close(); });
  panel.addEventListener('click', e => e.stopPropagation());
  panel.addEventListener('change', e => {
    const cb = e.target;
    if (cb.type !== 'checkbox') return;
    cb.checked ? colorFilter.add(cb.value) : colorFilter.delete(cb.value);
    updateLabel();
    applyFilter();
  });
  panel.addEventListener('click', e => {
    if (e.target.id !== 'colorClear') return;
    colorFilter.clear();
    panel.querySelectorAll('input').forEach(i => { i.checked = false; });
    updateLabel();
    applyFilter();
  });
  build();
  document.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  let lastW = window.innerWidth;
  window.addEventListener('resize', () => { if (window.innerWidth !== lastW) { lastW = window.innerWidth; close(); } });
}

/* ---- Sorteer-dropdown (zelfde stijl als kleurfilter) ---- */
function setupSortDropdown() {
  const btn   = document.getElementById('sortBtn');
  const panel = document.getElementById('sortPanel');
  const label = document.getElementById('sortBtnLabel');
  if (!btn || !panel) return;
  const close = () => { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
  btn.addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('colorPanel')?.setAttribute('hidden', '');
    if (!panel.hidden) { close(); return; }
    const r = btn.getBoundingClientRect();
    panel.style.top = (r.bottom + 6) + 'px';
    panel.style.left = Math.max(8, Math.min(r.right - 200, window.innerWidth - 208)) + 'px';
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
  });
  panel.addEventListener('click', e => {
    const opt = e.target.closest('.sort-opt');
    if (!opt) return;
    sortOrder = opt.dataset.sort;
    panel.querySelectorAll('.sort-opt').forEach(o => {
      const on = o === opt;
      o.classList.toggle('on', on);
      o.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    label.textContent = opt.textContent;
    close();
    applyFilter();
  });
  document.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  let lastW = window.innerWidth;
  window.addEventListener('resize', () => { if (window.innerWidth !== lastW) { lastW = window.innerWidth; close(); } });
}

/* ---- Init ---- */
async function init() {
  if (!document.getElementById('productGrid')) { updateCartUI(); return; }
  renderSkeletons(9);
  updateCartUI();

  try {
    const res = await fetch('products.json');
    allProducts = await res.json();
  } catch (err) {
    document.getElementById('productGrid').innerHTML = `
      <div class="shop-empty" style="grid-column:1/-1">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p>Producten konden niet worden geladen. Ververs de pagina.</p>
      </div>`;
    document.getElementById('productCount').textContent = '';
    return;
  }

  setupColorFilter();
  setupCategoryCards();

  applyFilter();

  /* Zoeken */
  document.getElementById('searchInput')?.addEventListener('input', e => {
    searchQuery = e.target.value.trim();
    applyFilter();
  });

  /* Filter tabs */
  document.querySelectorAll('.ftab').forEach(tab => {
    tab.addEventListener('click', () => setCategory(tab.dataset.filter));
  });

  /* Sort */
  setupSortDropdown();

  /* Cart */
  document.getElementById('cartBtn')?.addEventListener('click', openCart);
  document.getElementById('cartClose')?.addEventListener('click', closeCart);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
  document.getElementById('checkoutBtn')?.addEventListener('click', checkout);

  /* Modal */
  document.getElementById('modalOverlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeCart(); }
  });
}

document.addEventListener('DOMContentLoaded', init);
