/* --------------- Mobile Menu Toggle --------------- */
function initializeMobileMenu() {
  const burger = document.querySelector(".burger");
  const navLinks = document.getElementById("navbarNav");

  burger.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
}

/* --------------- Validation Configuration --------------- */
const validationRules = {
  firstName: /^[\u0600-\u06FFa-zA-Z ]{2,30}$/,
  lastName: /^[\u0600-\u06FFa-zA-Z ]{2,30}$/,
  email: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  address: /^.{10,}$/,
  city: /^[\u0600-\u06FFa-zA-Z ]{2,30}$/,
  zipCode: /^\d{4,6}$/,
  phone: /^01[0-2,5]{1}[0-9]{8}$/,
};

/* --------------- Form Validation Functions --------------- */

// Validate single input field
function validateInput(input) {
  const field = input.name;
  const regex = validationRules[field];

  if (!regex) return true;

  const isValid = regex.test(input.value.trim());
  input.classList.toggle("is-invalid", !isValid);
  input.classList.toggle("is-valid", isValid);
  return isValid;
}

// Setup live input validation
function setupLiveValidation(formInputs) {
  formInputs.forEach((input) => {
    ["input", "blur"].forEach((event) => {
      input.addEventListener(event, () => validateInput(input));
    });
  });
}

// Validate entire form
function validateForm(formInputs) {
  return Array.from(formInputs).every((input) => validateInput(input));
}

/* --------------- Cart Operations --------------- */

// Clear user's cart from server
async function clearUserCart(userId) {
  try {
    const cartRes = await fetch(`http://localhost:3000/cartS?userId=${userId}`);
    const cartData = await cartRes.json();

    if (!cartData.length) return { success: false, message: "Cart not found" };

    const cartId = cartData[0].id;
    const response = await fetch(`http://localhost:3000/cartS/${cartId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [] }),
    });

    if (!response.ok) throw new Error("Failed to clear cart");

    return { success: true };
  } catch (error) {
    console.error("Cart clearance error:", error);
    return { success: false, message: error.message };
  }
}

/* --------------- Order Summary Functions --------------- */

// Fetch user's cart data from server
async function fetchCartSummary(userId) {
  try {
    const response = await fetch(
      `http://localhost:3000/cartS?userId=${userId}`
    );
    const cartData = await response.json();
    return cartData[0]?.items || [];
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return [];
  }
}

// Create DOM element for order summary item
function createOrderItemElement(product) {
  const itemElement = document.createElement("div");
  itemElement.className = "order-item mb-3 p-2 border-bottom text-dark";

  itemElement.innerHTML = `
    <div class="d-flex justify-content-between">
      <div>
        <h6 class="mb-1">${product.name}</h6>
        <small class="text-muted">Quantity: ${product.quantity}</small>
      </div>
      <div class="text-end">
        <p class="mb-0">$${(product.price * product.quantity).toFixed(2)}</p>
      </div>
    </div>
  `;

  return itemElement;
}

// Render order summary items
function renderOrderSummary(products, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (products.length === 0) {
    window.location.href = "cart.html";
    container.innerHTML = "<p class='text-dark'>Your cart is empty 🛒</p>";
    return 0;
  }

  const total = products.reduce((acc, product) => {
    container.appendChild(createOrderItemElement(product));
    return acc + product.price * product.quantity;
  }, 0);

  return total;
}

// Update payment summary calculations
function updatePaymentSummary(total) {
  const shippingCost = 5.0;
  const taxRate = 0.14;

  const elements = {
    subtotal: document.getElementById("checkout-subtotal"),
    shipping: document.getElementById("shipping-amount"),
    tax: document.getElementById("tax-amount"),
    total: document.getElementById("checkout-total"),
  };

  const tax = total * taxRate;
  const finalTotal = total + tax + shippingCost;

  elements.subtotal.textContent = `$${total.toFixed(2)}`;
  elements.shipping.textContent = `$${shippingCost.toFixed(2)}`;
  elements.tax.textContent = `$${tax.toFixed(2)}`;
  elements.total.textContent = `$${finalTotal.toFixed(2)}`;
}

/* --------------- Event Handlers --------------- */

// Handle order placement
async function handleOrderPlacement(user, formInputs) {
  const isValid = validateForm(formInputs);

  if (!isValid) {
    alert("Please fill in all the required fields.");
    return;
  }

  const result = await clearUserCart(user.id);

  if (result.success) {
    window.location.href = "order-completion.html";
  } else {
    alert(result.message || "Failed to clear cart.");
  }
}

/* --------------- Initialization --------------- */

async function initializeCheckoutPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  // Initialize components
  initializeMobileMenu();

  const formInputs = document.querySelectorAll(".checkout-form input");
  const placeOrderBtn = document.querySelector(".place-order-btn");

  // Setup validations
  setupLiveValidation(formInputs);

  // Setup order button
  placeOrderBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    await handleOrderPlacement(user, formInputs);
  });

  // Load and display cart summary
  const cartItems = await fetchCartSummary(user.id);
  const total = renderOrderSummary(cartItems, "order-summary");
  updatePaymentSummary(total);
}

// Start the application
document.addEventListener("DOMContentLoaded", initializeCheckoutPage);
