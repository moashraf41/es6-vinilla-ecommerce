/* --------------- Navigation Functions --------------- */

// Toggle mobile menu visibility
function toggleMobileMenu() {
  const navLinks = document.getElementById("navbarNav");
  navLinks.classList.toggle("show");
}

/* --------------- Cart Operations --------------- */

// Fetch cart data from API
async function fetchCartData(userId) {
  try {
    const response = await fetch(
      `http://localhost:3000/cartS?userId=${userId}`
    );
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return [];
  }
}

// Calculate total price of cart items
function calculateCartTotal(items) {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

// Handle quantity updates for cart items
async function updateItemQuantity(cartId, productId, operation, currentItems) {
  const updatedItems = currentItems
    .map((item) => {
      if (item.productId === productId) {
        const newQuantity =
          operation === "increment"
            ? item.quantity + 1
            : Math.max(item.quantity - 1, 0);
        return { ...item, quantity: newQuantity };
      }
      return item;
    })
    .filter((item) => item.quantity > 0);

  await updateCartOnServer(cartId, updatedItems);
  return updatedItems;
}

// Remove item from cart
async function removeCartItem(cartId, productId, currentItems) {
  const filteredItems = currentItems.filter(
    (item) => item.productId !== productId
  );

  await updateCartOnServer(cartId, filteredItems);
  return filteredItems;
}

// Update cart data on server
async function updateCartOnServer(cartId, items) {
  try {
    await fetch(`http://localhost:3000/cartS/${cartId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    location.reload(); // Refresh to reflect changes
  } catch (error) {
    console.error("Failed to update cart:", error);
  }
}

/* --------------- Cart Rendering --------------- */

// Create DOM element for individual cart item
function createCartItemElement(product, cartId) {
  const itemElement = document.createElement("div");
  itemElement.className =
    "cart-item p-3 mb-4 bg-white d-flex flex-column flex-sm-row align-items-center justify-content-between";

  itemElement.innerHTML = `
    <div class="d-flex align-items-center gap-3">
      <img src="${product.image}" class="rounded" style="width: 80px; height: 80px; object-fit: cover" />
      <div>
        <h5 class="mb-1 text-dark">${product.name}</h5>
        <p class="mb-0 text-muted">$${product.price}</p>
      </div>
    </div>
    <div class="d-flex align-items-center gap-2">
      <button data-productid="${product.productId}" class="btn btn-outline-dark quantity-btn">-</button>
      <span class="mx-2 fw-bold text-dark">${product.quantity}</span>
      <button data-productid="${product.productId}" class="btn btn-outline-dark quantity-btn">+</button>
      <button data-productid="${product.productId}" class="btn btn-outline-danger ms-3 remove-btn">Remove</button>
    </div>
  `;

  return itemElement;
}

// Handle cart item UI interactions
function setupCartItemInteractions(itemElement, product, cartId, currentItems) {
  const quantityBtns = itemElement.querySelectorAll(".quantity-btn");
  const removeBtn = itemElement.querySelector(".remove-btn");

  quantityBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const operation = btn.textContent === "+" ? "increment" : "decrement";
      const updatedItems = await updateItemQuantity(
        cartId,
        product.productId,
        operation,
        currentItems
      );
      renderCartItems(updatedItems, calculateCartTotal(updatedItems), cartId);
    });
  });

  removeBtn.addEventListener("click", async () => {
    const updatedItems = await removeCartItem(
      cartId,
      product.productId,
      currentItems
    );
    renderCartItems(updatedItems, calculateCartTotal(updatedItems), cartId);
  });
}

// Main function to render cart contents
function renderCartItems(products, total, cartId) {
  const cartItemsContainer = document.getElementById("cart-items");
  const emptyCart = document.getElementById("empty-cart");
  const summarySection = document.querySelector(".summary");

  cartItemsContainer.innerHTML = "";

  if (products.length === 0) {
    emptyCart.classList.remove("d-none");

    document.querySelector(".heading").textContent = "Your Cart is Empty 🛒";
    summarySection.classList.add("d-none");
    updateSummary(0);
    return;
  }

  emptyCart.classList.add("d-none");
  summarySection.classList.remove("d-none");

  products.forEach((product) => {
    const itemElement = createCartItemElement(product, cartId);
    setupCartItemInteractions(itemElement, product, cartId, products);
    cartItemsContainer.appendChild(itemElement);
  });

  updateSummary(total);
}

// Update summary section calculations
function updateSummary(total) {
  const taxRate = 0.14;
  const tax = total * taxRate;
  const elements = {
    subtotal: document.getElementById("subtotal-amount"),
    tax: document.getElementById("tax-amount"),
    total: document.getElementById("total-amount"),
  };

  elements.subtotal.textContent = `$${total.toFixed(2)}`;
  elements.tax.textContent = `$${tax.toFixed(2)}`;
  elements.total.textContent = `$${(total + tax).toFixed(2)}`;
}

/* --------------- Event Listeners --------------- */

function setupEventListeners() {
  // Mobile menu toggle
  document.querySelector(".burger").addEventListener("click", toggleMobileMenu);
}

/* --------------- Initialization --------------- */

async function initializeCart() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  const cartData = await fetchCartData(user.id);
  if (cartData.length === 0) return;

  const cartId = cartData[0].id;
  const items = cartData[0].items;
  const total = calculateCartTotal(items);

  renderCartItems(items, total, cartId);
}

function init() {
  setupEventListeners();
  initializeCart();
}

// Start application
init();
