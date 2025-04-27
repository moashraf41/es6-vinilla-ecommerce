/* -------------------- DOM Elements -------------------- */
const formInputs = document.querySelectorAll("input");
const statusMessage = document.querySelector("#successMsg");
const loginButton = document.querySelector("button");

/* -------------------- Validation Config -------------------- */
const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^.{6,}$/,
};

/* -------------------- Validation Functions -------------------- */

// Update input validation state
function validateInput(input) {
  const value = input.value.trim();
  input.classList.remove("is-valid", "is-invalid");

  if (input.id === "inputEmail4") {
    return VALIDATION_RULES.email.test(value);
  }

  if (input.id === "inputPassword4") {
    return VALIDATION_RULES.password.test(value);
  }

  return false;
}

// Real-time input validation handler
function setupLiveValidation() {
  formInputs.forEach((input) => {
    input.addEventListener("input", () => {
      const isValid = validateInput(input);
      input.classList.add(isValid ? "is-valid" : "is-invalid");
    });
  });
}

// Validate entire form
function validateForm() {
  let isValid = true;

  formInputs.forEach((input) => {
    if (!validateInput(input)) {
      input.classList.add("is-invalid");
      isValid = false;
    }
  });

  return isValid;
}

/* -------------------- UI Feedback Functions -------------------- */

// Show feedback message to user
function showFeedback(message, isError = true) {
  statusMessage.textContent = message;
  statusMessage.classList.remove("d-none", "alert-success", "alert-danger");
  statusMessage.classList.add(isError ? "alert-danger" : "alert-success");
}

/* -------------------- Login Logic -------------------- */

// Handle login API response
function handleLoginResponse(userData, enteredPassword) {
  if (userData.password === enteredPassword) {
    localStorage.setItem("user", JSON.stringify(userData));
    window.location.href = "home.html";
  } else {
    showFeedback("Wrong password");
  }
}

// Process login attempt
async function attemptLogin(userCredentials) {
  try {
    const response = await fetch(
      `http://localhost:3000/users?email=${userCredentials.email}`
    );
    const users = await response.json();

    if (users.length === 0) {
      showFeedback("User not found");
      return;
    }

    handleLoginResponse(users[0], userCredentials.password);
  } catch (error) {
    console.error("Login error:", error);
    showFeedback("Login failed. Please try again.");
  }
}

// Main login handler
async function handleLogin() {
  if (!validateForm()) {
    showFeedback("Please fix the form errors");
    return;
  }

  const userCredentials = {
    email: formInputs[0].value.trim(),
    password: formInputs[1].value.trim(),
  };

  await attemptLogin(userCredentials);
}

/* -------------------- Event Listeners -------------------- */

function setupEventListeners() {
  loginButton.addEventListener("click", (e) => {
    e.preventDefault();
    handleLogin();
  });
}

/* -------------------- Initialization -------------------- */

function initializeLoginPage() {
  setupLiveValidation();
  setupEventListeners();
}

// Start the login page functionality
initializeLoginPage();
