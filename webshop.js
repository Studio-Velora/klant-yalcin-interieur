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
let colorFilter  = '';

/* ---- Render product card ---- */
function renderCard(product) {
  const img   = product.images[0];
  const price = formatPrice(product.price);

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
      <button class="prod-quick-add" data-add="${product.id}" aria-label="Voeg ${product.title} toe aan winkelwagen">
        + In winkelwagen
      </button>
    </div>
    <div class="prod-info">
      ${product.collectionLabel ? `<div class="prod-coll">${product.collectionLabel}</div>` : ''}
      <div class="prod-name">${product.title}</div>
      <div class="prod-price">${price} <span class="prod-price-note">incl. btw</span></div>
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

  if (colorFilter) {
    products = products.filter(p => (p.specs?.kleur || '') === colorFilter);
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

function addToCart(product) {
  if (!product.variantId) return;
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
  showToast(`${product.title} toegevoegd`);
}

function removeFromCart(variantId) {
  cart = cart.filter(i => i.variantId !== variantId);
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

  /* Kleurfilter vullen uit beschikbare producten */
  const colorSel = document.getElementById('colorSelect');
  if (colorSel) {
    const colors = [...new Set(allProducts.map(p => p.specs?.kleur).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'nl'));
    colors.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c;
      colorSel.appendChild(opt);
    });
  }

  applyFilter();

  /* Zoeken */
  document.getElementById('searchInput')?.addEventListener('input', e => {
    searchQuery = e.target.value.trim();
    applyFilter();
  });

  /* Kleurfilter */
  colorSel?.addEventListener('change', e => {
    colorFilter = e.target.value;
    applyFilter();
  });

  /* Filter tabs */
  document.querySelectorAll('.ftab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ftab').forEach(t => {
        t.classList.remove('on');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('on');
      tab.setAttribute('aria-selected', 'true');
      activeFilter = tab.dataset.filter;
      applyFilter();
    });
  });

  /* Sort */
  document.getElementById('sortSelect')?.addEventListener('change', e => {
    sortOrder = e.target.value;
    applyFilter();
  });

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
