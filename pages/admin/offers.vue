<template>
  <div class="admin-container">
    <div class="admin-header-row">
      <h1 class="admin-title">Gestión de Ofertas del Mes</h1>
      <NuxtLink to="/admin/users" class="btn btn-accent">Ver Usuarios</NuxtLink>
    </div>

    <div v-if="errorMsg" class="alert alert-error">
      {{ errorMsg }}
    </div>
    <div v-if="successMsg" class="alert alert-success">
      {{ successMsg }}
    </div>

    <div class="admin-card glass">
      <div class="card-header">
        <h3>Seleccionar Productos en Oferta</h3>
        <button class="btn btn-primary" @click="saveOffersData" :disabled="isSaving">
          {{ isSaving ? 'Guardando...' : 'Guardar Ofertas' }}
        </button>
      </div>
      
      <div v-if="pending" class="loading-state">
        Cargando catálogo...
      </div>
      
      <div v-else class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>En Oferta</th>
              <th>Producto</th>
              <th>Origen</th>
              <th>Precio Original</th>
              <th>Descuento</th>
              <th>Precio Final</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in allProducts" :key="p.id">
              <td class="text-center">
                <input 
                  type="checkbox" 
                  class="offer-checkbox"
                  :checked="isProductInOffer(p.id)"
                  @change="toggleOffer(p.id, $event.target.checked)"
                />
              </td>
              <td>
                <div class="fw-bold">{{ p.title }}</div>
                <div class="text-muted small">ID: {{ p.id }}</div>
              </td>
              <td>
                <span :class="['badge', 'badge-' + p.source]">
                  {{ p.source.toUpperCase() }}
                </span>
              </td>
              <td>{{ p.price.toFixed(2) }} Lps</td>
              <td>
                <select 
                  v-if="isProductInOffer(p.id)"
                  :value="getDiscount(p.id)" 
                  @change="updateDiscount(p.id, Number($event.target.value))"
                  class="form-control select-sm"
                >
                  <option :value="5">5%</option>
                  <option :value="10">10%</option>
                  <option :value="15">15%</option>
                  <option :value="20">20%</option>
                  <option :value="25">25%</option>
                  <option :value="30">30%</option>
                  <option :value="40">40%</option>
                  <option :value="50">50%</option>
                </select>
                <span v-else class="text-muted">-</span>
              </td>
              <td class="fw-bold text-accent">
                <template v-if="isProductInOffer(p.id)">
                  {{ (p.price * (1 - (getDiscount(p.id) / 100))).toFixed(2) }} Lps
                </template>
                <template v-else>-</template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useProducts } from '~/composables/useProducts'

const { isAdmin, fetchUser } = useAuth()
const router = useRouter()
const { allProducts, pending } = useProducts()

const offersMap = ref<Record<string, { discount: number }>>({})
const errorMsg = ref('')
const successMsg = ref('')
const isSaving = ref(false)

onMounted(async () => {
  await fetchUser() // Ensure user is fetched on hard reload
  if (!isAdmin.value) {
    router.push('/')
    return
  }
  await fetchOffers()
})

const fetchOffers = async () => {
  try {
    const data = await $fetch<Record<string, { discount: number }>>('/api/admin/offers')
    offersMap.value = data || {}
  } catch (error: any) {
    errorMsg.value = 'Error al cargar configuración de ofertas.'
  }
}

const isProductInOffer = (id: string) => {
  return !!offersMap.value[id]
}

const getDiscount = (id: string) => {
  return offersMap.value[id]?.discount || 10
}

const toggleOffer = (id: string, checked: boolean) => {
  if (checked) {
    offersMap.value[id] = { discount: 10 } // Default to 10%
  } else {
    delete offersMap.value[id]
  }
}

const updateDiscount = (id: string, discount: number) => {
  if (offersMap.value[id]) {
    offersMap.value[id].discount = discount
  }
}

const saveOffersData = async () => {
  isSaving.value = true
  errorMsg.value = ''
  successMsg.value = ''
  
  try {
    const response = await $fetch<{ success: boolean }>('/api/admin/offers', {
      method: 'PUT',
      body: offersMap.value
    })
    
    if (response.success) {
      successMsg.value = 'Ofertas guardadas correctamente.'
      setTimeout(() => { successMsg.value = '' }, 3000)
    }
  } catch (error: any) {
    errorMsg.value = 'Error al guardar ofertas.'
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 200px);
}
.admin-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}
.admin-title {
  color: var(--text-main);
  font-size: 2rem;
}
.admin-card {
  background-color: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--glass-border);
}
.card-header h3 { margin: 0; font-size: 1.25rem; color: var(--text-main); }
.table-container { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 16px 24px; text-align: left; border-bottom: 1px solid var(--glass-border); }
.data-table th { background-color: var(--color-primary); color: white; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
.data-table tbody tr:nth-child(even) { background-color: rgba(0, 0, 0, 0.02); }
.data-table tbody tr:hover { background-color: rgba(0, 151, 156, 0.06); }
.fw-bold { font-weight: 600; color: var(--text-main); }
.text-muted { color: var(--text-muted); }
.small { font-size: 0.85rem; }
.text-center { text-align: center; }
.loading-state { padding: 40px; text-align: center; color: var(--text-muted); }
.badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em; }
.badge-local { background-color: rgba(46, 125, 50, 0.1); color: #2e7d32; }
.badge-shopify { background-color: rgba(0, 151, 156, 0.1); color: var(--color-primary); }
.form-control { padding: 6px 10px; border: 1px solid var(--glass-border); background-color: var(--bg-main); color: var(--text-main); border-radius: 6px; font-family: var(--font-family); }
.offer-checkbox { width: 18px; height: 18px; cursor: pointer; accent-color: var(--color-primary); }
.text-accent { color: var(--color-primary); font-size: 1.1rem; }
.alert { padding: 16px; border-radius: 8px; margin-bottom: 24px; font-weight: 500; }
.alert-error { background-color: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
.alert-success { background-color: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
</style>
