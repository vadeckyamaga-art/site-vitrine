// cart.js
// Gère le panier : ajout, quantité, suppression, persistance (localStorage)
// et commande finale via WhatsApp.
// Dépend de window.PRODUCTS, rempli par products.js après le chargement de products.json.

document.addEventListener('includesLoaded', function () {
    const CART_KEY = 'oduf_panier';
    const WHATSAPP_NUMBER = '237693301917';

    const cartItemsEl = document.getElementById('cartItems');
    const cartBadge = document.getElementById('cartBadge');
    const cartTotalEl = document.getElementById('cartTotal');
    const btnOrder = document.getElementById('btnOrder');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartToggle = document.getElementById('cartToggle');
    const cartClose = document.getElementById('cartClose');

    // Si un de ces éléments n'existe pas dans le HTML, on arrête proprement
    // au lieu de faire planter le script avec une erreur "null".
    if (!cartItemsEl || !cartBadge || !cartTotalEl || !btnOrder || !cartDrawer || !cartOverlay || !cartToggle || !cartClose) {
        console.error('cart.js : un ou plusieurs éléments du panier sont introuvables dans le HTML. Vérifie les id (cartItems, cartBadge, cartTotal, btnOrder, cartDrawer, cartOverlay, cartToggle, cartClose).');
        return;
    }

    const cartEmptyHtml = '<p class="cart-empty" id="cartEmpty">Votre panier est vide.</p>';

    function formatFCFA(n) {
        return n.toLocaleString('fr-FR').replace(/,/g, ' ') + ' FCFA';
    }

    function loadCart() {
        try {
            return JSON.parse(localStorage.getItem(CART_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveCart() {
        try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
    }

    let cart = loadCart();

    function findProduct(productId) {
        return (window.PRODUCTS || []).find(p => p.id === productId);
    }

    function renderCart() {
        if (cart.length === 0) {
            cartItemsEl.innerHTML = cartEmptyHtml;
            btnOrder.disabled = true;
        } else {
            cartItemsEl.innerHTML = cart.map((item, i) => `
                <div class="cart-line">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cl-info">
                        <span class="cl-brand">${item.brand}</span>
                        <h5>${item.name}</h5>
                        <div class="cl-qty">
                        <button data-action="dec" data-index="${i}">&minus;</button>
                        <span>${item.qty}</span>
                        <button data-action="inc" data-index="${i}">+</button>
                        </div>
                        <button class="cl-remove" data-action="remove" data-index="${i}">Retirer</button>
                    </div>
                    <div class="cl-price">${formatFCFA(item.price * item.qty)}</div>
                </div>
            `).join('');
            btnOrder.disabled = false;
        }

        const totalCount = cart.reduce((sum, i) => sum + i.qty, 0);
        const totalPrice = cart.reduce((sum, i) => sum + i.qty * i.price, 0);
        cartBadge.textContent = totalCount;
        cartTotalEl.textContent = formatFCFA(totalPrice);
        saveCart();
    }

    function addToCart(productId) {
        const product = findProduct(productId);
        if (!product) {
            console.error('Produit introuvable :', productId);
            return;
        }
        const existing = cart.find(i => i.id === productId);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                image: product.image,
                qty: 1
            });
        }
        renderCart();
        openCart();
    }

    function openCart() {
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('open');
    }
    function closeCart() {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('open');
    }

    // Délégation : capte les clics sur "Ajouter au panier" même pour les cartes
    // injectées dynamiquement par products.js après le chargement de la page.
    document.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.btn-add-cart');
        if (addBtn) {
            addToCart(addBtn.dataset.productId);
        }
    });

    cartItemsEl.addEventListener('click', (e) => {
        const target = e.target.closest('button[data-action]');
        if (!target) return;
        const index = parseInt(target.dataset.index, 10);
        const action = target.dataset.action;

        if (action === 'inc') cart[index].qty += 1;
        if (action === 'dec') {
            cart[index].qty -= 1;
            if (cart[index].qty <= 0) cart.splice(index, 1);
        }
        if (action === 'remove') cart.splice(index, 1);

        renderCart();
    });

    cartToggle.addEventListener('click', openCart);
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    btnOrder.addEventListener('click', () => {
        if (cart.length === 0) return;
        let message = 'Bonjour, je souhaite commander :%0A%0A';
        cart.forEach(item => {
            message += `- ${item.name} (${item.brand}) x${item.qty} — ${formatFCFA(item.price * item.qty)}%0A`;
        });
        const total = cart.reduce((sum, i) => sum + i.qty * i.price, 0);
        message += `%0ATotal : ${formatFCFA(total)}`;
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
    });

    renderCart();
});
