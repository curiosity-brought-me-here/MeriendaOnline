export let cart = [];

export function addToCart(product, quantity) {
  const existingItem = cart.find(item => item.product.id === product.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }
}

export function removeFromCart(productId) {
  const index = cart.findIndex(item => item.product.id === productId);
  if (index !== -1) {
    cart.splice(index, 1);
  }
}