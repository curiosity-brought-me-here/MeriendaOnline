import { addToCart } from "../cart-status.js";

export default function home() {
  return `
    <section class="hero">
      <h1>Merienda Online</h1>
      <p class="subtitle">Söta eftermiddagsgodbitarna som du förtjänar</p>
    </section>
    <section class="menu">
      <h2>Vår Meny</h2>
      <div id="product-list" class="product-grid">
        <p>Laddar produkter...</p>
      </div>
    </section>
  `;
}

export async function fetchProducts() {
  const productList = document.querySelector("#product-list");

  try {
    const response = await fetch("http://localhost:3000/api/products");

    // Check if the server responded with an error status (like 500)
    if (!response.ok) {
      let errorMessage = "Det är inte dig, det är databasens issue. Ta det lugnt. Sjunga lite karaoke och försök igen senare.";

      // Try reading JSON error if available
      try {
        const errorData = await response.json();
        if (errorData.error) errorMessage = errorData.error;
      } catch (jsonErr) {
        // Fallback if backend returned non-JSON/HTML on crash
      }

      if (productList) {
        productList.innerHTML = `<p class="error-text">${errorMessage}</p>`;
      }
      return;
    }

    const products = await response.json();

    // Build and render HTML for products
    let html = "";
    products.forEach(product => {
      html += `
        <article class="product-card">
          <img src="images/${product.image_url}" alt="${product.image_alt}">
          <h3>${product.name}</h3>
          <p class="description">${product.description}</p>
          <p class="price">${product.price} kr</p>
          <div class="card-actions">
            <input type="number" id="qty-${product.id}" value="1" min="1">
            <button class="add-btn" data-id="${product.id}">Lägg till</button>
          </div>
        </article>
      `;
    });

    if (productList) {
      productList.innerHTML = html;

      // Event listeners for Add to Cart buttons
      productList.querySelectorAll(".add-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const id = Number(e.target.dataset.id);
          const product = products.find(p => p.id === id);
          const qtyInput = document.querySelector(`#qty-${id}`);
          const quantity = Number(qtyInput.value);

          addToCart(product, quantity);

          e.target.textContent = "Tillagd! ✓";
          e.target.classList.add("added");
        });
      });
    }
  } catch (netErr) {
    // Catches complete server drops/connection failures
    if (productList) {
      productList.innerHTML = `<p class="error-text">Det är inte dig, det är databasens issue. Ta det lugnt. Sjunga lite karaoke och försök igen senare.</p>`;
    }
  }
}