// Global frontend script: navbar burger, contact form, and store (products + cart)
document.addEventListener('DOMContentLoaded', () => {
  // Navbar burger (mobile)
  const burger = document.querySelector('.navbar-burger');
  const menu = document.getElementById(burger?.dataset?.target || 'navMenu');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('is-active');
      menu.classList.toggle('is-active');
    });
  }

  // Contact form handling (simulation)
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('contact-feedback');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (feedback) feedback.className = 'notification is-hidden';
    const name = document.getElementById('contact-name')?.value.trim() || '';
    const email = document.getElementById('contact-email')?.value.trim() || '';
    const message = document.getElementById('contact-message')?.value.trim() || '';
    if (!name || !email || !message) {
      if (feedback) { feedback.className = 'notification is-danger'; feedback.textContent = 'Veuillez remplir tous les champs.'; }
      return;
    }
    const btn = document.getElementById('send-contact');
    btn?.classList.add('is-loading');
    setTimeout(() => {
      btn?.classList.remove('is-loading');
      if (feedback) { feedback.className = 'notification is-success'; feedback.textContent = `Merci ${name}, votre message a été envoyé (simulation).`; }
      form?.reset();
    }, 1000);
  });

  // --- Store / Cart code ---
  // Données de produits (pour prototype). Remplacez par fetch(...) si nécessaire.
  const PRODUCTS = [
    { id: 1, title: "T-shirt Basique", price: 19.99, imgLocal: 'images/legacy-core-baseball-cap-black.jpg', imgFallback: "https://source.unsplash.com/featured/?tshirt" },
    { id: 2, title: "Casquette Stylée", price: 14.50, imgLocal: 'images/legacy-core-baseball-cap-black.jpg', imgFallback: "https://source.unsplash.com/featured/?cap" },
    { id: 3, title: "Sac en Cuir", price: 49.90, imgLocal: 'images/sac-photo-arles-olympus-x-bleu-de-chauffe.jpg', imgFallback: "https://source.unsplash.com/featured/?bag" },
    { id: 4, title: "Baskets Urbaines", price: 79.00, imgLocal: 'images/images (2).jpg', imgFallback: "https://source.unsplash.com/featured/?sneakers" }
  ];

  const selectors = {
    products: document.getElementById('products'),
    cartButton: document.getElementById('cart-button'),
    cartCount: document.getElementById('cart-count'),
    cartModal: document.getElementById('cart-modal'),
    closeCart: document.getElementById('close-cart'),
    cartItems: document.getElementById('cart-items'),
    modalTotal: document.getElementById('modal-total'),
    cartTotalInput: document.getElementById('cart-total'),
    checkoutForm: document.getElementById('checkout-form'),
    placeOrderBtn: document.getElementById('place-order'),
    checkoutMessage: document.getElementById('checkout-message'),
    checkoutFromCartBtn: document.getElementById('checkout-from-cart'),
    nameInput: document.getElementById('name'),
    emailInput: document.getElementById('email'),
    addressInput: document.getElementById('address'),
    paymentSelect: document.getElementById('payment'),
  };

  let cart = loadCart();

  // Rendu des produits
  function renderProducts() {
    if (!selectors.products) return;
    selectors.products.innerHTML = '';
    PRODUCTS.forEach(p => {
      const col = document.createElement('div');
      col.className = 'column is-one-quarter';
      col.innerHTML = `
        <div class="card">
          <div class="card-image">
            <figure class="image is-4by3">
              <img class="product-image" src="${p.imgLocal}" alt="${p.title}" onerror="this.onerror=null;this.src='${p.imgFallback}';">
            </figure>
          </div>
          <div class="card-content">
            <p class="title is-6">${p.title}</p>
            <p class="subtitle is-6">${p.price.toFixed(2)} €</p>
            <div class="content">
              <button class="button is-small is-primary add-to-cart" data-id="${p.id}">Ajouter au panier</button>
            </div>
          </div>
        </div>
      `;
      selectors.products.appendChild(col);
    });

    // Attacher handlers
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        addToCart(id);
      });
    });
  }

  // Cart utils
  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem('mini_store_cart')) || {};
    } catch (e) {
      return {};
    }
  }
  function saveCart() {
    localStorage.setItem('mini_store_cart', JSON.stringify(cart));
    updateCartCount();
  }

  function addToCart(productId, qty = 1) {
    cart[productId] = (cart[productId] || 0) + qty;
    saveCart();
    showToast('Produit ajouté au panier');
    renderCartModal();
  }

  function removeFromCart(productId) {
    delete cart[productId];
    saveCart();
    renderCartModal();
  }

  function setQuantity(productId, qty) {
    if (qty <= 0) {
      removeFromCart(productId);
    } else {
      cart[productId] = qty;
      saveCart();
    }
    renderCartModal();
  }

  function getCartItemsDetailed() {
    return Object.keys(cart).map(id => {
      const product = PRODUCTS.find(p => p.id === Number(id));
      const qty = cart[id];
      return { ...product, qty, subtotal: product.price * qty };
    });
  }

  function cartTotal() {
    return getCartItemsDetailed().reduce((s, it) => s + it.subtotal, 0);
  }

  function updateCartCount() {
    const count = Object.values(cart).reduce((s, n) => s + n, 0);
    if (selectors.cartCount) selectors.cartCount.textContent = String(count);
    if (selectors.cartCount) selectors.cartCount.style.display = count ? 'inline-block' : 'none';
    if (selectors.cartTotalInput) selectors.cartTotalInput.value = cartTotal().toFixed(2) + ' €';
  }

  // Modal & rendering
  function renderCartModal() {
    const items = getCartItemsDetailed();
    if (!selectors.cartItems) return;
    if (!items.length) {
      selectors.cartItems.innerHTML = '<p>Votre panier est vide.</p>';
    } else {
      selectors.cartItems.innerHTML = '';
      items.forEach(it => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
          <div class="columns is-mobile is-vcentered">
            <div class="column is-2">
              <figure class="image is-48x48">
                <img src="${it.img}" alt="${it.title}">
              </figure>
            </div>
            <div class="column">
              <strong>${it.title}</strong><br>
              <small>${it.price.toFixed(2)} €</small>
            </div>
            <div class="column is-narrow">
              <div class="field has-addons">
                <p class="control">
                  <button class="button is-small decrement" data-id="${it.id}">-</button>
                </p>
                <p class="control">
                  <input class="input is-small qty-input" data-id="${it.id}" type="number" min="1" value="${it.qty}" style="width:60px;">
                </p>
                <p class="control">
                  <button class="button is-small increment" data-id="${it.id}">+</button>
                </p>
              </div>
            </div>
            <div class="column is-narrow">
              <div>${it.subtotal.toFixed(2)} €</div>
              <button class="button is-small is-danger mt-2 remove-item" data-id="${it.id}">Supprimer</button>
            </div>
          </div>
        `;
        selectors.cartItems.appendChild(div);
      });

      // Attacher events
      document.querySelectorAll('.remove-item').forEach(btn => btn.addEventListener('click', () => removeFromCart(Number(btn.dataset.id))));
      document.querySelectorAll('.increment').forEach(btn => btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        setQuantity(id, cart[id] + 1);
      }));
      document.querySelectorAll('.decrement').forEach(btn => btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        setQuantity(id, cart[id] - 1);
      }));
      document.querySelectorAll('.qty-input').forEach(input => input.addEventListener('change', () => {
        const id = Number(input.dataset.id);
        const v = Number(input.value) || 1;
        setQuantity(id, v);
      }));
    }

    if (selectors.modalTotal) selectors.modalTotal.textContent = cartTotal().toFixed(2) + ' €';
    updateCartCount();
  }

  // Simple toast
  function showToast(msg) {
    const el = document.createElement('div');
    el.className = 'notification is-info';
    el.style.position = 'fixed';
    el.style.right = '1rem';
    el.style.bottom = '1rem';
    el.style.zIndex = 1000;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }

  // Event handlers
  selectors.cartButton?.addEventListener('click', () => {
    selectors.cartModal?.classList.add('is-active');
    renderCartModal();
  });
  selectors.closeCart?.addEventListener('click', () => selectors.cartModal?.classList.remove('is-active'));
  document.querySelectorAll('.modal-background').forEach(bg => bg.addEventListener('click', () => selectors.cartModal?.classList.remove('is-active')));
  selectors.checkoutFromCartBtn?.addEventListener('click', () => {
    selectors.cartModal?.classList.remove('is-active');
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  });

  // Checkout form handling (simulation)
  selectors.checkoutForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    processCheckout();
  });
  selectors.placeOrderBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    processCheckout();
  });

  function processCheckout() {
    if (!selectors.checkoutMessage) return;
    selectors.checkoutMessage.classList.add('is-hidden');
    // Simple validation
    if (!selectors.nameInput.value.trim() || !selectors.emailInput.value.trim() || !selectors.addressInput.value.trim()) {
      selectors.checkoutMessage.className = 'notification is-danger';
      selectors.checkoutMessage.textContent = 'Veuillez remplir tous les champs du formulaire.';
      selectors.checkoutMessage.classList.remove('is-hidden');
      return;
    }
    const total = cartTotal();
    if (total <= 0) {
      selectors.checkoutMessage.className = 'notification is-warning';
      selectors.checkoutMessage.textContent = 'Votre panier est vide.';
      selectors.checkoutMessage.classList.remove('is-hidden');
      return;
    }

    // Simuler envoi de commande
    selectors.placeOrderBtn?.classList.add('is-loading');
    setTimeout(() => {
      selectors.placeOrderBtn?.classList.remove('is-loading');
      selectors.checkoutMessage.className = 'notification is-success';
      selectors.checkoutMessage.textContent = `Merci ${selectors.nameInput.value.trim()} — commande reçue. Total: ${total.toFixed(2)} €. (Simulation)`;
      selectors.checkoutMessage.classList.remove('is-hidden');

      // Réinitialiser panier
      cart = {};
      saveCart();
      renderCartModal();
      // facultatif: vider le formulaire
      selectors.checkoutForm?.reset();
      if (selectors.cartTotalInput) selectors.cartTotalInput.value = '0 €';
    }, 1000);
  }

  // Initialisation
  renderProducts();
  updateCartCount();
  renderCartModal();
});