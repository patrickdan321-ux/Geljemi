/* =========================================================================
   GELJEMI STORE - index.js
   Complete Application Logic
   ========================================================================= */

"use strict";

/* =========================================================================
   DATABASE SETUP
   ========================================================================= */

const {
  itemsDatabase = [],
  promoDatabase = [],
  extraDatabase = [],
  deepCategoryDB = {},
  productVariantsDB = {},
  categoryFields = {}
} = window.appData || {};

/* =========================================================================
   GLOBAL STATE
   ========================================================================= */

let currentMessengerLink = "";
let currentNavigationState = [];
let lastFocusedElement = null;

/* =========================================================================
   UTILITY FUNCTIONS
   ========================================================================= */

const $ = (id) => document.getElementById(id);

const escapeHTML = (text = "") => {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const getPrice = (item) => item.price || item.newPrice || "";

/* =========================================================================
   TOAST NOTIFICATIONS
   ========================================================================= */

function showToast(message, duration = 1800) {
  const toast = $("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toast.hideTimer);

  toast.hideTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

/* =========================================================================
   TEMPLATE GENERATORS
   ========================================================================= */

function itemCard(item) {
  return `
    <div
      class="card card-link"
      tabindex="0"
      role="button"
      data-title="${escapeHTML(item.title)}"
      data-desc="${escapeHTML(item.description)}">
      
     <div class="card-icon">
  ${
    item.icon &&
    (item.icon.endsWith(".png") ||
     item.icon.endsWith(".jpg") ||
     item.icon.endsWith(".jpeg") ||
     item.icon.endsWith(".webp") ||
     item.icon.endsWith(".svg"))
      ? `<img src="${item.icon}" alt="${escapeHTML(item.title)}">`
      : escapeHTML(item.icon || "")
  }
</div>

      <h3>${escapeHTML(item.title)}</h3>
      <p>${escapeHTML(item.description)}</p>
    </div>
  `;
}

function promoCard(data) {
  return `
    <div
      class="promo-card ${data.badge === "Hot" ? "hot-deal" : ""}"
      data-category="${escapeHTML(data.tag || "")}"
      data-link="${escapeHTML(data.link || "")}"
      data-title="${escapeHTML(data.title)}"
      data-price="${escapeHTML(getPrice(data))}">
      ${data.badge ? `<div class="promo-badge">${escapeHTML(data.badge)}</div>` : ""}
      <div class="promo-header">
        <span class="promo-tag">
          ${escapeHTML(data.tag)}
        </span>
        <h3 class="promo-title">
          ${escapeHTML(data.title)}
        </h3>
      </div>
      <p class="promo-desc">
        ${escapeHTML(data.description)}
      </p>
      <div class="promo-footer">
        <div class="price-container">
          <span class="old-price">
            ${escapeHTML(data.oldPrice || "")}
          </span>
          <span class="new-price">
            ${escapeHTML(getPrice(data))}
          </span>
        </div>
        <button class="promo-btn" type="button">
          Buy Now
        </button>
      </div>
    </div>
  `;
}

function stayTunedCard(message = "Stay Tuned") {
  return `
    <div class="stay-tuned-placeholder">
      <div class="card">
        <h3>${escapeHTML(message)}</h3>
        <p class="promo-desc">
          Great deals coming soon. Check back later for amazing offers!
        </p>
      </div>
    </div>
  `;
}

/* =========================================================================
   RENDERING FUNCTIONS
   ========================================================================= */

function renderItems() {
  const grid = $("itemsGrid");
  if (!grid) return;
  grid.innerHTML = itemsDatabase.map(itemCard).join("");
}

function renderPromos() {
  const grid = $("promosGrid");
  if (!grid) return;

  // Check if promos exist
  if (promoDatabase.length === 0) {
    grid.innerHTML = stayTunedCard("No Promos Available");
    return;
  }

  grid.innerHTML = promoDatabase.map(promoCard).join("");
}

function renderExtraLayer() {
  const grid = $("extraGrid");
  if (!grid) return;

  // Check if extra packages exist
  if (extraDatabase.length === 0) {
    grid.innerHTML = stayTunedCard("Stay Tuned");
    return;
  }

  grid.innerHTML = extraDatabase.map(promoCard).join("");
}

/* =========================================================================
   NAVIGATION FUNCTIONS
   ========================================================================= */

function goHome() {
  const home = $("home-view");
  const category = $("category-view");
  const filters = $("variant-filters");
  const grid = $("category-items-grid");

  if (filters) filters.classList.add("is-hidden");
  if (category) category.classList.add("is-hidden");
  if (home) home.classList.remove("is-hidden");
  if (grid) grid.innerHTML = "";

  currentNavigationState = [];
  setActiveNav("home");
  window.scrollTo({ top: 0, behavior: "instant" });
}

function setActiveNav(action) {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
    if (link.dataset.action === action) {
      link.classList.add("active");
    }
  });
}

function scrollToSection(id) {
  // Restore home view if on category page
  const home = $("home-view");
  const category = $("category-view");
  const filters = $("variant-filters");
  const grid = $("category-items-grid");

  if (filters) filters.classList.add("is-hidden");
  if (category) category.classList.add("is-hidden");
  if (home) home.classList.remove("is-hidden");
  if (grid) grid.innerHTML = "";

  currentNavigationState = [];

  // Set the nav active state for the target section immediately
  const navAction = id === "items" ? "items" : id === "promos" ? "promos" : "home";
  setActiveNav(navAction);

  const section = document.getElementById(id);
  if (!section) return;

  setTimeout(() => {
    section.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, 100);
}

/* =========================================================================
   CATEGORY VIEW
   ========================================================================= */

function openCategory(categoryName, description = "") {
  const home = $("home-view");
  const category = $("category-view");
  const grid = $("category-items-grid");
  const title = $("selection-page-title");

  if (!home || !category || !grid) return;

  home.classList.add("is-hidden");
  category.classList.remove("is-hidden");
  setActiveNav("items");
  window.scrollTo({ top: 0, behavior: "instant" });

  currentNavigationState = [
    { type: "home" },
    { type: "category", title: categoryName, desc: description }
  ];

  const data = deepCategoryDB[categoryName];

  if (!data) {
    grid.innerHTML = stayTunedCard("Coming Soon");
    return;
  }

  title.innerHTML = `Choose your<br><span class="gradient-text">${escapeHTML(
    data.headline
  )}</span>`;

  grid.innerHTML = data.options
    .map(
      (option) => `
    <div
      class="platform-card"
      tabindex="0"
      role="button"
      data-title="${escapeHTML(option.title)}"
      data-parent="${escapeHTML(categoryName)}"
      data-desc="${escapeHTML(description)}">
      
     <div class="platform-icon-wrap">
  ${
    option.icon &&
    (option.icon.endsWith(".png") ||
     option.icon.endsWith(".jpg") ||
     option.icon.endsWith(".jpeg") ||
     option.icon.endsWith(".webp") ||
     option.icon.endsWith(".svg"))
      ? `<img src="${option.icon}" alt="${escapeHTML(option.title)}">`
      : escapeHTML(option.icon || "")
  }
</div>

      <div class="platform-info">
        <h3>${escapeHTML(option.title)}</h3>
        <p>${escapeHTML(option.description)}</p>
      </div>
      <div class="platform-arrow">→</div>
    </div>
  `
    )
    .join("");
}

/* =========================================================================
   VARIANTS VIEW
   ========================================================================= */

function openVariants(platformName, parentCategory, description = "") {
  const grid = $("category-items-grid");
  const title = $("selection-page-title");
  const filters = $("variant-filters");
  const backText = $("back-btn-text");

  if (!grid) return;

  // Store the correct parent category name
  currentNavigationState.push({
    type: "variants",
    title: platformName,
    parent: parentCategory,
    desc: description
  });

  if (backText) backText.textContent = `Back to ${parentCategory}`;

  window.scrollTo({ top: 0, behavior: "instant" });

  if (filters) {
    filters.classList.remove("is-hidden");

    filters.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active");
      btn.style.display = "none";
    });

    const allBtn = filters.querySelector("[data-variant='all']");
    if (allBtn) {
      allBtn.style.display = "inline-flex";
      allBtn.classList.add("active");
    }

    if (parentCategory === "Gaming") {
      filters
        .querySelectorAll("[data-type='game']")
        .forEach((btn) => (btn.style.display = "inline-flex"));
    }

    if (parentCategory === "Internet") {
      filters
        .querySelectorAll("[data-type='load']")
        .forEach((btn) => (btn.style.display = "inline-flex"));
    }
  }

  title.innerHTML = `Available<br><span class="gradient-text">${escapeHTML(
    platformName
  )}</span>`;

  const products = productVariantsDB[platformName] || [];

  if (products.length === 0) {
    grid.innerHTML = stayTunedCard("Stay Tuned");
    return;
  }

  grid.innerHTML = products
    .map(
      (product) => `
    <div
      class="premium-variant-card"
      data-category="${escapeHTML(product.tag)}"
      data-title="${escapeHTML(product.title)}"
      data-price="${escapeHTML(getPrice(product))}"
      data-link="${escapeHTML(product.link)}">
      <div>
        <h3 class="variant-title">
          ${escapeHTML(product.title)}
        </h3>
        <p class="variant-desc">
          ${escapeHTML(product.description)}
        </p>
      </div>
      <div class="variant-price-row">
        <span class="variant-old-price">
          ${escapeHTML(product.oldPrice || "")}
        </span>
        <span class="variant-new-price">
          ${escapeHTML(getPrice(product))}
        </span>
      </div>
      <button class="premium-buy-btn" type="button">
        Buy Now
      </button>
    </div>
  `
    )
    .join("");
}

/* =========================================================================
   BACK NAVIGATION
   ========================================================================= */

function goBack() {
  const filters = $("variant-filters");
  const grid = $("category-items-grid");

  // If we're at the root level, go home
  if (currentNavigationState.length <= 1) {
    goHome();
    return;
  }

  // If we're at category level (length === 2), go home
  if (currentNavigationState.length === 2) {
    goHome();
    return;
  }

  // Pop the current state
  currentNavigationState.pop();
  const previous = currentNavigationState.at(-1);

  // Clear filters and grid
  if (filters) filters.classList.add("is-hidden");
  if (grid) grid.innerHTML = "";

  // Go back to the previous category with correct data
  if (previous && previous.type === "category") {
    openCategory(previous.title, previous.desc);
  } else {
    goHome();
  }
}

/* =========================================================================
   ORDER & PURCHASE FUNCTIONS
   ========================================================================= */

function buyItem(card) {
  currentMessengerLink = card.dataset.link || "";
  lastFocusedElement = document.activeElement;

  const orderInfo = $("orderInfo");
  const fieldsBox = $("dynamicFields");
  const modal = $("orderModal");

  if (!orderInfo || !fieldsBox || !modal) return;

  orderInfo.innerHTML = `
    <strong>Product:</strong>
    ${escapeHTML(card.dataset.title)}
    <br><br>
    <strong>Price:</strong>
    ${escapeHTML(card.dataset.price)}
    <br><br>
  `;

  fieldsBox.innerHTML = "";

  const fields = categoryFields[card.dataset.category] || [];

  fields.forEach((field) => {
    const input = document.createElement("input");
    input.className = "order-input";
    input.placeholder = field;
    input.dataset.field = field;
    input.addEventListener("input", validateOrder);
    fieldsBox.appendChild(input);
  });

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");

  validateOrder();
}

function validateOrder() {
  const button = $("messengerBtn");
  const inputs = [...document.querySelectorAll(".order-input")];

  if (!button) return;

  if (!inputs.length) {
    button.disabled = false;
    return;
  }

  button.disabled = inputs.some((input) => input.value.trim() === "");
}

function closeModal() {
  const modal = $("orderModal");
  if (!modal || !modal.classList.contains("show")) return;

  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");

  if (lastFocusedElement) lastFocusedElement.focus();
}

/* =========================================================================
   FILTER FUNCTIONS
   ========================================================================= */

function filterDealGrid(gridId, category, button, emptyLabel) {
  const filterGroup = button?.closest(".promo-filters");

  filterGroup
    ?.querySelectorAll(".filter-btn")
    .forEach((btn) => btn.classList.remove("active"));

  if (button) button.classList.add("active");

  const grid = $(gridId);
  if (!grid) return;

  const cards = grid.querySelectorAll(".promo-card");
  let visibleCount = 0;

  cards.forEach((card) => {
    const show =
      category === "all" || card.dataset.category === category;
    card.classList.toggle("promo-hidden", !show);
    if (show) visibleCount++;
  });

  const existingPlaceholder = grid.querySelector(".stay-tuned-placeholder");
  if (existingPlaceholder) existingPlaceholder.remove();

  if (visibleCount === 0) {
    const placeholder = document.createElement("div");
    placeholder.className = "stay-tuned-placeholder";
    placeholder.innerHTML = `
      <div class="card">
        <h3>No ${category} ${emptyLabel} Yet</h3>
        <p class="promo-desc">
          Great deals coming soon. Check back later!
        </p>
      </div>
    `;
    grid.appendChild(placeholder);
  }
}

function filterPromos(category, button) {
  filterDealGrid("promosGrid", category, button, "Deals");
}

function filterExtraPackages(category, button) {
  filterDealGrid("extraGrid", category, button, "Packages");
}

function filterVariants(category, button) {
  document
    .querySelectorAll("#variant-filters .filter-btn")
    .forEach((btn) => btn.classList.remove("active"));

  if (button) button.classList.add("active");

  const cards = document.querySelectorAll(".premium-variant-card");
  let visibleCount = 0;

  cards.forEach((card) => {
    const show =
      category === "all" || card.dataset.category === category;
    card.classList.toggle("promo-hidden", !show);
    if (show) visibleCount++;
  });

  // If no cards match, show stay tuned message
  const grid = $("category-items-grid");

  // Remove existing placeholder
  const existingPlaceholder = grid?.querySelector(".stay-tuned-placeholder");
  if (existingPlaceholder) existingPlaceholder.remove();

  // Show placeholder if no visible cards
  if (visibleCount === 0 && grid) {
    const placeholder = document.createElement("div");
    placeholder.className = "stay-tuned-placeholder";
    placeholder.innerHTML = `
      <div class="card">
        <h3>No ${category} Available</h3>
        <p class="promo-desc">
          Great deals coming soon. Check back later!
        </p>
      </div>
    `;
    grid.appendChild(placeholder);
  }
}

/* =========================================================================
   MESSENGER & CLIPBOARD
   ========================================================================= */

function openMessenger() {
  const orderInfo = $("orderInfo");
  if (!orderInfo) return;

  let message = "🛒 GELJEMI STORE ORDER\n\n";
  message += orderInfo.innerText + "\n";

  document.querySelectorAll(".order-input").forEach((input) => {
    message += `${input.dataset.field}: ${input.value}\n`;
  });

  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(message)
      .then(() => {
        showToast("Order copied!");
        
        if (currentMessengerLink) {
  const link = currentMessengerLink.startsWith("http")
    ? currentMessengerLink
    : `https://m.me/${currentMessengerLink}`;
  window.location.href = link;
}

      })
      .catch(() => {
        fallbackCopy(message);
      });
  } else {
    fallbackCopy(message);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();

  showToast("Order copied!");
  if (currentMessengerLink) {
  const link = currentMessengerLink.startsWith("http")
    ? currentMessengerLink
    : `https://m.me/${currentMessengerLink}`;
  window.location.href = link;
}
}

/* =========================================================================
   EVENT DELEGATION
   ========================================================================= */

function handleClick(event) {
  const target = event.target;

  /* Navigation Links */
  const nav = target.closest(".nav-link");
  if (nav) {
    event.preventDefault();
    const action = nav.dataset.action;

    switch (action) {
      case "home":
        goHome();
        break;
      case "items":
        scrollToSection("items");
        break;
      case "promos":
        scrollToSection("promos");
        break;
    }
    return;
  }

  /* Hero Buttons */
  const heroBtn = target.closest("[data-scroll-to]");
  if (heroBtn) {
    scrollToSection(heroBtn.dataset.scrollTo);
    return;
  }

  /* Category Cards */
  const card = target.closest(".card-link");
  if (card) {
    openCategory(card.dataset.title, card.dataset.desc);
    return;
  }

  /* Platform Cards */
  const platform = target.closest(".platform-card");
  if (platform) {
    openVariants(
      platform.dataset.title,
      platform.dataset.parent,
      platform.dataset.desc
    );
    return;
  }

  /* Promo Buy Button */
  const promoBtnClicked = target.closest(".promo-btn");
  if (promoBtnClicked) {
    const promoCard = target.closest(".promo-card");
    if (promoCard) {
      buyItem(promoCard);
    }
    return;
  }

  /* Variant Buy Button */
  const variantBtnClicked = target.closest(".premium-buy-btn");
  if (variantBtnClicked) {
    const variantCard = target.closest(".premium-variant-card");
    if (variantCard) {
      buyItem(variantCard);
    }
    return;
  }

  /* Promo Filter */
  const promoFilter = target.closest(".filter-btn[data-filter]");
  if (promoFilter) {
    filterPromos(promoFilter.dataset.filter, promoFilter);
    return;
  }

  /* Extra Package Filter */
  const extraFilter = target.closest(".filter-btn[data-extra-filter]");
  if (extraFilter) {
    filterExtraPackages(extraFilter.dataset.extraFilter, extraFilter);
    return;
  }

  /* Variant Filter */
  const variantFilter = target.closest(".filter-btn[data-variant]");
  if (variantFilter) {
    filterVariants(variantFilter.dataset.variant, variantFilter);
    return;
  }
}

/* =========================================================================
   KEYBOARD SUPPORT
   ========================================================================= */

function handleKeydown(event) {
  if (event.key === "Escape") {
    closeModal();
  }

  if (event.key === "Enter" || event.key === " ") {
    const active = document.activeElement;

    if (
      active.classList.contains("card-link") ||
      active.classList.contains("platform-card")
    ) {
      event.preventDefault();
      active.click();
    }
  }
}

/* =========================================================================
   APPLICATION INITIALIZATION
   ========================================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* Render initial content */
  renderItems();
  renderPromos();
  renderExtraLayer();

  /* Event listeners */
  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKeydown);

  $("dynamic-back-btn")?.addEventListener("click", goBack);
  $("closeModalBtn")?.addEventListener("click", closeModal);
  $("messengerBtn")?.addEventListener("click", openMessenger);

  $("orderModal")?.addEventListener("click", (e) => {
    if (e.target.id === "orderModal") closeModal();
  });

  /* -----------------------------------------------------------------------
     SCROLL-BASED ACTIVE NAV (home → items → promos)
  ----------------------------------------------------------------------- */
  let ticking = false;
  let navClickCooldown = false;

  function updateActiveNavFromScroll() {
    if (navClickCooldown) return;

    const categoryView = $("category-view");
    if (categoryView && !categoryView.classList.contains("is-hidden")) {
      setActiveNav("items");
      return;
    }

    const itemsEl  = document.getElementById("items");
    const promosEl = document.getElementById("promos");
    if (!itemsEl || !promosEl) return;

    const triggerY  = window.innerHeight * 0.4;
    const itemsTop  = itemsEl.getBoundingClientRect().top;
    const promosTop = promosEl.getBoundingClientRect().top;

    if (promosTop <= triggerY) {
      setActiveNav("promos");
    } else if (itemsTop <= triggerY) {
      setActiveNav("items");
    } else {
      setActiveNav("home");
    }
  }

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navClickCooldown = true;
      setTimeout(() => { navClickCooldown = false; }, 1500);
    });
  });

  /* -----------------------------------------------------------------------
     SCROLL HIGHLIGHT BLOB (items & promos sections)
  ----------------------------------------------------------------------- */
  const blob = $("scrollBlob");
  const itemsSection  = $("items");
  const promosSection = $("promos");

  function getBlobTarget(scrollY, vpHeight) {
    if (!itemsSection || !promosSection) return null;

    const itemsRect  = itemsSection.getBoundingClientRect();
    const promosRect = promosSection.getBoundingClientRect();

    if (itemsRect.top < vpHeight * 0.75 && itemsRect.bottom > vpHeight * 0.25) {
      return { type: "items", y: itemsRect.top + itemsRect.height * 0.4 };
    }

    if (promosRect.top < vpHeight * 0.75 && promosRect.bottom > vpHeight * 0.25) {
      return { type: "promos", y: promosRect.top + promosRect.height * 0.4 };
    }

    return null;
  }

  function updateBlob() {
    if (!blob) return;
    const vpHeight = window.innerHeight;
    const target = getBlobTarget(window.scrollY, vpHeight);

    if (!target) {
      blob.classList.remove("blob-visible");
      return;
    }

    blob.classList.add("blob-visible");
    blob.classList.toggle("blob-items",  target.type === "items");
    blob.classList.toggle("blob-promos", target.type === "promos");
    blob.style.left = "70%";
    blob.style.top  = `${target.y}px`;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateActiveNavFromScroll();
        updateBlob();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener("resize", () => {
    updateActiveNavFromScroll();
    updateBlob();
  }, { passive: true });

  updateBlob();
  updateActiveNavFromScroll();
});