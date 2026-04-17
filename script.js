const DELIVERY_FEE = 5;

function getCart() {
  return JSON.parse(localStorage.getItem("ecoloveaCart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("ecoloveaCart", JSON.stringify(cart));
  updateCartCount();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function quickAdd(name, price, image) {
  const cart = getCart();
  const existing = cart.find(item => item.name === name);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price, image, quantity: 1 });
  }

  saveCart(cart);
  showToast(`${name} added to cart`);
}

function changeQty(id, change) {
  const el = document.getElementById(id);
  if (!el) return;
  let qty = parseInt(el.textContent, 10);
  qty += change;
  if (qty < 1) qty = 1;
  el.textContent = qty;
}

function addFromQty(name, price, qtyId, image) {
  const qty = parseInt(document.getElementById(qtyId).textContent, 10);
  const cart = getCart();
  const existing = cart.find(item => item.name === name);

  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ name, price, image, quantity: qty });
  }

  saveCart(cart);
  showToast(`${qty} × ${name} added to cart`);
}

function updateCartCount() {
  const countEls = document.querySelectorAll("#cartCount");
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  countEls.forEach(el => {
    el.textContent = totalQty;
  });
}

function renderCart() {
  const cartItemsEl = document.getElementById("cartItems");
  const emptyCartEl = document.getElementById("emptyCart");
  const subtotalEl = document.getElementById("subtotal");
  const totalPriceEl = document.getElementById("totalPrice");
  const deliveryEl = document.getElementById("deliveryFee");

  if (!cartItemsEl) return;

  const cart = getCart();
  cartItemsEl.innerHTML = "";

  if (cart.length === 0) {
    emptyCartEl?.classList.remove("hidden");
    if (subtotalEl) subtotalEl.textContent = "RM 0.00";
    if (totalPriceEl) totalPriceEl.textContent = "RM 0.00";
    if (deliveryEl) deliveryEl.textContent = "RM 5.00";
    return;
  }

  emptyCartEl?.classList.add("hidden");

  let subtotal = 0;

  cart.forEach((item, index) => {
    subtotal += item.price * item.quantity;

    const itemEl = document.createElement("div");
    itemEl.className = "cart-item";
    itemEl.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h4>${item.name}</h4>
        <p class="small-text">RM ${item.price.toFixed(2)} each</p>
        <div class="cart-controls">
          <button onclick="updateItemQuantity(${index}, -1)">−</button>
          <span>${item.quantity}</span>
          <button onclick="updateItemQuantity(${index}, 1)">+</button>
          <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
        </div>
      </div>
      <strong>RM ${(item.price * item.quantity).toFixed(2)}</strong>
    `;
    cartItemsEl.appendChild(itemEl);
  });

  const total = subtotal + DELIVERY_FEE;
  if (subtotalEl) subtotalEl.textContent = `RM ${subtotal.toFixed(2)}`;
  if (totalPriceEl) totalPriceEl.textContent = `RM ${total.toFixed(2)}`;
}

function updateItemQuantity(index, change) {
  const cart = getCart();
  if (!cart[index]) return;

  cart[index].quantity += change;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  saveCart(cart);
  renderCart();
  renderCheckoutSummary();
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
  renderCheckoutSummary();
  showToast("Item removed");
}

function clearCart() {
  localStorage.removeItem("ecoloveaCart");
  updateCartCount();
  renderCart();
  renderCheckoutSummary();
  showToast("Cart cleared");
}

function renderCheckoutSummary() {
  const itemsEl = document.getElementById("checkoutItems");
  const subtotalEl = document.getElementById("checkoutSubtotal");
  const totalEl = document.getElementById("checkoutTotal");
  if (!itemsEl) return;

  const cart = getCart();
  itemsEl.innerHTML = "";

  let subtotal = 0;

  if (cart.length === 0) {
    itemsEl.innerHTML = `<p class="small-text">No items in cart.</p>`;
    subtotalEl.textContent = "RM 0.00";
    totalEl.textContent = "RM 5.00";
    return;
  }

  cart.forEach(item => {
    subtotal += item.price * item.quantity;
    const row = document.createElement("div");
    row.className = "summary-row";
    row.innerHTML = `
      <span>${item.name} × ${item.quantity}</span>
      <span>RM ${(item.price * item.quantity).toFixed(2)}</span>
    `;
    itemsEl.appendChild(row);
  });

  subtotalEl.textContent = `RM ${subtotal.toFixed(2)}`;
  totalEl.textContent = `RM ${(subtotal + DELIVERY_FEE).toFixed(2)}`;
}

function openCartCheckoutNotice() {
  const modal = document.getElementById("cartCheckoutModal");
  if (modal) {
    modal.classList.remove("hidden");
  }
}

function goToCheckoutFromCart() {
  const modal = document.getElementById("cartCheckoutModal");
  if (modal) {
    modal.classList.add("hidden");
  }
  window.location.href = "checkout.html";
}

function handleFakeCheckout(event) {
  event.preventDefault();
  const modal = document.getElementById("checkoutModal");
  if (modal) modal.classList.remove("hidden");
}

function closeModal() {
  const modal = document.getElementById("checkoutModal");
  if (modal) modal.classList.add("hidden");
}

function handleSignup(event) {
  event.preventDefault();

  const email = document.getElementById("signupEmail")?.value.trim();
  const username = document.getElementById("signupUsername")?.value.trim();
  const password = document.getElementById("signupPassword")?.value.trim();
  const message = document.getElementById("signupMessage");

  if (!message) return;

  if (!email || !username || !password) {
    message.textContent = "Please fill in all sign-up fields.";
    message.style.color = "crimson";
    return;
  }

  const user = { email, username, password };
  localStorage.setItem("ecoloveaUser", JSON.stringify(user));
  message.textContent = "Account created successfully.";
  message.style.color = "green";
}

function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById("loginUsername")?.value.trim();
  const password = document.getElementById("loginPassword")?.value.trim();
  const message = document.getElementById("loginMessage");
  const savedUser = JSON.parse(localStorage.getItem("ecoloveaUser"));

  if (!message) return;

  if (savedUser && username === savedUser.username && password === savedUser.password) {
    message.textContent = "Login successful.";
    message.style.color = "green";
  } else {
    message.textContent = "Invalid username or password.";
    message.style.color = "crimson";
  }
}

function unlockVoucher(articleNumber) {
  let vouchers = JSON.parse(localStorage.getItem("ecoloveaVouchers")) || [];

  if (!vouchers.includes(articleNumber)) {
    vouchers.push(articleNumber);
    localStorage.setItem("ecoloveaVouchers", JSON.stringify(vouchers));
    showToast(`Voucher ${articleNumber} unlocked`);
  }

  renderVouchers();
}

function renderVouchers() {
  const vouchers = JSON.parse(localStorage.getItem("ecoloveaVouchers")) || [];
  const countEl = document.getElementById("voucherCount");

  if (countEl) {
    countEl.textContent = vouchers.length;
  }

  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById(`voucher${i}`);
    if (el) {
      if (vouchers.includes(i)) {
        el.textContent = `Voucher ${i}: Unlocked`;
        el.style.color = "green";
      } else {
        el.textContent = `Voucher ${i}: Locked`;
        el.style.color = "";
      }
    }
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem("ecoloveaTheme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }

  const themeBtn = document.getElementById("themeToggle");
  if (themeBtn) {
    themeBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
    themeBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      const isDark = document.body.classList.contains("dark");
      localStorage.setItem("ecoloveaTheme", isDark ? "dark" : "light");
      themeBtn.textContent = isDark ? "☀️" : "🌙";
    });
  }
}

function initMenu() {
  const menuBtn = document.getElementById("menuToggle");
  const nav = document.getElementById("navMenu");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      nav.classList.toggle("show");
    });
  }
}

window.addEventListener("click", function (e) {
  const checkoutModal = document.getElementById("checkoutModal");
  const cartModal = document.getElementById("cartCheckoutModal");

  if (checkoutModal && !checkoutModal.classList.contains("hidden") && e.target === checkoutModal) {
    closeModal();
  }

  if (cartModal && !cartModal.classList.contains("hidden") && e.target === cartModal) {
    cartModal.classList.add("hidden");
  }
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal();
    const cartModal = document.getElementById("cartCheckoutModal");
    if (cartModal) cartModal.classList.add("hidden");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderCart();
  renderCheckoutSummary();
  renderVouchers();
  initTheme();
  initMenu();
});
