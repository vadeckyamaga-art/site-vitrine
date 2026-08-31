// products.js
// Charge assets/data/products.json et génère les cartes produits
// dans les carrousels "En promotion" et "Meilleures ventes".
// Expose window.PRODUCTS (liste chargée) pour que le panier (cart.js) puisse
// retrouver un produit par son id.

function formatFCFA(n) {
  return n.toLocaleString('fr-FR').replace(/,/g, ' ') + ' FCFA';
}

function renderProductCard(p) {
  const priceHtml = p.oldPrice
    ? `<span class="old">${formatFCFA(p.oldPrice)}</span><span class="new">${formatFCFA(p.price)}</span>`
    : `<span class="new">${formatFCFA(p.price)}</span>`;

  return `
    <div class="product-card">
      <img src="${p.image}" alt="${p.name}">
      <div class="info">
        <span class="tag">${p.brand.toUpperCase()}</span>
        <h4>${p.name}</h4>
        <div class="price">${priceHtml}</div>
        <button class="btn-add-cart" data-product-id="${p.id}">Ajouter au panier</button>
      </div>
    </div>
  `;
}

async function loadProducts() {
  const promoTrack = document.getElementById('track-promo');
  const bestTrack = document.getElementById('track-best');

  try {
    const res = await fetch('../asset/data/products.json');
    const data = await res.json();
    const products = data.products;

    window.PRODUCTS = products; // rendu accessible pour cart.js

    const promoItems = products.filter(p => p.promotion);
    const bestItems = products.filter(p => p.bestseller);

    promoTrack.innerHTML = promoItems.map(renderProductCard).join('');
    bestTrack.innerHTML = bestItems.map(renderProductCard).join('');

    document.dispatchEvent(new Event('productsLoaded'));
  } catch (err) {
    console.error('Erreur de chargement des produits :', err);
    promoTrack.innerHTML = '<p style="padding:1rem;color:var(--ink-soft);">Impossible de charger les produits pour le moment.</p>';
    bestTrack.innerHTML = '';
  }
}

document.addEventListener('includesLoaded', loadProducts);
