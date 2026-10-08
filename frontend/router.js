import home, { fetchProducts } from "./pages/home.js";
import cartPage, { setupCartEvents } from "./pages/cart.js";

function router() {
  const app = document.querySelector("#app");
  if (!app) return;

  const page = location.hash;

  if (page === "#cart") {
    app.innerHTML = cartPage();
    setupCartEvents(); // Körs för att koppla "Ta bort"-knapparna
  } else {
    app.innerHTML = home();
    fetchProducts(); // Hämtar produkterna när man är på startsidan
  }
}

window.onhashchange = router;
window.onload = router;