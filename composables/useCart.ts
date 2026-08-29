import { shopifyFetch } from '~/utils/shopify';

export interface CartItem {
  id: string; // Variante ID en Shopify
  name: string;
  price: number;
  quantity: number;
  image?: string;
  lineId?: string; // ID de la línea en el carrito de Shopify
  originalPrice?: number;
  discountPercent?: number;
}

export const useCart = () => {
  // Almacenamos el ID del carrito en una cookie para persistir la sesión
  const cartId = useCookie('shopify_cart_id');
  const checkoutUrl = useState<string>('checkout_url', () => '');
  
  // Para la simulación, mantenemos el estado de los items localmente
  const cartItems = useState<CartItem[]>('cart', () => []);

  const createCartIfNeeded = async () => {
    if (!cartId.value) {
      const query = `
        mutation {
          cartCreate {
            cart {
              id
              checkoutUrl
            }
          }
        }
      `;
      try {
        const response = await shopifyFetch({ query });
        const cart = response?.data?.cartCreate?.cart;
        if (cart) {
          cartId.value = cart.id;
          checkoutUrl.value = cart.checkoutUrl;
        }
      } catch (e) {
        console.error('Error al crear carrito:', e);
      }
    }
  };

  const addToCart = async (item: CartItem) => {
    await createCartIfNeeded();
    
    // Simulación de guardado local
    const existing = cartItems.value.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cartItems.value.push({ ...item });
    }

    // Mutación simulada para agregar líneas al carrito de Shopify
    const mutation = `
      mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart { id }
        }
      }
    `;
    await shopifyFetch({ 
      query: mutation, 
      variables: { 
        cartId: cartId.value, 
        lines: [{ merchandiseId: item.id, quantity: item.quantity }] 
      } 
    });
  };

  const removeFromCart = async (itemId: string) => {
    cartItems.value = cartItems.value.filter(i => i.id !== itemId);
    
    // Mutación simulada de remover línea (requeriría el lineId real en un entorno de producción)
    const mutation = `
      mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart { id }
        }
      }
    `;
    await shopifyFetch({ query: mutation, variables: { cartId: cartId.value, lineIds: [itemId] } });
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const item = cartItems.value.find(i => i.id === itemId);
    if (item) {
      if (quantity <= 0) {
        await removeFromCart(itemId);
      } else {
        item.quantity = quantity;
      }
    }
    
    // Mutación simulada para actualizar líneas
    const mutation = `
      mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart { id }
        }
      }
    `;
    // await shopifyFetch(...)
  };

  const clearCart = () => {
    cartItems.value = [];
    cartId.value = null; 
    checkoutUrl.value = '';
  };

  const cartTotal = computed(() => {
    return cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0);
  });

  const cartSavings = computed(() => {
    return cartItems.value.reduce((total, item) => {
      if (item.originalPrice) {
        return total + ((item.originalPrice - item.price) * item.quantity);
      }
      return total;
    }, 0);
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
    cartSavings,
    cartItemsCount,
    checkoutUrl
  };
};
