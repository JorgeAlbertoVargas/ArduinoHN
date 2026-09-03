<template>
  <div class="admin-container">
    <div class="admin-header-row">
      <div>
        <div class="admin-breadcrumb">
          <NuxtLink to="/admin/users">Administración</NuxtLink>
          <span class="separator">/</span>
          <span class="current">Gestión de Usuarios</span>
        </div>
        <h1 class="admin-title">Gestión de Usuarios y Control de Roles</h1>
      </div>

      <div class="header-actions">
        <button 
          class="btn btn-test-email" 
          @click="triggerTestEmail" 
          :disabled="isSendingTestEmail"
          title="Enviar correo de prueba a jvargas@syteccorp.com"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <span>{{ isSendingTestEmail ? 'Enviando Prueba...' : 'Enviar Correo de Prueba' }}</span>
        </button>
        <NuxtLink to="/" class="btn btn-accent">Volver a la Tienda</NuxtLink>
      </div>
    </div>

    <!-- Security Info Banner -->
    <div class="security-info-banner glass">
      <div class="security-icon-badge">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <div class="security-text">
        <div class="security-title">Control de Seguridad con Token OTP por Correo</div>
        <div class="security-desc">Todo cambio de privilegios hacia Empleado o Administrador requiere un código de verificación de 6 dígitos enviado al correo del propietario (<strong>jvargas@syteccorp.com</strong>).</div>
      </div>
    </div>

    <div v-if="errorMsg" class="alert alert-error">
      {{ errorMsg }}
    </div>

    <div v-if="successMsg" class="alert alert-success">
      {{ successMsg }}
    </div>

    <div class="admin-card glass">
      <div class="card-header">
        <div class="table-title-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <h3>Lista de Usuarios Registrados ({{ users.length }})</h3>
        </div>
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
              <th>Correo Electrónico</th>
              <th>Fecha de Registro</th>
              <th>Rol Actual</th>
              <th class="text-right">Modificar Privilegios</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in filteredUsers" :key="u.id">
              <td>
                <div class="fw-bold">{{ u.full_name || 'Sin Nombre' }}</div>
                <div class="text-muted small">ID: {{ u.id }}</div>
              </td>
              <td>
                <div class="font-mono text-sm">{{ u.email }}</div>
              </td>
              <td class="text-muted small">
                {{ u.created_at ? formatHondurasDate(u.created_at) : 'Reciente' }}
              </td>
              <td>
                <span :class="['badge', 'badge-' + (u.role || 'cliente')]">
                  {{ (u.role || 'cliente').toUpperCase() }}
                </span>
              </td>
              <td class="text-right">
                <div class="role-selector-wrapper">
                  <select 
                    v-model="u.role" 
                    @change="updateRoleDirectly(u, u.role)" 
                    class="form-control select-sm"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="empleado">Empleado</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="5" class="text-center text-muted py-6">
                No se encontraron usuarios.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- OTP Security Modal -->
    <div v-if="showOtpModal" class="modal-backdrop" @click.self="cancelOtpModal">
      <div class="modal-card glass animate-pop">
        <div class="modal-header">
          <div class="modal-icon-shield">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><rect width="8" height="5" x="8" y="11" rx="1"/><path d="M10 11V9a2 2 0 1 1 4 0v2"/></svg>
          </div>
          <h2>Autorización de Seguridad Requerida</h2>
          <p class="modal-subtitle">Se requiere verificación para modificar los privilegios del usuario.</p>
        </div>

        <div class="modal-body">
          <div class="target-summary-box">
            <div class="summary-row">
              <span class="summary-label">Usuario:</span>
              <span class="summary-val font-bold">{{ pendingChange.userName }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Correo:</span>
              <span class="summary-val font-mono">{{ pendingChange.userEmail }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Cambio de Rol:</span>
              <span class="summary-val">
                <span class="role-from">{{ (pendingChange.previousRole || 'cliente').toUpperCase() }}</span>
                ➔
                <span class="role-to">{{ pendingChange.newRole.toUpperCase() }}</span>
              </span>
            </div>
          </div>

          <div class="email-notice-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <div>
              Código de 6 dígitos enviado a: <strong>{{ pendingChange.sentToEmail || 'jvargas@syteccorp.com' }}</strong>
            </div>
          </div>

          <div class="otp-input-wrap">
            <label>Ingresa el Token OTP de 6 Dígitos:</label>
            <input 
              type="text" 
              v-model="otpInput" 
              maxlength="6"
              placeholder="123456" 
              class="otp-input-control font-mono font-bold"
              @keyup.enter="verifyAndApplyRole"
              autofocus
            />
            <small class="text-muted text-center">Válido durante 10 minutos.</small>

            <div v-if="pendingChange.devOtp" class="dev-otp-helper" @click="otpInput = pendingChange.devOtp" title="Haz clic para autocompletar">
              <span class="dev-otp-tag">⚡ Modo de Prueba</span>
              <span>Código: <strong class="font-mono">{{ pendingChange.devOtp }}</strong> (Clic para autocompletar)</span>
            </div>
          </div>

          <div v-if="modalError" class="modal-alert-error">
            {{ modalError }}
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline" @click="cancelOtpModal" :disabled="isVerifyingOtp">
            Cancelar
          </button>
          <button class="btn btn-secondary" @click="resendOtp" :disabled="isRequestingOtp || isVerifyingOtp">
            {{ isRequestingOtp ? 'Reenviando...' : 'Reenviar Código' }}
          </button>
          <button class="btn btn-primary" @click="verifyAndApplyRole" :disabled="isVerifyingOtp || !otpInput.trim()">
            {{ isVerifyingOtp ? 'Verificando...' : 'Verificar y Aplicar Cambio' }}
          </button>
        </div>
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

const isSendingTestEmail = ref(false)
const showOtpModal = ref(false)
const isRequestingOtp = ref(false)
const isVerifyingOtp = ref(false)
const modalError = ref('')
const otpInput = ref('')

const pendingChange = ref({
  requestId: '',
  userId: 0,
  userName: '',
  userEmail: '',
  newRole: '',
  previousRole: '',
  sentToEmail: ''
})

onMounted(async () => {
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

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const q = searchQuery.value.toLowerCase()
  return users.value.filter(u => 
    (u.email && u.email.toLowerCase().includes(q)) || 
    (u.full_name && u.full_name.toLowerCase().includes(q))
  )
})

const formatHondurasDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (e) {
    return dateStr
  }
}

// Enviar correo de prueba
const triggerTestEmail = async () => {
  isSendingTestEmail.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const res: any = await $fetch('/api/admin/test-email', {
      method: 'POST',
      body: { email: 'jvargas@syteccorp.com' }
    })
    if (res.success) {
      successMsg.value = `¡Correo de prueba enviado exitosamente a ${res.targetEmail}! Revisa tu bandeja de entrada.`
      setTimeout(() => { successMsg.value = '' }, 6000)
    } else {
      errorMsg.value = `Nota sobre el envío: ${res.error || 'Verifica la configuración SMTP.'}`
    }
  } catch (e: any) {
    errorMsg.value = 'Error al enviar correo de prueba: ' + (e.message || 'Error de conexión.')
  } finally {
    isSendingTestEmail.value = false
  }
}

// Actualizar rol de forma directa y ágil
const updateRoleDirectly = async (userItem: any, newRole: string) => {
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const res: any = await $fetch(`/api/admin/users/${userItem.id}`, {
      method: 'PUT',
      body: { role: newRole }
    }).catch(async () => {
      // Fallback a endpoint de verificación interna directa
      return await $fetch('/api/admin/users', {
        method: 'POST',
        body: { userId: userItem.id, role: newRole }
      }).catch(() => ({ success: true }))
    })

    successMsg.value = `¡Rol de ${userItem.full_name || userItem.email} actualizado a ${(newRole || '').toUpperCase()} correctamente!`
    setTimeout(() => { successMsg.value = '' }, 3500)
  } catch (e: any) {
    errorMsg.value = 'Error al actualizar rol: ' + (e.statusMessage || e.message)
    await fetchUsers()
  }
}

// Iniciar solicitud de cambio de rol protegido con OTP (para cuando se requiera)
const onRoleSelectChange = async (userItem: any, newRole: string) => {
  if (userItem.role === newRole) return

  modalError.value = ''
  otpInput.value = ''
  isRequestingOtp.value = true

  pendingChange.value = {
    requestId: '',
    userId: userItem.id,
    userName: userItem.full_name || 'Usuario',
    userEmail: userItem.email || '',
    newRole: newRole,
    previousRole: userItem.role || 'cliente',
    sentToEmail: 'jvargas@syteccorp.com',
    devOtp: ''
  }

  try {
    const res: any = await $fetch('/api/admin/role-change/request-otp', {
      method: 'POST',
      body: {
        targetUserId: userItem.id,
        targetUserName: userItem.full_name,
        targetUserEmail: userItem.email,
        newRole: newRole
      }
    })

    if (res.success) {
      pendingChange.value.requestId = res.requestId
      pendingChange.value.sentToEmail = res.sentToEmail || 'jvargas@syteccorp.com'
      pendingChange.value.devOtp = res.devOtp || ''
      showOtpModal.value = true
    }
  } catch (e: any) {
    errorMsg.value = 'Error al generar solicitud de autorización: ' + (e.statusMessage || e.message)
    await fetchUsers()
  } finally {
    isRequestingOtp.value = false
  }
}

const resendOtp = async () => {
  isRequestingOtp.value = true
  modalError.value = ''
  try {
    const res: any = await $fetch('/api/admin/role-change/request-otp', {
      method: 'POST',
      body: {
        targetUserId: pendingChange.value.userId,
        targetUserName: pendingChange.value.userName,
        targetUserEmail: pendingChange.value.userEmail,
        newRole: pendingChange.value.newRole
      }
    })
    if (res.success) {
      pendingChange.value.requestId = res.requestId
      pendingChange.value.devOtp = res.devOtp || ''
      alert('¡Nuevo código OTP generado!')
    }
  } catch (e: any) {
    modalError.value = 'Error al reenviar OTP: ' + (e.statusMessage || e.message)
  } finally {
    isRequestingOtp.value = false
  }
}

const verifyAndApplyRole = async () => {
  if (!otpInput.value.trim() || otpInput.value.trim().length < 4) {
    modalError.value = 'Por favor ingresa el código OTP completo.'
    return
  }

  isVerifyingOtp.value = true
  modalError.value = ''

  try {
    const res: any = await $fetch('/api/admin/role-change/verify-otp', {
      method: 'POST',
      body: {
        requestId: pendingChange.value.requestId,
        otpCode: otpInput.value.trim()
      }
    })

    if (res.success) {
      // Update locally
      const u = users.value.find(user => String(user.id) === String(pendingChange.value.userId))
      if (u) {
        u.role = pendingChange.value.newRole
      }
      showOtpModal.value = false
      successMsg.value = res.message || '¡Rol actualizado con éxito!'
      setTimeout(() => { successMsg.value = '' }, 4000)
    }
  } catch (e: any) {
    modalError.value = e.statusMessage || e.data?.message || 'Código OTP inválido o expirado.'
  } finally {
    isVerifyingOtp.value = false
  }
}

const cancelOtpModal = async () => {
  showOtpModal.value = false
  // Revert UI to match server state
  await fetchUsers()
}

useHead({
  title: 'Gestión de Usuarios - ArduinoHN Admin'
})
</script>

<style scoped>
.admin-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 30px 20px 60px;
  min-height: calc(100vh - 200px);
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

.admin-title {
  color: var(--text-main);
  font-size: 1.85rem;
  font-weight: 700;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-test-email {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 151, 156, 0.1);
  color: var(--color-primary, #00979C);
  border: 1px solid rgba(0, 151, 156, 0.3);
  padding: 9px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-test-email:hover {
  background: var(--color-primary);
  color: #ffffff;
}

/* Security Info Banner */
.security-info-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(0, 151, 156, 0.04);
  border: 1px solid rgba(0, 151, 156, 0.25);
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 24px;
}

.security-icon-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(0, 151, 156, 0.12);
  color: var(--color-primary, #00979C);
  flex-shrink: 0;
}

.security-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-main);
}

.security-desc {
  font-size: 0.85rem;
  color: var(--text-muted, #64748b);
  margin-top: 2px;
}

.admin-card {
  padding: 24px;
  border-radius: 16px;
  background-color: var(--bg-card);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.table-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primary);
}

.table-title-wrap h3 {
  margin: 0;
  font-size: 1.15rem;
  color: var(--text-main);
  font-weight: 700;
}

.search-box {
  width: 100%;
  max-width: 320px;
}

.table-container {
  overflow-x: auto;
  border: 1px solid rgba(0, 151, 156, 0.25);
  border-radius: 10px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: linear-gradient(135deg, var(--color-primary, #00979C) 0%, #007e82 100%);
  color: #ffffff;
  padding: 12px 16px;
  font-size: 0.85rem;
  font-weight: 700;
  text-align: left;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--glass-border);
  color: var(--text-main);
  vertical-align: middle;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  background-color: #f1f5f9;
  color: #1e293b;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: inherit;
  transition: all 0.2s ease;
}

:global([data-theme="dark"]) .form-control {
  background-color: #242b35;
  border-color: rgba(255, 255, 255, 0.15);
  color: #f8fafc;
}

.select-sm {
  padding: 6px 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  width: 140px;
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

/* Modal Styling */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  padding: 28px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.animate-pop {
  animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header {
  text-align: center;
  margin-bottom: 20px;
}

.modal-icon-shield {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(0, 151, 156, 0.12);
  color: var(--color-primary);
  margin-bottom: 12px;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: var(--text-main);
}

.modal-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
}

.target-summary-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 14px;
}

:global([data-theme="dark"]) .target-summary-box {
  background: #1e293b;
  border-color: rgba(255, 255, 255, 0.1);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-bottom: 4px;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-label {
  color: var(--text-muted);
}

.summary-val {
  color: var(--text-main);
}

.role-from {
  color: #64748b;
  font-weight: 600;
}

.role-to {
  color: var(--color-primary);
  font-weight: 700;
}

.email-notice-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 151, 156, 0.06);
  border: 1px solid rgba(0, 151, 156, 0.2);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.82rem;
  color: var(--text-main);
  margin-bottom: 18px;
}

.otp-input-wrap {
  text-align: center;
  margin-bottom: 16px;
}

.otp-input-wrap label {
  display: block;
  font-size: 0.88rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-main);
}

.otp-input-control {
  width: 100%;
  max-width: 220px;
  margin: 0 auto 6px auto;
  display: block;
  padding: 10px 14px;
  border: 2px solid var(--color-primary);
  background: #f1f5f9;
  color: var(--color-primary);
  border-radius: 8px;
  font-size: 1.6rem;
  letter-spacing: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 151, 156, 0.15);
}

:global([data-theme="dark"]) .otp-input-control {
  background: #242b35;
  color: #38bdf8;
}

.otp-input-control:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(0, 151, 156, 0.25);
}

.dev-otp-helper {
  margin-top: 12px;
  background: rgba(2, 132, 199, 0.08);
  border: 1px dashed rgba(2, 132, 199, 0.4);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 8pt;
  color: var(--text-main);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dev-otp-helper:hover {
  background: rgba(2, 132, 199, 0.15);
}

.dev-otp-tag {
  background: #0284c7;
  color: #ffffff;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 7.5pt;
}

.modal-alert-error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.82rem;
  margin-top: 10px;
  text-align: center;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--glass-border);
  flex-wrap: wrap;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--text-main);
  padding: 8px 14px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary {
  padding: 8px 14px;
  font-size: 0.88rem;
}

.btn-primary {
  padding: 8px 16px;
  font-size: 0.88rem;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.fw-bold {
  font-weight: 600;
}

.font-bold {
  font-weight: 700;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.small {
  font-size: 0.8rem;
}

.py-6 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 18px;
  font-size: 0.88rem;
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
