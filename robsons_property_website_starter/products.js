const DEFAULT_CSV_PATH = "/ROBSONS_Property_Website_Starter/products.csv";
const DEFAULT_GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-O840-VYJrpyDqKApi6zqPpmfEZsaSZ5uTBYSi3KIFAgEWiSqbeT8mt0nIIpvD5TsFYC_pksScXBO/pub?output=csv";
const WHATSAPP_NUMBER = "67574447170";
const storedSheetUrl = localStorage.getItem("robsons_sheet_csv_url") || "";

const fallbackProducts = [
  {
    sku: "RBS-BAG-001",
    name: "Ladies Fashion Bag",
    category: "Bags",
    brand: "Robsons Select",
    price: 180,
    salePrice: 165,
    description: "Structured everyday handbag with shoulder strap and zipped compartments.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
    colors: ["Black", "Brown", "Pink"],
    sizes: ["Standard"],
    stock: 18,
    availability: "in_stock",
    deliveryTime: "2-5 business days",
    weightKg: 0.7,
    featured: true,
    newArrival: true
  },
  {
    sku: "RBS-SHOE-002",
    name: "Running Shoes",
    category: "Shoes",
    brand: "Urban Step",
    price: 250,
    salePrice: 225,
    description: "Comfortable lace-up running shoes for school work and casual wear.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    colors: ["Black", "White", "Blue"],
    sizes: ["39", "40", "41", "42", "43"],
    stock: 12,
    availability: "in_stock",
    deliveryTime: "3-6 business days",
    weightKg: 1.1,
    featured: true,
    newArrival: true
  },
  {
    sku: "RBS-BACK-003",
    name: "Travel Backpack",
    category: "Bags",
    brand: "PNG Trail",
    price: 220,
    salePrice: 0,
    description: "Durable travel backpack with laptop sleeve and bottle pockets.",
    image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=900&q=80",
    colors: ["Black", "Navy"],
    sizes: ["Large"],
    stock: 8,
    availability: "low_stock",
    deliveryTime: "2-5 business days",
    weightKg: 0.9,
    featured: true,
    newArrival: false
  }
];

const categoryCodes = {
  Bags: "BAG",
  Shoes: "SHO",
  Clothing: "CLO",
  Watches: "WAT",
  Electronics: "ELE",
  Beauty: "BEA",
  "School Items": "SCH",
  "Home & Kitchen": "HOM"
};

const shippingRates = {
  "Lae": 15,
  "Port Moresby": 25,
  "Mt Hagen": 30,
  "Kimbe": 35,
  "Madang": 30,
  "Goroka": 30,
  "Kokopo": 38,
  "Wewak": 40,
  "Other Province": 45
};

let products = [];
let cart = JSON.parse(localStorage.getItem("robsons_cart") || "[]");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatKina(value) {
  return `K${Number(value || 0).toLocaleString("en-PG", { maximumFractionDigits: 0 })}`;
}

function toNumber(value) {
  return Number(String(value || "").replace(/[^0-9.]/g, "")) || 0;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(value.trim());
      if (row.some(Boolean)) {
        rows.push(row);
      }
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value.trim());
  if (row.some(Boolean)) {
    rows.push(row);
  }

  return rows;
}

function normalizeHeading(heading) {
  return heading.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function splitOptions(value) {
  return String(value || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function productFromRecord(record) {
  return {
    sku: record.sku,
    name: record.product_name || record.name,
    category: record.category || "General",
    brand: record.brand || "Robsons",
    price: toNumber(record.price),
    salePrice: toNumber(record.sale_price),
    description: record.description || "",
    image: record.image_url || record.image,
    images: [record.image_url, record.image_2_url, record.image_3_url].filter(Boolean),
    colors: splitOptions(record.color),
    sizes: splitOptions(record.size),
    stock: toNumber(record.stock_quantity || record.stock),
    availability: record.availability || "in_stock",
    deliveryTime: record.delivery_time || "2-7 business days",
    weightKg: toNumber(record.weight_kg),
    featured: /^yes|true|1$/i.test(record.featured || ""),
    newArrival: /^yes|true|1$/i.test(record.new_arrival || "")
  };
}

function productsFromCsv(csvText) {
  const rows = parseCsv(csvText);
  const headers = rows.shift() || [];
  const columns = headers.map(normalizeHeading);

  return rows.map((row) => {
    const record = {};
    columns.forEach((column, index) => {
      record[column] = row[index] || "";
    });
    return productFromRecord(record);
  }).filter((product) => product.sku && product.name && product.image);
}

async function fetchCsv(url) {
  const separator = url.includes("?") ? "&" : "?";
  const response = await fetch(`${url}${separator}refresh=${Date.now()}`);

  if (!response.ok) {
    throw new Error("Product CSV could not be loaded.");
  }

  return response.text();
}

async function loadProducts() {
  const sheetStatus = document.querySelector("#sheetStatus");
  const sheetUrlInput = document.querySelector("#sheetUrlInput");
  if (sheetUrlInput) {
    sheetUrlInput.value = storedSheetUrl || DEFAULT_GOOGLE_SHEET_CSV_URL;
  }

  try {
    const catalogSources = [storedSheetUrl || DEFAULT_GOOGLE_SHEET_CSV_URL, DEFAULT_CSV_PATH];
    let csvText = "";
    for (const source of catalogSources) {
      try {
        csvText = await fetchCsv(source);
        break;
      } catch (error) {
        csvText = "";
      }
    }
    if (!csvText) {
      throw new Error("No catalog source could be loaded.");
    }
    products = productsFromCsv(csvText);
    if (!products.length) {
      throw new Error("No usable products found.");
    }
    if (sheetStatus) {
      sheetStatus.textContent = "Live Google Sheet CSV catalog loaded.";
    }
  } catch (error) {
    products = fallbackProducts;
    if (sheetStatus) {
      sheetStatus.textContent = "Showing backup products. Check the Google Sheet CSV link if live catalog loading is blocked.";
    }
  }

  hydrateFilters();
  renderCategories();
  renderProducts();
  renderArrivals();
  renderAdmin();
  renderCart();
}

function uniqueValues(key) {
  return [...new Set(products.map((product) => product[key]).filter(Boolean))].sort();
}

function fillSelect(select, values, allLabel) {
  if (!select) {
    return;
  }
  select.innerHTML = `<option value="all">${allLabel}</option>${values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}`;
}

function hydrateFilters() {
  fillSelect(document.querySelector("#categoryFilter"), uniqueValues("category"), "All categories");
  fillSelect(document.querySelector("#brandFilter"), uniqueValues("brand"), "All brands");

  const provinceSelect = document.querySelector("#provinceSelect");
  if (provinceSelect) {
    provinceSelect.innerHTML = Object.keys(shippingRates)
      .map((province) => `<option value="${escapeHtml(province)}">${escapeHtml(province)}</option>`)
      .join("");
  }
}

function renderCategories() {
  const grid = document.querySelector("#categoryGrid");
  if (!grid) {
    return;
  }

  const categories = Object.keys(categoryCodes);
  grid.innerHTML = categories.map((category) => `
    <article class="category-card" data-category="${escapeHtml(category)}">
      <span class="category-icon">${escapeHtml(categoryCodes[category])}</span>
      <h3>${escapeHtml(category)}</h3>
    </article>
  `).join("");
}

function getFilteredProducts() {
  const query = (document.querySelector("#searchInput")?.value || "").trim().toLowerCase();
  const category = document.querySelector("#categoryFilter")?.value || "all";
  const brand = document.querySelector("#brandFilter")?.value || "all";
  const availability = document.querySelector("#availabilityFilter")?.value || "all";
  const price = document.querySelector("#priceFilter")?.value || "all";
  const sort = document.querySelector("#sortFilter")?.value || "featured";

  let filtered = products.filter((product) => {
    const searchable = `${product.name} ${product.brand} ${product.sku} ${product.category}`.toLowerCase();
    const effectivePrice = product.salePrice || product.price;
    const [min, max] = price === "all" ? [0, Infinity] : price.split("-").map(Number);

    return (!query || searchable.includes(query))
      && (category === "all" || product.category === category)
      && (brand === "all" || product.brand === brand)
      && (availability === "all" || product.availability === availability)
      && effectivePrice >= min
      && effectivePrice <= max;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sort === "price_asc") return (a.salePrice || a.price) - (b.salePrice || b.price);
    if (sort === "price_desc") return (b.salePrice || b.price) - (a.salePrice || a.price);
    if (sort === "newest") return Number(b.newArrival) - Number(a.newArrival);
    return Number(b.featured) - Number(a.featured);
  });

  return filtered;
}

function renderProducts() {
  const grid = document.querySelector("#productGrid");
  const status = document.querySelector("#productStatus");
  if (!grid) {
    return;
  }

  const visibleProducts = getFilteredProducts();
  if (status) {
    status.textContent = `${visibleProducts.length} product${visibleProducts.length === 1 ? "" : "s"} showing`;
  }

  if (!visibleProducts.length) {
    grid.innerHTML = `<p>No products match those filters.</p>`;
    return;
  }

  grid.innerHTML = visibleProducts.map((product) => {
    const effectivePrice = product.salePrice || product.price;
    const stockLabel = product.availability === "out_of_stock" ? "Out of stock" : `${product.stock} available`;

    return `
      <article class="product-card">
        <div class="product-media">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">
          <span class="product-badge">${escapeHtml(product.category)}</span>
        </div>
        <div class="product-body">
          <div class="product-meta">
            <span>${escapeHtml(product.brand)}</span>
            <span>${escapeHtml(product.sku)}</span>
          </div>
          <h3>${escapeHtml(product.name)}</h3>
          <div class="product-price">
            <strong>${formatKina(effectivePrice)}</strong>
            ${product.salePrice ? `<span>${formatKina(product.price)}</span>` : ""}
          </div>
          <p class="stock-note">${escapeHtml(stockLabel)} - Delivery ${escapeHtml(product.deliveryTime)}</p>
          <div class="product-actions">
            <button class="button button-secondary" type="button" data-view="${escapeHtml(product.sku)}">View</button>
            <button class="button button-primary" type="button" data-add="${escapeHtml(product.sku)}" ${product.availability === "out_of_stock" ? "disabled" : ""}>Add to Cart</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderArrivals() {
  const grid = document.querySelector("#arrivalGrid");
  if (!grid) {
    return;
  }

  const arrivals = products.filter((product) => product.newArrival).slice(0, 3);
  grid.innerHTML = arrivals.map((product) => `
    <article class="arrival-card">
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">
      <div>
        <h3>${escapeHtml(product.name)}</h3>
        <p>${formatKina(product.salePrice || product.price)} - ${escapeHtml(product.category)}</p>
      </div>
    </article>
  `).join("");
}

function addToCart(sku) {
  const product = products.find((item) => item.sku === sku);
  if (!product) {
    return;
  }

  const current = cart.find((item) => item.sku === sku);
  if (current) {
    current.qty += 1;
  } else {
    cart.push({ sku, qty: 1 });
  }

  persistCart();
  document.querySelector("#cartDrawer")?.classList.add("open");
  document.body.classList.add("drawer-open");
}

function changeQuantity(sku, delta) {
  const item = cart.find((cartItem) => cartItem.sku === sku);
  if (!item) {
    return;
  }
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((cartItem) => cartItem.sku !== sku);
  }
  persistCart();
}

function persistCart() {
  localStorage.setItem("robsons_cart", JSON.stringify(cart));
  renderCart();
  renderCheckout();
}

function getCartLines() {
  return cart.map((item) => {
    const product = products.find((candidate) => candidate.sku === item.sku);
    return product ? { ...product, qty: item.qty, lineTotal: (product.salePrice || product.price) * item.qty } : null;
  }).filter(Boolean);
}

function cartSubtotal() {
  return getCartLines().reduce((total, item) => total + item.lineTotal, 0);
}

function getShippingRate() {
  const province = document.querySelector("#provinceSelect")?.value || "Lae";
  const delivery = document.querySelector("#deliverySelect")?.value || "standard";
  const base = shippingRates[province] || shippingRates["Other Province"];
  return cart.length ? base + (delivery === "express" ? 15 : 0) : 0;
}

function renderCart() {
  const cartItems = document.querySelector("#cartItems");
  const cartCount = document.querySelector("#cartCount");
  const cartTotal = document.querySelector("#cartTotal");
  const lines = getCartLines();

  if (cartCount) {
    cartCount.textContent = String(lines.reduce((total, item) => total + item.qty, 0));
  }
  if (cartTotal) {
    cartTotal.textContent = formatKina(cartSubtotal());
  }
  if (!cartItems) {
    return;
  }

  if (!lines.length) {
    cartItems.textContent = "Your cart is empty.";
    return;
  }

  cartItems.innerHTML = lines.map((item) => `
    <article class="cart-line">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
      <div>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${formatKina(item.salePrice || item.price)} each</p>
      </div>
      <div class="qty-control">
        <button type="button" data-qty="${escapeHtml(item.sku)}" data-delta="-1">-</button>
        <strong>${item.qty}</strong>
        <button type="button" data-qty="${escapeHtml(item.sku)}" data-delta="1">+</button>
      </div>
    </article>
  `).join("");
}

function renderCheckout() {
  const checkoutItems = document.querySelector("#checkoutItems");
  const subtotalAmount = document.querySelector("#subtotalAmount");
  const shippingAmount = document.querySelector("#shippingAmount");
  const totalAmount = document.querySelector("#totalAmount");
  const whatsappOrder = document.querySelector("#whatsappOrder");
  const lines = getCartLines();
  const subtotal = cartSubtotal();
  const shipping = getShippingRate();
  const total = subtotal + shipping;

  if (checkoutItems) {
    checkoutItems.innerHTML = lines.length
      ? lines.map((item) => `<div class="checkout-line"><strong>${escapeHtml(item.name)} x ${item.qty}</strong><span>${formatKina(item.lineTotal)}</span></div>`).join("")
      : "Your cart is empty.";
  }
  if (subtotalAmount) subtotalAmount.textContent = formatKina(subtotal);
  if (shippingAmount) shippingAmount.textContent = formatKina(shipping);
  if (totalAmount) totalAmount.textContent = formatKina(total);
  if (whatsappOrder) {
    const orderText = lines.length
      ? `Robsons order:%0A${lines.map((item) => `${item.name} x ${item.qty} - ${formatKina(item.lineTotal)}`).join("%0A")}%0ATotal: ${formatKina(total)}`
      : "Hi Robsons, I would like to place an order.";
    whatsappOrder.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${orderText}`;
  }
}

function renderAdmin() {
  const metricProducts = document.querySelector("#metricProducts");
  const metricLowStock = document.querySelector("#metricLowStock");
  const metricSales = document.querySelector("#metricSales");
  const metricOrders = document.querySelector("#metricOrders");
  const ordersPending = document.querySelector("#ordersPending");
  const inventoryList = document.querySelector("#inventoryList");

  const lowStock = products.filter((product) => product.stock > 0 && product.stock <= 8).length;
  if (metricProducts) metricProducts.textContent = String(products.length);
  if (metricLowStock) metricLowStock.textContent = String(lowStock);
  if (metricSales) metricSales.textContent = formatKina(cartSubtotal());
  if (metricOrders) metricOrders.textContent = cart.length ? "1" : "0";
  if (ordersPending) ordersPending.textContent = cart.length ? "1" : "0";

  if (inventoryList) {
    inventoryList.innerHTML = products.slice(0, 6).map((product) => `
      <div class="inventory-row">
        <span>${escapeHtml(product.name)}</span>
        <strong>${product.stock}</strong>
      </div>
    `).join("");
  }
}

function openProductDialog(sku) {
  const product = products.find((item) => item.sku === sku);
  const dialog = document.querySelector("#productDialog");
  const content = document.querySelector("#productDialogContent");
  if (!product || !dialog || !content) {
    return;
  }

  content.innerHTML = `
    <article class="dialog-product">
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
      <div>
        <p class="eyebrow">${escapeHtml(product.category)}</p>
        <h2>${escapeHtml(product.name)}</h2>
        <div class="product-price">
          <strong>${formatKina(product.salePrice || product.price)}</strong>
          ${product.salePrice ? `<span>${formatKina(product.price)}</span>` : ""}
        </div>
        <p>${escapeHtml(product.description)}</p>
        <p><strong>Stock:</strong> ${product.stock} available</p>
        <p><strong>Delivery:</strong> ${escapeHtml(product.deliveryTime)}</p>
        <p><strong>Colors</strong></p>
        <div class="option-list">${(product.colors.length ? product.colors : ["Default"]).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
        <p><strong>Sizes</strong></p>
        <div class="option-list">${(product.sizes.length ? product.sizes : ["Standard"]).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
        <div class="product-actions">
          <button class="button button-primary" type="button" data-add="${escapeHtml(product.sku)}">Add to Cart</button>
          <a class="button button-whatsapp" href="https://wa.me/${WHATSAPP_NUMBER}?text=Hi Robsons, I want to buy ${encodeURIComponent(product.name)} (${encodeURIComponent(product.sku)})." target="_blank" rel="noopener">Buy Now</a>
        </div>
      </div>
    </article>
  `;
  dialog.showModal();
}

function saveSheetUrl() {
  const input = document.querySelector("#sheetUrlInput");
  const value = input?.value.trim() || "";
  if (value) {
    localStorage.setItem("robsons_sheet_csv_url", value);
  } else {
    localStorage.removeItem("robsons_sheet_csv_url");
  }
  window.location.reload();
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button, a, .category-card");
  if (!target) {
    return;
  }

  if (target.matches("[data-add]")) {
    addToCart(target.dataset.add);
  }
  if (target.matches("[data-view]")) {
    openProductDialog(target.dataset.view);
  }
  if (target.matches("[data-qty]")) {
    changeQuantity(target.dataset.qty, Number(target.dataset.delta));
  }
  if (target.matches(".category-card")) {
    const select = document.querySelector("#categoryFilter");
    if (select) {
      select.value = target.dataset.category;
      renderProducts();
      document.querySelector("#shop")?.scrollIntoView({ behavior: "smooth" });
    }
  }
  if (target.id === "cartButton") {
    document.querySelector("#cartDrawer")?.classList.add("open");
    document.body.classList.add("drawer-open");
  }
  if (target.id === "closeCart" || target.id === "checkoutLink") {
    document.querySelector("#cartDrawer")?.classList.remove("open");
    document.body.classList.remove("drawer-open");
  }
  if (target.id === "closeProductDialog") {
    document.querySelector("#productDialog")?.close();
  }
  if (target.id === "saveSheetUrl") {
    saveSheetUrl();
  }
  if (target.matches(".menu-toggle")) {
    const navLinks = document.querySelector("#navLinks");
    navLinks?.classList.toggle("open");
    target.setAttribute("aria-expanded", String(navLinks?.classList.contains("open")));
  }
});

["searchInput", "categoryFilter", "priceFilter", "brandFilter", "availabilityFilter", "sortFilter"].forEach((id) => {
  document.addEventListener("input", (event) => {
    if (event.target.id === id) {
      renderProducts();
    }
  });
});

["provinceSelect", "deliverySelect"].forEach((id) => {
  document.addEventListener("change", (event) => {
    if (event.target.id === id) {
      renderCheckout();
    }
  });
});

document.querySelector("#checkoutForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const lines = getCartLines();
  const total = cartSubtotal() + getShippingRate();
  const orderText = [
    "Robsons order",
    `Name: ${form.get("fullName")}`,
    `Phone: ${form.get("phone")}`,
    `Province: ${form.get("province")}`,
    `District: ${form.get("district")}`,
    `Address: ${form.get("address")}`,
    `Payment: ${form.get("payment")}`,
    ...lines.map((item) => `${item.name} x ${item.qty} - ${formatKina(item.lineTotal)}`),
    `Total: ${formatKina(total)}`
  ].join("\n");
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderText)}`, "_blank", "noopener");
});

loadProducts();
