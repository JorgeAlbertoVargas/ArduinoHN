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
  sku?: string;
}

export const useCart = () => {
  // Almacenamos el ID del carrito en una cookie para persistir la sesión
  const cartId = useCookie('shopify_cart_id');
  const checkoutUrl = useCookie<string>('shopify_checkout_url', { default: () => '' });
  
  // Para la simulación, mantenemos el estado de los items localmente
  const cartItems = useState<CartItem[]>('cart', () => []);

  // Sincronizar el carrito local con localStorage para que sobreviva recargas de página
  if (import.meta.client) {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('order_completed') === 'true') {
      // El usuario regresó de un pago exitoso
      localStorage.removeItem('arduino_cart_items');
      sessionStorage.removeItem('arduino_cart_backup');
      cartItems.value = [];
      
      // Limpiar la URL sin recargar la página para que quede limpia
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      // Carga normal o restauración si le dieron al botón "Atrás" en el checkout
      const storedCart = localStorage.getItem('arduino_cart_items');
      const backupCart = sessionStorage.getItem('arduino_cart_backup');
      
      if (!storedCart && backupCart) {
        // Restauración por botón Atrás (localStorage se limpió al ir al checkout, pero sessionStorage sobrevivió en esta pestaña)
        try {
          cartItems.value = JSON.parse(backupCart);
          localStorage.setItem('arduino_cart_items', backupCart);
        } catch (e) {
          console.error('Error restaurando backup del carrito', e);
        }
      } else if (storedCart) {
        try {
          cartItems.value = JSON.parse(storedCart);
        } catch (e) {
          console.error('Error parseando carrito de localStorage', e);
        }
      }
    }
    
    // Manejar navegaciones de tipo BFCache (cuando regresan con el botón Atrás sin recargar la página)
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        const backupCart = sessionStorage.getItem('arduino_cart_backup');
        if (backupCart && cartItems.value.length === 0) {
          try {
            cartItems.value = JSON.parse(backupCart);
            localStorage.setItem('arduino_cart_items', backupCart);
          } catch(e) {}
        }
      }
    });
    
    watch(() => cartItems.value, (newVal) => {
      localStorage.setItem('arduino_cart_items', JSON.stringify(newVal));
    }, { deep: true });
  }

  const createCartIfNeeded = async () => {
    if (!cartId.value || !checkoutUrl.value) {
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
          userErrors {
            field
            message
          }
        }
      }
    `;
    try {
      const response = await shopifyFetch({ 
        query: mutation, 
        variables: { 
          cartId: cartId.value, 
          lines: [{ merchandiseId: item.id, quantity: item.quantity }] 
        } 
      });
      console.log('cartLinesAdd response:', JSON.stringify(response));
    } catch (e) {
      console.error('Error adding to cart API:', e);
    }
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

  const applyDiscountCode = async (code: string) => {
    if (!cartId.value) return;
    const mutation = `
      mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
        cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
          cart { id }
        }
      }
    `;
    await shopifyFetch({
      query: mutation,
      variables: {
        cartId: cartId.value,
        discountCodes: [code]
      }
    });
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
    checkoutUrl,
    applyDiscountCode
  };
};
