<template>
  <div class="admin-audit-container">
    <!-- Breadcrumbs & Header -->
    <div class="admin-header-row">
      <div>
        <div class="admin-breadcrumb">
          <NuxtLink to="/admin/users">Administración</NuxtLink>
          <span class="separator">/</span>
          <span>Usuarios & Seguridad</span>
          <span class="separator">/</span>
          <span class="current">Auditoría de Seguridad</span>
        </div>
        <h1 class="audit-title">Registro y Bitácora de Auditoría de Seguridad</h1>
        <p class="audit-subtitle">Historial inmutable de cambios de privilegios, modificaciones de roles y accesos administrativos en ArduinoHN.</p>
      </div>

      <div class="header-actions">
        <NuxtLink to="/admin/users" class="btn btn-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>Gestión de Usuarios</span>
        </NuxtLink>
        <button class="btn btn-outline" @click="fetchLogs" :disabled="isLoading">
          <svg :class="{ 'rotating': isLoading }" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          <span>{{ isLoading ? 'Actualizando...' : 'Refrescar Historial' }}</span>
        </button>
      </div>
    </div>

    <!-- Security Metric Stats -->
    <div class="audit-stats-grid">
      <div class="stat-card glass">
        <div class="stat-icon-wrap stat-icon-teal">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ logs.length }}</div>
          <div class="stat-label">Total de Eventos Registrados</div>
        </div>
      </div>

      <div class="stat-card glass">
        <div class="stat-icon-wrap stat-icon-blue">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ roleChangeCount }}</div>
          <div class="stat-label">Cambios de Rol / Permisos</div>
        </div>
      </div>

      <div class="stat-card glass">
        <div class="stat-icon-wrap stat-icon-green">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">100%</div>
          <div class="stat-label">Integridad de Registros</div>
        </div>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="filters-card glass">
      <div class="filters-row">
        <div class="filter-group">
          <label class="filter-label">Buscar en la bitácora:</label>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Buscar por usuario, correo o administrador..." 
            class="form-control"
          />
          <span class="field-hint">Filtra por nombre, correo electrónico o ID</span>
        </div>

        <div class="filter-group filter-group-sm">
          <label class="filter-label">Tipo de Acción:</label>
          <select v-model="actionFilter" class="form-control">
            <option value="">Todas las acciones</option>
            <option value="CAMBIO_DE_ROL">Cambios de Rol</option>
          </select>
          <span class="field-hint">Filtrar por tipo de evento</span>
        </div>
      </div>
    </div>

    <!-- Audit Log Table -->
    <div class="table-card glass">
      <div class="card-header">
        <div class="header-title-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/></svg>
          <h3>Bitácora Cronológica de Seguridad ({{ filteredLogs.length }} eventos)</h3>
        </div>
      </div>

      <div v-if="isLoading" class="loading-state">
        Cargando bitácora de auditoría...
      </div>

      <div v-else class="table-container">
        <table class="audit-table">
          <thead>
            <tr class="table-header-row">
              <th class="col-date">Fecha y Hora</th>
              <th class="col-admin">Administrador Autorizador</th>
              <th class="col-target">Usuario Modificado</th>
              <th class="col-action">Acción</th>
              <th class="col-roles">Transición de Permisos</th>
              <th class="col-details">Detalles / Motivo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in filteredLogs" :key="log.id">
              <td class="col-date">
                <div class="font-mono text-sm font-bold text-main">{{ formatHondurasDateTime(log.timestamp) }}</div>
                <div class="field-hint">Zona: America/Tegucigalpa</div>
              </td>
              <td class="col-admin">
                <div class="fw-bold">{{ log.adminName || 'Administrador' }}</div>
                <div class="text-muted font-mono text-xs">{{ log.adminEmail }}</div>
              </td>
              <td class="col-target">
                <div class="fw-bold">{{ log.targetUserName || 'Usuario' }}</div>
                <div class="text-muted font-mono text-xs">{{ log.targetUserEmail }}</div>
              </td>
              <td class="col-action">
                <span class="badge-action">{{ log.action }}</span>
              </td>
              <td class="col-roles">
                <div class="role-transition-flex">
                  <span class="badge" :class="'badge-' + (log.previousRole || 'cliente')">
                    {{ (log.previousRole || 'cliente').toUpperCase() }}
                  </span>
                  <span class="transition-arrow">➔</span>
                  <span class="badge" :class="'badge-' + log.newRole">
                    {{ log.newRole.toUpperCase() }}
                  </span>
                </div>
              </td>
              <td class="col-details text-muted text-sm">
                {{ log.details }}
              </td>
            </tr>
            <tr v-if="filteredLogs.length === 0">
              <td colspan="6" class="text-center text-muted py-8">
                No se encontraron registros de auditoría que coincidan con la búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const { isAdmin, fetchUser } = useAuth()
const router = useRouter()

const logs = ref<any[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const actionFilter = ref('')

onMounted(async () => {
  await fetchUser()
  if (!isAdmin.value) {
    router.push('/')
    return
  }
  await fetchLogs()
})

const fetchLogs = async () => {
  isLoading.value = true
  try {
    const res: any = await $fetch('/api/admin/users?action=audit')
    if (res && res.logs) {
      logs.value = res.logs
    }
  } catch (e) {
    console.error('Error al obtener bitácora de auditoría:', e)
  } finally {
    isLoading.value = false
  }
}

const roleChangeCount = computed(() => {
  return logs.value.filter(l => l.action === 'CAMBIO_DE_ROL').length
})

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    // Action filter
    if (actionFilter.value && log.action !== actionFilter.value) {
      return false
    }

    // Search query
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const matchAdmin = (log.adminName && log.adminName.toLowerCase().includes(q)) || (log.adminEmail && log.adminEmail.toLowerCase().includes(q))
      const matchTarget = (log.targetUserName && log.targetUserName.toLowerCase().includes(q)) || (log.targetUserEmail && log.targetUserEmail.toLowerCase().includes(q))
      const matchDetails = log.details && log.details.toLowerCase().includes(q)
      if (!matchAdmin && !matchTarget && !matchDetails) return false
    }

    return true
  })
})

const formatHondurasDateTime = (dateStr: string) => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('es-HN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (e) {
    return dateStr
  }
}

useHead({
  title: 'Auditoría de Seguridad - ArduinoHN Admin'
})
</script>

<style scoped>
.admin-audit-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 60px;
}

.admin-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 1rem;
}

.admin-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted, #64748b);
  margin-bottom: 0.35rem;
}

.admin-breadcrumb a {
  color: var(--color-primary, #00979c);
  text-decoration: none;
}

.admin-breadcrumb a:hover {
  text-decoration: underline;
}

.admin-breadcrumb .separator {
  opacity: 0.5;
}

.admin-breadcrumb .current {
  font-weight: 600;
  color: var(--text-main);
}

.audit-title {
  color: var(--text-main);
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.audit-subtitle {
  color: var(--text-muted, #64748b);
  font-size: 0.88rem;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 0.88rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--text-main);
}

.btn-outline:hover {
  background: rgba(0, 151, 156, 0.08);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Stats Cards */
.audit-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-radius: 12px;
  background: var(--bg-card);
  border: 1px solid var(--glass-border);
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.stat-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  flex-shrink: 0;
}

.stat-icon-teal {
  background: rgba(0, 151, 156, 0.12);
  color: var(--color-primary, #00979C);
}

.stat-icon-blue {
  background: rgba(2, 132, 199, 0.12);
  color: #0284c7;
}

.stat-icon-green {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.1;
}

.stat-label {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-top: 2px;
}

/* Filters */
.filters-card {
  background: var(--bg-card);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
}

.filters-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 260px;
}

.filter-group-sm {
  max-width: 220px;
}

.filter-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 6px;
}

.field-hint {
  display: block;
  font-size: 8pt;
  color: var(--text-muted, #64748b);
  margin-top: 4px;
}

/* Table Card */
.table-card {
  background: var(--bg-card);
  border: 1px solid rgba(0, 151, 156, 0.3);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--glass-border);
  background: rgba(0, 151, 156, 0.03);
}

.header-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primary);
}

.header-title-wrap h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
}

.table-container {
  overflow-x: auto;
}

.audit-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header-row th {
  background: linear-gradient(135deg, var(--color-primary, #00979C) 0%, #007e82 100%);
  color: #ffffff;
  font-weight: 700;
  padding: 12px 16px;
  font-size: 0.85rem;
  text-align: left;
}

.audit-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--glass-border);
  vertical-align: middle;
}

/* Inputs */
.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  background-color: #f1f5f9;
  color: #1e293b;
  border-radius: 6px;
  font-size: 0.88rem;
  font-family: inherit;
  transition: all 0.2s ease;
}

:global([data-theme="dark"]) .form-control {
  background-color: #242b35;
  border-color: rgba(255, 255, 255, 0.15);
  color: #f8fafc;
}

.form-control:focus {
  outline: none;
  background-color: #ffffff;
  border-color: var(--color-primary, #00979C);
  box-shadow: 0 0 0 3px rgba(0, 151, 156, 0.2);
}

/* Badges */
.badge-action {
  display: inline-block;
  background: rgba(2, 132, 199, 0.12);
  color: #0284c7;
  font-weight: 700;
  font-size: 0.72rem;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: ui-monospace, monospace;
}

.role-transition-flex {
  display: flex;
  align-items: center;
  gap: 6px;
}

.transition-arrow {
  color: var(--text-muted);
  font-weight: 800;
  font-size: 0.85rem;
}

.badge {
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.badge-cliente {
  background-color: #e2e8f0;
  color: #475569;
}

.badge-empleado {
  background-color: #e0f2fe;
  color: #0284c7;
}

.badge-admin {
  background-color: #fef3c7;
  color: #d97706;
}

.fw-bold {
  font-weight: 700;
}

.text-xs {
  font-size: 0.78rem;
}

.text-sm {
  font-size: 0.85rem;
}

.font-mono {
  font-family: ui-monospace, monospace;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.text-center {
  text-align: center;
}

.rotating {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
