document.addEventListener("DOMContentLoaded", () => {
  let inputs = document.querySelectorAll("input");
  let successMsg = document.querySelector("#successMsg");

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      let val = input.value.trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const passwordRegex = /^.{6,}$/;
      const nameRegex = /^[A-Za-z\u0600-\u06FF ]{6,}$/;
      const addressRegex = /^.{5,}$/;
      const phoneRegex = /^(010|011|012|015)[0-9]{8}$/;

      input.classList.remove("is-valid", "is-invalid");

      if (input.id === "inputEmail4" && emailRegex.test(val)) {
        input.classList.add("is-valid");
      } else if (input.id === "inputPassword4" && passwordRegex.test(val)) {
        input.classList.add("is-valid");
      } else if (input.id === "name" && nameRegex.test(val)) {
        input.classList.add("is-valid");
      } else if (input.id === "inputAddress" && addressRegex.test(val)) {
        input.classList.add("is-valid");
      } else if (input.id === "phone" && phoneRegex.test(val)) {
        input.classList.add("is-valid");
      } else {
        input.classList.add("is-invalid");
      }
    });
  });

  document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
    register();
  });

  async function register() {
    let allValid = true;

    inputs.forEach((input) => {
      if (!input.classList.contains("is-valid")) {
        allValid = false;
        input.classList.add("is-invalid");
      }
    });

    if (!allValid) {
      console.log("❌ please fix the inputs");
      return;
    }

    let user = {
      email: inputs[0].value,
      password: inputs[1].value,
      name: inputs[2].value,
      address: inputs[3].value,
      phone: inputs[4].value,
    };

    try {
      const res = await fetch(
        `http://localhost:3000/users?email=${user.email}`
      );
      const existingUsers = await res.json();

      if (existingUsers.length > 0) {
        successMsg.innerText = "this email is already registered";
        successMsg.classList.remove("d-none", "alert-success");
        successMsg.classList.add("alert-danger");
        return;
      }

      const addRes = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (!addRes.ok) throw new Error("❌failed to add user");

      const addedUser = await addRes.json();
      console.log("✅ user added:", addedUser);

      const cartRes = await fetch("http://localhost:3000/cartS", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: addedUser.id,
          items: [],
        }),
      });

      if (!cartRes.ok) {
        throw new Error("failed to create cart");
      }

      const cartData = await cartRes.json();
      console.log("🛒cart is created", cartData);

      successMsg.innerText = "✅ user registered successfully";
      successMsg.classList.remove("d-none", "alert-danger");
      successMsg.classList.add("alert-success");
      window.location.href = "index.html";

      inputs.forEach((input) => {
        input.value = "";
        input.classList.remove("is-valid", "is-invalid");
      });
    } catch (error) {
      console.error("🔥 ERROR:", error);
      successMsg.innerText = "🚫 error occured";
      successMsg.classList.remove("d-none", "alert-success");
      successMsg.classList.add("alert-danger");
    }
  }
});
