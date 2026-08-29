<template>
  <div class="admin-container">
    <div class="admin-header-row">
      <h1 class="admin-title">Gestión de Usuarios y Roles</h1>
      <NuxtLink to="/" class="btn btn-accent">Volver a la Tienda</NuxtLink>
    </div>

    <div v-if="errorMsg" class="alert alert-error">
      {{ errorMsg }}
    </div>

    <div v-if="successMsg" class="alert alert-success">
      {{ successMsg }}
    </div>

    <div class="admin-card glass">
      <div class="card-header">
        <h3>Lista de Usuarios</h3>
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Buscar por email o nombre..."
            class="form-control"
          >
        </div>
      </div>
      
      <div v-if="isLoading" class="loading-state">
        Cargando usuarios...
      </div>
      
      <div v-else class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID / Nombre</th>
              <th>Email</th>
              <th>Fecha Registro</th>
              <th>Rol</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in filteredUsers" :key="u.id">
              <td>
                <div class="fw-bold">{{ u.full_name }}</div>
                <div class="text-muted small">ID: {{ u.id }}</div>
              </td>
              <td>
                <div>{{ u.email }}</div>
              </td>
              <td class="text-muted small">
                {{ u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A' }}
              </td>
              <td>
                <span :class="['badge', 'badge-' + (u.role || 'cliente')]">
                  {{ (u.role || 'cliente').toUpperCase() }}
                </span>
              </td>
              <td class="text-right">
                <select v-model="u.role" @change="updateRole(u.id, u.role)" class="form-control select-sm">
                  <option value="cliente">Cliente</option>
                  <option value="empleado">Empleado</option>
                  <option value="admin">Administrador</option>
                </select>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="5" class="text-center text-muted">
                No se encontraron usuarios.
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

const { isAdmin } = useAuth()
const router = useRouter()

const users = ref<any[]>([])
const isLoading = ref(true)
const errorMsg = ref('')
const successMsg = ref('')
const searchQuery = ref('')

onMounted(async () => {
  // Check if user is admin, otherwise redirect
  if (!isAdmin.value) {
    router.push('/')
    return
  }
  
  await fetchUsers()
})

const fetchUsers = async () => {
  isLoading.value = true
  try {
    const response = await $fetch<any[]>('/api/admin/users')
    users.value = response
  } catch (error: any) {
    errorMsg.value = 'Error al cargar usuarios. Asegúrate de ser administrador.'
  } finally {
    isLoading.value = false
  }
}

const updateRole = async (userId: number, newRole: string) => {
  errorMsg.value = ''
  successMsg.value = ''
  
  try {
    const response = await $fetch<{ success: boolean, message: string }>('/api/admin/users', {
      method: 'PUT',
      body: { userId, role: newRole }
    })
    
    if (response.success) {
      successMsg.value = 'Rol actualizado correctamente'
      setTimeout(() => { successMsg.value = '' }, 3000)
    }
  } catch (error: any) {
    errorMsg.value = 'Error al actualizar el rol.'
    // Revert visually
    await fetchUsers()
  }
}

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(u => 
    u.email?.toLowerCase().includes(query) || 
    u.full_name?.toLowerCase().includes(query)
  )
})
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

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-main);
}

.search-box {
  width: 300px;
}

.form-control {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid var(--glass-border);
  background-color: var(--bg-main);
  color: var(--text-main);
  border-radius: 8px;
  font-family: var(--font-family);
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 151, 156, 0.2);
}

.select-sm {
  padding: 8px 12px;
  font-size: 0.9rem;
  cursor: pointer;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, 
.data-table td {
  padding: 16px 24px;
  text-align: left;
  border-bottom: 1px solid var(--glass-border);
}

.data-table th {
  background-color: var(--color-primary);
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-table tbody tr:nth-child(even) {
  background-color: rgba(0, 0, 0, 0.02);
}

.data-table tbody tr:hover {
  background-color: rgba(0, 151, 156, 0.06);
}

.fw-bold {
  font-weight: 600;
  color: var(--text-main);
}

.text-muted {
  color: var(--text-muted);
}

.small {
  font-size: 0.85rem;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.loading-state {
  padding: 40px;
  text-align: center;
  color: var(--text-muted);
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.badge-admin {
  background-color: rgba(46, 125, 50, 0.1);
  color: #2e7d32;
}

.badge-empleado {
  background-color: rgba(0, 151, 156, 0.1);
  color: var(--color-primary);
}

.badge-cliente {
  background-color: rgba(108, 117, 125, 0.1);
  color: var(--text-muted);
}

.alert {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-weight: 500;
}

.alert-error {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.alert-success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}
</style>
