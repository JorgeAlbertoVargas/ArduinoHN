<template>
  <div class="admin-container">
    <div class="admin-header-row">
      <h1 class="admin-title">Configuración de Lealtad</h1>
      <NuxtLink to="/" class="btn btn-accent">Volver a la Tienda</NuxtLink>
    </div>

    <div v-if="errorMsg" class="alert alert-error">
      {{ errorMsg }}
    </div>

    <div v-if="successMsg" class="alert alert-success">
      {{ successMsg }}
    </div>

    <div v-if="isLoading" class="loading-state">
      Cargando configuración...
    </div>

    <div v-else class="config-card glass">
      <h2>Sistema de Puntos</h2>
      <div class="form-group">
        <label>Lempiras requeridos para ganar 1 punto:</label>
        <input type="number" v-model="config.earnRate" class="form-control" />
        <small class="text-muted">Ejemplo: Si pones 100, una compra de L. 500 otorgará 5 puntos.</small>
      </div>

      <div class="form-group mt-3">
        <label>Valor de 1 punto en Lempiras (Descuento):</label>
        <input type="number" v-model="config.redemptionValue" class="form-control" />
        <small class="text-muted">Ejemplo: Si pones 1, entonces 50 puntos = L. 50 de descuento.</small>
      </div>

      <hr class="divider" />

      <h2>Moneda y Referencias</h2>
      <div class="form-group">
        <label>Tasa de Cambio (Lempiras por 1 USD):</label>
        <input type="number" step="0.01" v-model="config.exchangeRate" class="form-control" />
        <small class="text-muted">Ejemplo: Si pones 24.85, se usará este valor para mostrar los precios en Dólares en toda la tienda.</small>
      </div>

      <hr class="divider" />

      <h2>Sistema de Niveles (Opción 3)</h2>
      <div class="form-group toggle-group">
        <label class="toggle-switch">
          <input type="checkbox" v-model="config.enableTiers">
          <span class="slider round"></span>
        </label>
        <span>Habilitar beneficios por niveles (Bronce, Plata, Oro)</span>
      </div>

      <div v-if="config.enableTiers" class="tiers-config">
        <div class="tier-box">
          <h3>Nivel Plata</h3>
          <div class="form-group">
            <label>Gasto histórico requerido (L.):</label>
            <input type="number" v-model="config.tiers.silverThreshold" class="form-control" />
          </div>
          <div class="form-group">
            <label>Descuento automático (%):</label>
            <input type="number" v-model="config.tiers.silverDiscount" class="form-control" />
          </div>
        </div>
        <div class="tier-box">
          <h3>Nivel Oro</h3>
          <div class="form-group">
            <label>Gasto histórico requerido (L.):</label>
            <input type="number" v-model="config.tiers.goldThreshold" class="form-control" />
          </div>
          <div class="form-group">
            <label>Descuento automático (%):</label>
            <input type="number" v-model="config.tiers.goldDiscount" class="form-control" />
          </div>
        </div>
      </div>

      <button class="btn btn-primary mt-4 w-full save-btn" @click="saveConfig" :disabled="isSaving">
        {{ isSaving ? 'Guardando...' : 'Guardar Configuración' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const { isAdmin, fetchUser } = useAuth()
const router = useRouter()

const config = ref({
  earnRate: 100,
  redemptionValue: 1,
  exchangeRate: 25,
  enableTiers: false,
  tiers: {
    silverThreshold: 5000,
    silverDiscount: 5,
    goldThreshold: 20000,
    goldDiscount: 10
  }
})

const isLoading = ref(true)
const isSaving = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

onMounted(async () => {
  await fetchUser()
  if (!isAdmin.value) {
    router.push('/')
    return
  }
  await fetchConfig()
})

const fetchConfig = async () => {
  isLoading.value = true
  try {
    const data = await $fetch<any>('/api/admin/loyalty')
    if (data) {
      config.value = data
    }
  } catch (e) {
    errorMsg.value = 'Error al cargar configuración.'
  } finally {
    isLoading.value = false
  }
}

const saveConfig = async () => {
  isSaving.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await $fetch('/api/admin/loyalty', {
      method: 'POST',
      body: config.value
    })
    successMsg.value = 'Configuración guardada correctamente.'
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (e) {
    errorMsg.value = 'Error al guardar.'
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.admin-container {
  max-width: 800px;
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
.config-card {
  padding: 30px;
  border-radius: 12px;
  background-color: var(--bg-card);
}
h2 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-main);
}
.form-control {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid var(--glass-border);
  background-color: var(--bg-main);
  color: var(--text-main);
  border-radius: 8px;
}
.text-muted {
  color: var(--text-muted);
  display: block;
  margin-top: 4px;
}
.divider {
  margin: 30px 0;
  border: none;
  border-top: 1px solid var(--glass-border);
}
.toggle-group {
  display: flex;
  align-items: center;
  gap: 15px;
}
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}
.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}
.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}
input:checked + .slider {
  background-color: var(--color-primary);
}
input:checked + .slider:before {
  transform: translateX(26px);
}
.slider.round {
  border-radius: 34px;
}
.slider.round:before {
  border-radius: 50%;
}
.tiers-config {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}
.tier-box {
  padding: 15px;
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  background: var(--bg-main);
}
.tier-box h3 {
  margin-bottom: 15px;
  color: var(--text-main);
  font-size: 1.2rem;
}
.w-full {
  width: 100%;
}
.save-btn {
  padding: 12px;
  font-size: 1.1rem;
}
.alert {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}
.alert-error {
  background-color: #ffebee;
  color: #c62828;
}
.alert-success {
  background-color: #e8f5e9;
  color: #2e7d32;
}
</style>
