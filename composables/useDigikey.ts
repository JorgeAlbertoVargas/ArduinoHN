import { ref } from 'vue';
import { useCart } from '~/composables/useCart';
import { useToast } from '~/composables/useToast';
import { useGlobalCurrencyConfig } from '~/composables/useGlobalCurrencyConfig';

export interface DigikeyPriceBreak {
  breakQuantity: number;
  unitPriceUSD: number;
  totalPriceUSD: number;
}

export interface DigikeyParameter {
  id: number;
  name: string;
  value: string;
}

export interface DigikeyProduct {
  id: string;
  digiKeyPartNumber: string;
  manufacturerPartNumber: string;
  title: string;
  description: string;
  detailedDescription?: string;
  manufacturer: string;
  category: string;
  series?: string;
  family?: string;
  status: string;
  stock: number;
  inStock: boolean;
  basePriceUSD: number;
  priceUSD: number;
  priceBreaks: DigikeyPriceBreak[];
  image: string;
  datasheetUrl?: string | null;
  productUrl?: string | null;
  parameters: DigikeyParameter[];
  packaging?: string;
  rohsStatus?: string;
  leadTimeWeeks?: number | null;
  minimumOrderQuantity?: number;
}

export interface DigikeySearchResponse {
  success: boolean;
  totalCount: number;
  limit: number;
  offset: number;
  products: DigikeyProduct[];
  error?: string;
}

export const SEMICONDUCTOR_CATEGORIES = [
  { id: 'microcontrollers', name: 'Microcontroladores & MCUs', query: 'Microcontroller', icon: 'cpu' },
  { id: 'ics', name: 'Circuitos Integrados (ICs)', query: 'Integrated Circuit', icon: 'layers' },
  { id: 'mosfets', name: 'MOSFETs & Transistores', query: 'MOSFET', icon: 'zap' },
  { id: 'sensors', name: 'Sensores Industriales & MEMS', query: 'Sensor', icon: 'activity' },
  { id: 'pmic', name: 'Reguladores & PMIC', query: 'Voltage Regulator', icon: 'battery-charging' },
  { id: 'rf', name: 'Módulos RF & Conectividad', query: 'RF Transceiver', icon: 'wifi' },
  { id: 'diodes', name: 'Diodos & Rectificadores', query: 'Diode', icon: 'shield' },
  { id: 'passives', name: 'Pasivos de Precisión SMD', query: 'Resistor SMD', icon: 'grid' }
];

export const useDigikey = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const cart = useCart();
  const toast = useToast();
  const { exchangeRate } = useGlobalCurrencyConfig();

  /**
   * Convierte un precio USD al tipo de cambio actual en HNL (Lempiras)
   */
  const convertToHNL = (priceUSD: number): number => {
    const rate = exchangeRate.value || 25;
    return Number((priceUSD * rate).toFixed(2));
  };

  /**
   * Búsqueda en catálogo DigiKey
   */
  const searchParts = async (
    keyword: string,
    options: {
      limit?: number;
      offset?: number;
      inStockOnly?: boolean;
    } = {}
  ): Promise<DigikeySearchResponse> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<DigikeySearchResponse>('/api/digikey/search', {
        query: {
          q: keyword || 'STM32',
          limit: options.limit || 20,
          offset: options.offset || 0,
          inStockOnly: options.inStockOnly ? 'true' : 'false'
        }
      });

      if (!response.success && response.error) {
        error.value = response.error;
      }
      return response;
    } catch (err: any) {
      const msg = err?.data?.statusMessage || err?.message || 'Error al buscar en DigiKey';
      error.value = msg;
      return {
        success: false,
        totalCount: 0,
        limit: options.limit || 20,
        offset: options.offset || 0,
        products: [],
        error: msg
      };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Obtener detalle de un producto específico
   */
  const getPartDetails = async (partNumber: string): Promise<DigikeyProduct | null> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<{ success: boolean; product: DigikeyProduct }>(
        `/api/digikey/part/${encodeURIComponent(partNumber)}`
      );
      if (response && response.product) {
        return response.product;
      }
      return null;
    } catch (err: any) {
      error.value = err?.data?.statusMessage || err?.message || 'Error al obtener componente';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const addToCart = async (product: DigikeyProduct, quantity: number = 1) => {
    const unitPriceHNL = convertToHNL(product.priceUSD);
    const finalQuantity = Math.max(quantity, product.minimumOrderQuantity || 1);
    
    toast.showToast('Sincronizando con Shopify...', 'info');
    loading.value = true;
    
    try {
      const sku = product.digiKeyPartNumber || product.manufacturerPartNumber;
      
      // 0. Verificar si el producto ya está en el carrito local por SKU
      // Esto evita crear duplicados en Shopify si el usuario da múltiples clics rápidos
      // antes de que el buscador de Shopify indexe el producto creado.
      const existingCartItem = cart.cartItems.value.find(item => item.sku === sku);
      
      let variantIdToUse = '';
      
      if (existingCartItem) {
        // Si ya existe, reutilizamos el Variant ID que ya teníamos
        variantIdToUse = existingCartItem.id;
      } else {
        // 1. Si no existe en el carrito, sincronizamos con Shopify y obtenemos el Variant ID
        const syncResponse = await $fetch<{ success: boolean; variantId: string }>('/api/digikey/sync', {
          method: 'POST',
          body: {
            partNumber: sku,
            productData: product,
            priceHNL: unitPriceHNL
          }
        });

        if (!syncResponse || !syncResponse.variantId) {
          throw new Error('No se recibió el Variant ID de Shopify');
        }
        
        variantIdToUse = syncResponse.variantId;
      }

      // 2. Agregar al carrito (useCart se encargará de incrementar cantidad si ya existe por ID)
      await cart.addToCart({
        id: variantIdToUse,
        name: `[ArduinoHN Global] ${product.manufacturerPartNumber} - ${product.title}`,
        price: unitPriceHNL,
        quantity: finalQuantity,
        image: product.image,
        originalPrice: unitPriceHNL,
        sku: sku
      });

      toast.showToast(`Se agregaron ${finalQuantity} unidades al carrito.`);
    } catch (err: any) {
      console.error('Error sincronizando al carrito:', err);
      error.value = err?.message || 'Error al conectar con Shopify';
      toast.showToast('Error al procesar el producto para compra.', 'error');
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    convertToHNL,
    searchParts,
    getPartDetails,
    addToCart,
    categories: SEMICONDUCTOR_CATEGORIES
  };
};
