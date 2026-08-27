export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export const useCart = () => {
  // Manejamos el estado global del carrito con useState de Nuxt
  const cartItems = useState<CartItem[]>('cart', () => []);

  const addToCart = (item: CartItem) => {
    const existing = cartItems.value.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cartItems.value.push({ ...item });
    }
    // TODO: Emitir a la API del backend para guardar en PostgreSQL (más adelante)
  };

  const removeFromCart = (itemId: string | number) => {
    cartItems.value = cartItems.value.filter(i => i.id !== itemId);
  };

  const updateQuantity = (itemId: string | number, quantity: number) => {
    const item = cartItems.value.find(i => i.id === itemId);
    if (item) {
      if (quantity <= 0) {
        removeFromCart(itemId);
      } else {
        item.quantity = quantity;
      }
    }
  };

  const clearCart = () => {
    cartItems.value = [];
  };

  const cartTotal = computed(() => {
    return cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0);
  });

  const cartItemsCount = computed(() => {
    return cartItems.value.reduce((count, item) => count + item.quantity, 0);
  });

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartItemsCount
  };
};
