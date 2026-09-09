<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Productos Directos de Odoo
        </h1>
        <p class="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
          Esta vista lee el inventario en tiempo real usando nuestra conexión JSON-RPC.
        </p>
      </div>

      <div v-if="pending" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
      
      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/30 p-4 rounded-md">
        <p class="text-red-700 dark:text-red-400 text-center">
          Error cargando productos: {{ error.message }}
        </p>
      </div>

      <div v-else-if="!products || products.length === 0" class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400 text-lg">No se encontraron productos en Odoo.</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="product in products" :key="product.id" class="relative">
          <!-- Badge de stock encima de la tarjeta para Odoo -->
          <div class="absolute top-2 left-2 z-10">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm" 
                  :class="product.qty_available > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
              Stock: {{ product.qty_available !== undefined ? product.qty_available : '?' }}
            </span>
          </div>
          <div class="absolute top-2 right-2 z-10">
             <span v-if="product.default_code" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm bg-blue-100 text-blue-800">
               {{ product.default_code }}
             </span>
          </div>

          <ProductCard 
            :id="product.id.toString()"
            :title="product.name"
            :price="product.list_price"
            image="" 
            @add-to-cart="console.log('Add to cart', product.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProductCard from '~/components/ProductCard.vue'

const { data, pending, error } = await useFetch('/api/odoo-products')

const products = computed(() => {
  if (data.value && data.value.success) {
    return data.value.products
  }
  return []
})
</script>
