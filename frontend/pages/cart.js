import { cart, removeFromCart } from "../cart-status.js";

export default function cartPage() {
  if (cart.length === 0) {
    return `
      <section>
        <h2>Varukorg</h2>
        <p>Din varukorg är tom. Det är svårt att tänka med tom vagn. Och tom mage.</p>
      </section>
    `;
  }

  let cartItemsHtml = "";
  let totalSum = 0;

  cart.forEach(item => {
    const itemTotal = item.product.price * item.quantity;
    totalSum += itemTotal;

    cartItemsHtml += `
      <article class="cart-item" id="item-${item.product.id}">
        <p><strong>${item.product.name}</strong></p>
        <p>Pris: ${item.product.price} kr | Antal: ${item.quantity} | Delsumma: ${itemTotal} kr</p>
        <button class="delete-btn" data-id="${item.product.id}">Ta bort</button>
      </article>
    `;
  });

  return `
    <section>
      <h2>Varukorg</h2>
      <div id="cart-list">
        ${cartItemsHtml}
      </div>

      <h3 id="total-sum">Totalsumma: ${totalSum} kr</h3>

      <h2>Beställning</h2>
      <p id="error-message" class="error-text"></p>
      <form id="order-form">
        <div>
          <label for="customer-name">Namn:</label>
          <input type="text" id="customer-name" required>
        </div>
        <div>
          <label for="customer-email">E-post:</label>
          <input type="email" id="customer-email" required placeholder="namn@doman.se">
        </div>
        <div>
          <label for="customer-phone">Mobilnummer:</label>
          <input type="tel" id="customer-phone" minlength="10" maxlength="12" required placeholder="0701234567">
        </div>
        <div>
          <label for="customer-address">Leveransadress:</label>
          <input type="text" id="customer-address" required>
        </div>
        <button type="submit">Skicka beställning</button>
      </form>
    </section>
  `;
}

export function setupCartEvents() {
  // 1. Delete Item Event Listener
  const cartList = document.querySelector("#cart-list");
  if (cartList) {
    cartList.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) {
        const productId = Number(e.target.dataset.id);

        removeFromCart(productId);

        const itemElement = document.querySelector(`#item-${productId}`);
        if (itemElement) {
          itemElement.remove();
        }

        updateTotalSum();
      }
    });
  }

  // 2. Submit Order Event Listener 
  const orderForm = document.querySelector("#order-form");
  if (orderForm) {
    orderForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const phoneInput = document.querySelector("#customer-phone").value.trim();
      const emailInput = document.querySelector("#customer-email").value.trim();
      const errorMsg = document.querySelector("#error-message");

      if (errorMsg) errorMsg.textContent = "";

      // Manual validations 
      if (isNaN(phoneInput) || phoneInput.length < 10 || phoneInput.length > 12) {
        if (errorMsg) errorMsg.textContent = "Mobilnummer måste bestå av endast siffror och vara mellan 10 och 12 tecken.";
        return;
      }

      if (!emailInput.includes("@") || !emailInput.includes(".")) {
        if (errorMsg) errorMsg.textContent = "Vänligen ange en giltig e-postadress.";
        return;
      }

      const orderData = {
        name: document.querySelector("#customer-name").value,
        email: emailInput,
        mobile: phoneInput,
        delivery_address: document.querySelector("#customer-address").value,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.price
        }))
      };

      const response = await fetch("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      document.querySelector("#app").innerHTML = `
        <section>
          <h2>Orderbekräftelse</h2>
          <p>Tack för din beställning, ${orderData.name}! Medan du väntar på din beställning, varför inte prova att sjunga lite karaoke? Det gör stunden ännu bättre!</p>
          <p>Ditt ordernummer är: <strong>#${result.orderId}</strong></p>
        </section>
      `;

      cart.length = 0;
    });
  }
}

function updateTotalSum() {
  const totalSumElement = document.querySelector("#total-sum");
  if (!totalSumElement) return;

  if (cart.length === 0) {
    document.querySelector("#app").innerHTML = `
      <section>
        <h2>Varukorg</h2>
        <p>Din varukorg är tom. Det är svårt att tänka med tom vagn. Och tom mage.</p>
      </section>
    `;
  } else {
    const newTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    totalSumElement.textContent = `Totalsumma: ${newTotal} kr`;
  }
}