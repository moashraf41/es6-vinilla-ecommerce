const burger = document.querySelector(".burger");
const navLinks = document.getElementById("navbarNav");

burger.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});

let productId = window.location.search.split("=")[1];
let container = document.querySelector(".product-details");
let relatedContainer = document.querySelector(".related-products");
let allRelated = document.querySelector(".all-related");
let footer = document.querySelector("footer");

function getStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return "★".repeat(fullStars) + (halfStar ? "½" : "") + "☆".repeat(emptyStars);
}

async function getProduct() {
  let res = await fetch(`https://dummyjson.com/products/${productId}`);
  let product = await res.json();

  const discountedPrice = (
    product.price *
    (1 - product.discountPercentage / 100)
  ).toFixed(2);
  const lowStockWarning =
    product.stock <= 5
      ? `<div class="text-danger fw-bold">⚠️ Low Stock</div>`
      : "";

  const reviewsHTML =
    product.reviews
      ?.map(
        (r) => `
    <div class="border rounded p-3 mb-3">
      <div class="fw-bold">${r.reviewerName}</div>
      <div class="text-warning">${getStars(r.rating)}</div>
      <p class="mb-0">${r.comment}</p>
    </div>`
      )
      .join("") || "<p>No reviews yet.</p>";

  container.innerHTML = `
    <div class="container  rounded-4  p-4 mb-5">
  <div class="row g-4 align-items-center">
    
    <!-- Product Image -->
    <div class="col-lg-5 text-center">
      <img
        src="${product.images[0]}"
        alt="${product.title}"
        class="img-fluid prod-img rounded-4 shadow-sm"
        style="max-height: 400px; object-fit: contain;"
        onerror="this.src='https://via.placeholder.com/400x400?text=No+Image'"
      />
    </div>

    <!-- Product Info -->
    <div class="col-lg-7">
      <div class="d-flex flex-column gap-3">

        <!-- Title -->
        <h2 class="text-main fw-bold text-uppercase">
          ${product.title.split(" ").slice(0, 4).join(" ")}
        </h2>

        <!-- Description -->
        <p class="text-muted lh-lg">
          ${product.description}
        </p>

        <!-- Price -->
        <div class="d-flex align-items-center gap-3">
          <h4 class="text-success mb-0">$${discountedPrice}</h4>
          <del class="text-muted fs-6">$${product.price}</del>
        </div>

        <!-- Rating -->
        <div class="d-flex align-items-center gap-2">
          ${getStars(product.rating)}
          <span class="text-muted small">(${product.rating})</span>
        </div>

        <!-- Info Grid -->
        <div class="row row-cols-2 g-2 text-muted small">
          <div><i class="fas fa-industry me-1"></i><strong> Brand:</strong> ${
            product.brand
          }</div>
          <div><i class="fas fa-box-open me-1"></i><strong> Stock:</strong> ${
            product.stock
          }</div>
          <div><i class="fas fa-tags me-1"></i><strong> Category:</strong> ${
            product.category
          }</div>
          <div><i class="fas fa-barcode me-1"></i><strong> SKU:</strong> ${
            product.sku
          }</div>
          <div><i class="fas fa-shield-alt me-1"></i><strong> Warranty:</strong> ${
            product.warrantyInformation
          }</div>
          <div><i class="fas fa-undo me-1"></i><strong> Return:</strong> ${
            product.returnPolicy
          }</div>
          <div><i class="fas fa-truck me-1"></i><strong> Shipping:</strong> ${
            product.shippingInformation
          }</div>
        </div>

        <!-- Add to Cart -->
        <div>
          <button class="btn addCart btn-dark rounded-pill px-4 py-2 ${
            product.stock <= 0 ? "disabled" : ""
          }">
            ${product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            <i class="fa-solid fa-cart-shopping ms-2"></i>
          </button>
        </div>

      </div>
    </div>
  </div>
</div>

<!-- Reviews -->
<div class="container">
  <div class=" rounded-4 p-4 shadow-md">
    <h4 class="mb-3">Customer Reviews</h4>
    ${reviewsHTML}
  </div>
</div>

  `;
  footer.style.display = "block";
  let addCart = document.querySelector(".addCart");

  GetRelated(product.category, productId);
  allRelated.style.display = "block";

  addCart.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    let res = await fetch(`http://localhost:3000/cartS?userId=${userId}`);
    let cart = await res.json();
    cart.forEach(async (c) => {
      let items = c.items;

      let existingItem = items.find((item) => item.productId === product.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        items.push({
          productId: product.id,
          name: product.title,
          price: product.price,
          image: product.images[0],
          category: product.category,
          quantity: 1,
        });
      }

      await fetch(`http://localhost:3000/cartS/${c.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });
      setTimeout(() => addCart.setAttribute("disabled", true), 0);
    });
  });
}

getProduct();

async function GetRelated(category, activeProductId) {
  let res = await fetch(`https://dummyjson.com/products/category/${category}`);
  let { products: relatedProducts } = await res.json();

  relatedProducts = relatedProducts.filter(
    (p) => p.id !== Number(activeProductId)
  );

  if (Array.isArray(relatedProducts) && relatedProducts.length > 0) {
    relatedContainer.innerHTML = "";

    relatedProducts.forEach((product) => {
      relatedContainer.innerHTML += `
          <div class="col-lg-4 col-md-6 mb-4 d-flex justify-content-center">
  <div class="card product-card styled-card text-center px-3 py-4">

    <div class="position-relative">
      <img src="${product.thumbnail}" 
           class="card-img-top product-img mx-auto mb-3" 
           alt="${product.title}" 
           onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
      <div class="price-badge">${product.price ? "$" + product.price : ""}</div>
    </div>

    <div class="card-body px-2">
      <h5 class="card-title fw-bold text-uppercase mb-2">
${product.title?.split(" ").slice(0, 2).join(" ") || ""}
      </h5>


      <p class="card-text text-muted mb-3">
        ${product.description?.slice(0, 50) || ""}
      </p>

      <div class="d-flex justify-content-center align-items-center gap-2 mb-3">
        <span class="badge bg-dark">
          ${product.availabilityStatus}
        </span>
        <span class=" small">Stock: ${product.stock}</span>
      </div>

      <div class="rating-stars mb-3">
        ${[...Array(5)]
          .map((_, i) =>
            i < Math.round(product.rating)
              ? `<i class="fas fa-star text-warning"></i>`
              : `<i class="far fa-star text-warning"></i>`
          )
          .join("")}
        <span class="text-muted small">(${product.rating})</span>
      </div>

      <a href="product.html?id=${
        product.id
      }" class="btn shop-now-btn mt-2">SHOP NOW</a>
    </div>

  </div>
</div>

          `;
    });
  } else {
    relatedContainer.innerHTML = "<p>No related products available.</p>";
  }
}

let loggedUser = JSON.parse(localStorage.getItem("user"));
let userId = loggedUser.id;
