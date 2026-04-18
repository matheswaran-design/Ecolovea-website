const DELIVERY_FEE = 5;

function getCart() {
  return JSON.parse(localStorage.getItem("ecoloveaCart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("ecoloveaCart", JSON.stringify(cart));
  updateCartCount();
}

function getAppliedVoucher() {
  return JSON.parse(localStorage.getItem("ecoloveaAppliedVoucher")) || null;
}

function setAppliedVoucher(voucher) {
  localStorage.setItem("ecoloveaAppliedVoucher", JSON.stringify(voucher));
}

function clearAppliedVoucher() {
  localStorage.removeItem("ecoloveaAppliedVoucher");
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

function calculateDiscount(subtotal) {
  const voucher = getAppliedVoucher();
  if (!voucher) return 0;

  return subtotal * (voucher.discount / 100);
}

function applyVoucher() {
  const input = document.getElementById("voucherCode");
  const message = document.getElementById("voucherMessage");

  if (!input || !message) return;

  const code = input.value.trim().toUpperCase();
  const unlocked = JSON.parse(localStorage.getItem("ecoloveaVouchers")) || [];

  const validVoucherMap = {
    "ECO5A1": 1,
    "ECO5A2": 2,
    "ECO5A3": 3,
    "ECO5A4": 4,
    "ECO5A5": 5
  };

  if (validVoucherMap[code] && unlocked.includes(validVoucherMap[code])) {
    setAppliedVoucher({ code, discount: 5 });

    message.textContent = `${code} applied successfully. 5% discount added.`;
    message.style.color = "green";

    renderCart();
    renderCheckoutSummary();
    showToast("Voucher applied");
  } else {
    message.textContent = "Invalid or locked voucher code.";
    message.style.color = "crimson";
  }
}

function renderCart() {
  const cartItemsEl = document.getElementById("cartItems");
  const emptyCartEl = document.getElementById("emptyCart");
  const subtotalEl = document.getElementById("subtotal");
  const totalPriceEl = document.getElementById("totalPrice");
  const deliveryEl = document.getElementById("deliveryFee");
  const discountEl = document.getElementById("discountAmount");

  if (!cartItemsEl) return;

  const cart = getCart();
  cartItemsEl.innerHTML = "";

  if (cart.length === 0) {
    emptyCartEl?.classList.remove("hidden");

    if (subtotalEl) subtotalEl.textContent = "RM 0.00";
    if (discountEl) discountEl.textContent = "- RM 0.00";
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

  const discount = calculateDiscount(subtotal);
  const total = subtotal - discount + DELIVERY_FEE;

  if (subtotalEl) subtotalEl.textContent = `RM ${subtotal.toFixed(2)}`;
  if (discountEl) discountEl.textContent = `- RM ${discount.toFixed(2)}`;
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
  clearAppliedVoucher();

  updateCartCount();
  renderCart();
  renderCheckoutSummary();
  showToast("Cart cleared");
}

function renderCheckoutSummary() {
  const itemsEl = document.getElementById("checkoutItems");
  const subtotalEl = document.getElementById("checkoutSubtotal");
  const totalEl = document.getElementById("checkoutTotal");
  const discountEl = document.getElementById("checkoutDiscount");

  if (!itemsEl) return;

  const cart = getCart();
  itemsEl.innerHTML = "";

  let subtotal = 0;

  if (cart.length === 0) {
    itemsEl.innerHTML = `<p class="small-text">No items in cart.</p>`;

    if (subtotalEl) subtotalEl.textContent = "RM 0.00";
    if (discountEl) discountEl.textContent = "- RM 0.00";
    if (totalEl) totalEl.textContent = "RM 5.00";

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

  const discount = calculateDiscount(subtotal);
  const total = subtotal - discount + DELIVERY_FEE;

  if (subtotalEl) subtotalEl.textContent = `RM ${subtotal.toFixed(2)}`;
  if (discountEl) discountEl.textContent = `- RM ${discount.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `RM ${total.toFixed(2)}`;
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

  if (modal) {
    modal.classList.remove("hidden");
  }
}

function closeModal() {
  const modal = document.getElementById("checkoutModal");

  if (modal) {
    modal.classList.add("hidden");
  }
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

  event.target.reset();
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

function handleContactForm(event) {
  event.preventDefault();

  const message = document.getElementById("contactFormMessage");

  if (!message) return;

  message.textContent = "Thank you for contacting Ecolovea. This form is for educational purposes only.";
  message.style.color = "green";

  event.target.reset();
}

function markArticleOpened(articleNumber) {
  let opened = JSON.parse(localStorage.getItem("ecoloveaOpenedArticles")) || [];

  if (!opened.includes(articleNumber)) {
    opened.push(articleNumber);
    localStorage.setItem("ecoloveaOpenedArticles", JSON.stringify(opened));
  }

  setTimeout(() => {
    renderVoucherUnlockButtons();
  }, 300);
}

function unlockVoucherAfterView(articleNumber) {
  let opened = JSON.parse(localStorage.getItem("ecoloveaOpenedArticles")) || [];

  if (!opened.includes(articleNumber)) {
    showToast("Please view the article first");
    return;
  }

  let vouchers = JSON.parse(localStorage.getItem("ecoloveaVouchers")) || [];

  if (!vouchers.includes(articleNumber)) {
    vouchers.push(articleNumber);
    localStorage.setItem("ecoloveaVouchers", JSON.stringify(vouchers));
    showToast(`Voucher ${articleNumber} unlocked`);
  }

  renderVouchers();
  renderVoucherUnlockButtons();
}

function renderVoucherUnlockButtons() {
  const opened = JSON.parse(localStorage.getItem("ecoloveaOpenedArticles")) || [];
  const vouchers = JSON.parse(localStorage.getItem("ecoloveaVouchers")) || [];

  for (let i = 1; i <= 5; i++) {
    const btn = document.getElementById(`unlockBtn${i}`);

    if (!btn) continue;

    if (opened.includes(i) && !vouchers.includes(i)) {
      btn.classList.remove("hidden");
    } else {
      btn.classList.add("hidden");
    }
  }
}

function renderVouchers() {
  const vouchers = JSON.parse(localStorage.getItem("ecoloveaVouchers")) || [];
  const countEl = document.getElementById("voucherCount");

  if (countEl) {
    countEl.textContent = vouchers.length;
  }

  const codeMap = {
    1: "ECO5A1",
    2: "ECO5A2",
    3: "ECO5A3",
    4: "ECO5A4",
    5: "ECO5A5"
  };

  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById(`voucher${i}`);
    const box = document.getElementById(`voucherBox${i}`);

    if (el) {
      if (vouchers.includes(i)) {
        el.textContent = `Voucher ${i}: Unlocked`;
        el.style.color = "green";

        if (box) {
          box.classList.remove("hidden");
          box.innerHTML = `
            <strong>Voucher Code:</strong> ${codeMap[i]} 
            <br>
            <span class="small-note">Use this in cart page for 5% off.</span>
          `;
        }
      } else {
        el.textContent = `Voucher ${i}: Locked`;
        el.style.color = "";

        if (box) {
          box.classList.add("hidden");
        }
      }
    }
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem("ecoloveaTheme");
  const themeBtn = document.getElementById("themeToggle");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }

  if (themeBtn) {
    themeBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";

    themeBtn.addEventListener("click", function () {
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

    if (cartModal) {
      cartModal.classList.add("hidden");
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderCart();
  renderCheckoutSummary();
  renderVouchers();
  renderVoucherUnlockButtons();
  initTheme();
  initMenu();
});
