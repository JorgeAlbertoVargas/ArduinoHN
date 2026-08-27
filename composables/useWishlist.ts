import { ref, onMounted, watch } from 'vue';

export interface WishlistItem {
  id: string; // product id (local-xx or shopify-id)
  title: string;
  price: number;
  image: string;
}

export const useWishlist = () => {
  const wishlistItems = ref<WishlistItem[]>([]);

  // Cargar de LocalStorage al iniciar
  onMounted(() => {
    const stored = localStorage.getItem('arduino_hn_wishlist');
    if (stored) {
      try {
        wishlistItems.value = JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing wishlist from localStorage');
      }
    }
  });

  // Guardar en LocalStorage cuando cambie
  watch(wishlistItems, (newVal) => {
    localStorage.setItem('arduino_hn_wishlist', JSON.stringify(newVal));
  }, { deep: true });

  const toggleWishlist = (item: WishlistItem) => {
    const index = wishlistItems.value.findIndex(i => i.id === item.id);
    if (index > -1) {
      // Remover si ya existe
      wishlistItems.value.splice(index, 1);
      return false; // Indica que se removió
    } else {
      // Añadir si no existe
      wishlistItems.value.push(item);
      return true; // Indica que se añadió
    }
  };

  const isInWishlist = (id: string) => {
    return wishlistItems.value.some(i => i.id === id);
  };

  return {
    wishlistItems,
    toggleWishlist,
    isInWishlist
  };
};
