/* -------------------- Slider Module -------------------- */
const slider = {
  // Initialize slider components
  init: function () {
    this.slides = document.querySelectorAll(".slide");
    this.dots = document.querySelectorAll(".dot");
    this.currentSlide = 0;
    this.interval = null;

    this.setupControls();
    this.startAutoPlay();
  },

  // Show specific slide
  showSlide: function (index) {
    this.slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
      this.dots[i].classList.toggle("active", i === index);
    });
    this.currentSlide = index;
  },

  // Navigation functions
  nextSlide: function () {
    const next = (this.currentSlide + 1) % this.slides.length;
    this.showSlide(next);
  },

  prevSlide: function () {
    const prev =
      (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.showSlide(prev);
  },

  // Auto-play management
  startAutoPlay: function () {
    this.interval = setInterval(() => this.nextSlide(), 5000);
  },

  resetAutoPlay: function () {
    clearInterval(this.interval);
    this.startAutoPlay();
  },

  // Event listeners setup
  setupControls: function () {
    document.querySelector(".next").addEventListener("click", () => {
      this.nextSlide();
      this.resetAutoPlay();
    });

    document.querySelector(".prev").addEventListener("click", () => {
      this.prevSlide();
      this.resetAutoPlay();
    });

    this.dots.forEach((dot) => {
      dot.addEventListener("click", (e) => {
        const index = parseInt(e.target.getAttribute("data-slide"));
        this.showSlide(index);
        this.resetAutoPlay();
      });
    });
  },
};

/* -------------------- Product Module -------------------- */
const productModule = {
  // DOM elements
  elements: {
    featuredContainer: document.querySelector(".card-cont"),
    productsContainer: document.querySelector(".products-cards"),
    categorySelect: document.querySelector(".cat-select"),
    priceSelect: document.querySelector(".form-select"),
    searchInput: document.querySelector(".search"),
  },

  // State management
  state: {
    selectedPrice: "all",
    selectedCategory: "all",
    searchValue: "",
  },

  // Initialize product module
  init: async function () {
    await this.fetchProducts();
    await this.fetchCategories();
    this.setupEventListeners();
  },

  // Fetch products from API
  fetchProducts: async function () {
    try {
      const response = await fetch("https://dummyjson.com/products?limit=40");
      const data = await response.json();
      this.renderFeaturedProducts(data.products.slice(1, 4));
      this.renderAllProducts(data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  },

  // Fetch categories from API
  fetchCategories: async function () {
    try {
      const response = await fetch("https://dummyjson.com/products/categories");
      const categories = await response.json();
      this.populateCategorySelect(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  },

  // Generate product card HTML
  createProductCard: function (product) {
    return `
      <div class="col-lg-4 col-md-6 mb-4 d-flex justify-content-center">
        <div class="card product-card styled-card text-center px-3 py-4">
          <div class="position-relative">
            <img src="${product.thumbnail}" 
                 class="card-img-top product-img mx-auto mb-3" 
                 alt="${product.title}" 
                 onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
            <div class="price-badge">$${product.price || ""}</div>
          </div>
          <div class="card-body px-2">
            <h5 class="card-title fw-bold text-uppercase mb-2">
              ${product.title?.split(" ").slice(0, 2).join(" ") || ""}
            </h5>
            <p class="card-text mb-3">
              ${product.description?.slice(0, 50) || ""}
            </p>
            <div class="d-flex justify-content-center align-items-center gap-2 mb-3">
              <span class="badge bg-dark">${product.availabilityStatus}</span>
              <span class="small">Stock: ${product.stock}</span>
            </div>
            <div class="rating-stars mb-3">
              ${[...Array(5)]
                .map(
                  (_, i) => `
                <i class="${
                  i < Math.round(product.rating) ? "fas" : "far"
                } fa-star text-warning"></i>
              `
                )
                .join("")}
              <span class="small">(${product.rating})</span>
            </div>
            <a href="product.html?id=${
              product.id
            }" class="btn shop-now-btn mt-2">SHOP NOW</a>
          </div>
        </div>
      </div>
    `;
  },

  // Render featured products
  renderFeaturedProducts: function (products) {
    this.elements.featuredContainer.innerHTML = products
      .map((product) => this.createProductCard(product))
      .join("");
  },

  // Render all products
  renderAllProducts: function (products) {
    this.elements.productsContainer.innerHTML = products
      .map((product) => this.createProductCard(product))
      .join("");
  },

  // Populate category dropdown
  populateCategorySelect: function (categories) {
    this.elements.categorySelect.innerHTML = categories
      .map(
        (category) => `
      <option value="${category.slug}">${category.slug}</option>
    `
      )
      .join("");
  },

  // Filtering logic
  applyFilters: function (products) {
    return products.filter((product) => {
      const matchesCategory =
        this.state.selectedCategory === "all" ||
        product.category === this.state.selectedCategory;
      const matchesSearch = product.title
        .toLowerCase()
        .includes(this.state.searchValue.toLowerCase());
      const matchesPrice = this.checkPriceRange(product.price);
      return matchesCategory && matchesSearch && matchesPrice;
    });
  },

  // Price range validation
  checkPriceRange: function (price) {
    switch (this.state.selectedPrice) {
      case "1":
        return price < 100;
      case "2":
        return price >= 100 && price <= 500;
      case "3":
        return price > 500;
      default:
        return true;
    }
  },

  // Handle empty state
  showEmptyState: function () {
    this.elements.productsContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <h4 class="text-muted">No products found</h4>
      </div>`;
  },

  // Event listeners setup
  setupEventListeners: function () {
    this.elements.priceSelect.addEventListener("change", (e) => {
      this.state.selectedPrice = e.target.value;
      this.handleFilterChange();
    });

    this.elements.categorySelect.addEventListener("change", (e) => {
      this.state.selectedCategory = e.target.value;
      this.handleFilterChange();
    });

    this.elements.searchInput.addEventListener("input", (e) => {
      this.state.searchValue = e.target.value;
      this.handleFilterChange();
    });
  },

  // Handle filter changes
  handleFilterChange: function () {
    fetch("https://dummyjson.com/products?limit=40")
      .then((res) => res.json())
      .then((response) => {
        const filtered = this.applyFilters(response.products);
        filtered.length > 0
          ? this.renderAllProducts(filtered)
          : this.showEmptyState();
      });
  },
};

/* -------------------- Initialization -------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // Initialize mobile menu
  const burger = document.querySelector(".burger");
  const navLinks = document.getElementById("navbarNav");
  burger.addEventListener("click", () => navLinks.classList.toggle("show"));

  // Initialize modules
  slider.init();
  productModule.init();
});
