/* --------------- Back to Top Button --------------- */
document.addEventListener("DOMContentLoaded", function () {
  const backToTopBtn = document.getElementById("backToTopBtn");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 200) {
      backToTopBtn.classList.add("show");
    } else {
      backToTopBtn.classList.remove("show");
    }
  });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
});

/* --------------- Authentication Functions --------------- */

// Check if user is logged in, redirect if not
function checkAuth() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("Please log in to access this page.");
    window.location.href = "index.html";
  }
  return user;
}

// Handle logout functionality
function handleLogout() {
  localStorage.removeItem("user");
  window.location.href = "register.html";
}

/* --------------- Cart Functions --------------- */

// Fetch user's cart data from API
async function fetchUserCart(userId) {
  try {
    const response = await fetch(
      `http://localhost:3000/cartS?userId=${userId}`
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching cart:", error);
    return [];
  }
}

// Update cart count display in navigation
function updateCartCount(count) {
  const cartNav = document.querySelector(".cartNav");
  cartNav.innerText = `Cart (${count})`;
}

// Main function to load and display cart count
async function loadCartCount(user) {
  const cartData = await fetchUserCart(user.id);
  const totalItems = cartData.reduce(
    (acc, cart) => (cart.userId === user.id ? acc + cart.items.length : acc),
    0
  );
  updateCartCount(totalItems);
}

/* --------------- Dark Mode Functions --------------- */

// Toggle dark mode and save preference
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");

  localStorage.setItem("darkMode", isDark ? "on" : "off");
  applyDarkModeSettings(isDark);
}

// Apply visual changes for dark mode
function applyDarkModeSettings(isDark) {
  const toggleButton = document.getElementById("toggleDarkMode");
  const logo = document.querySelector(".navbar-brand");

  toggleButton.textContent = isDark ? "☀️" : "🌙";
  logo.innerHTML = isDark
    ? `<img src="./assets/images/white-download.svg" alt="Logo" />`
    : `<img src="./assets/images/download.svg" alt="Logo" />`;
}

// Initialize dark mode from saved preferences
function initializeDarkMode() {
  const savedMode = localStorage.getItem("darkMode");
  const isDark = savedMode === "on";

  if (isDark) {
    document.body.classList.add("dark-mode");
  }
  applyDarkModeSettings(isDark);
}

/* --------------- Event Listeners Setup --------------- */

function setupEventListeners() {
  // Logout button
  document.querySelector(".logout").addEventListener("click", (e) => {
    e.preventDefault();
    handleLogout();
  });

  // Dark mode toggle
  document
    .getElementById("toggleDarkMode")
    .addEventListener("click", toggleDarkMode);
}

/* --------------- Initialize Application --------------- */

function init() {
  const user = checkAuth();
  setupEventListeners();
  loadCartCount(user);
  initializeDarkMode();
}

init();
