<template>
  <div class="auth-container">
    <div class="auth-card glass">
      <div class="auth-header">
        <h2>Nueva Contraseña</h2>
        <p class="auth-subtitle">
          Ingresa tu nueva contraseña a continuación.
        </p>
      </div>
      
      <div v-if="successMsg" class="alert alert-success">
        <p>{{ successMsg }}</p>
        <div class="mt-4">
          <NuxtLink to="/login" class="auth-link">Ir a iniciar sesión</NuxtLink>
        </div>
      </div>
      
      <form v-else class="auth-form" @submit.prevent="handleReset">
        <div class="form-group">
          <label for="password">Nueva Contraseña</label>
          <div class="input-wrapper">
            <input 
              id="password" 
              name="password" 
              :type="showPassword ? 'text' : 'password'" 
              autocomplete="new-password"
              required 
              v-model="form.password"
              @focus="$event.target.select()"
              class="form-control pr-10"
              placeholder="Nueva contraseña"
            >
            <button type="button" class="eye-btn" @click="showPassword = !showPassword" aria-label="Mostrar contraseña">
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
            </button>
          </div>
          <div class="password-meter" v-if="form.password">
            <div class="meter-bar">
              <div class="meter-fill" :style="{ width: (passwordStrength.score * 20) + '%', backgroundColor: passwordStrength.color }"></div>
            </div>
            <span class="meter-text" :style="{ color: passwordStrength.color }">{{ passwordStrength.text }}</span>
          </div>
          <p class="help-text">Mínimo 6 caracteres. Debe incluir mayúsculas, minúsculas, números y un carácter especial (ej. Arduino123*).</p>
        </div>
        
        <div class="form-group">
          <label for="confirm_password">Confirmar Contraseña</label>
          <div class="input-wrapper">
            <input 
              id="confirm_password" 
              name="confirm_password" 
              :type="showConfirmPassword ? 'text' : 'password'" 
              autocomplete="new-password"
              required 
              v-model="form.confirm_password"
              @focus="$event.target.select()"
              class="form-control pr-10"
              placeholder="Confirmar contraseña"
            >
            <button type="button" class="eye-btn" @click="showConfirmPassword = !showConfirmPassword" aria-label="Mostrar contraseña">
              <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
            </button>
          </div>
        </div>

        <div v-if="errorMsg" class="alert alert-error">
          {{ errorMsg }}
        </div>

        <button type="submit" :disabled="isLoading" class="btn btn-primary w-full mt-4">
          <span v-if="isLoading">Actualizando...</span>
          <span v-else>Actualizar Contraseña</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const token = ref('')

const form = ref({
  password: '',
  confirm_password: ''
})

const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

import { computed } from 'vue'

const passwordStrength = computed(() => {
  const pwd = form.value.password;
  let score = 0;
  if (!pwd) return { score: 0, text: '', color: 'var(--glass-border)' };
  
  if (pwd.length >= 6) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[a-z]/.test(pwd)) score += 1;
  if (/\d/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 2) return { score, text: 'Débil', color: '#ef4444' };
  if (score === 3 || score === 4) return { score, text: 'Media', color: '#f59e0b' };
  return { score, text: 'Fuerte', color: '#10b981' };
});

onMounted(() => {
  if (route.query.token) {
    token.value = route.query.token as string
  } else {
    errorMsg.value = 'Enlace inválido o expirado. Falta el token de seguridad.'
  }
})

const handleReset = async () => {
  if (form.value.password !== form.value.confirm_password) {
    errorMsg.value = 'Las contraseñas no coinciden'
    return
  }
  
  const hasUppercase = /[A-Z]/.test(form.value.password);
  const hasLowercase = /[a-z]/.test(form.value.password);
  const hasNumber = /\d/.test(form.value.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(form.value.password);

  if (form.value.password.length < 6 || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    errorMsg.value = 'La contraseña debe tener al menos 6 caracteres e incluir mayúsculas, minúsculas, números y caracteres especiales'
    return
  }

  if (!token.value) {
    errorMsg.value = 'Enlace inválido o expirado.'
    return
  }

  isLoading.value = true
  errorMsg.value = ''
  
  try {
    const response = await $fetch<{ success: boolean, message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: { 
        token: token.value,
        newPassword: form.value.password 
      }
    })
    
    if (response.success) {
      successMsg.value = '¡Contraseña actualizada correctamente!'
    }
  } catch (error: any) {
    errorMsg.value = error.data?.statusMessage || 'Ocurrió un error. El enlace puede haber expirado.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background-color: var(--bg-main);
}

.auth-card {
  width: 100%;
  max-width: 450px;
  padding: 40px;
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header h2 {
  color: var(--color-primary);
  font-size: 2rem;
  margin-bottom: 10px;
}

.auth-subtitle {
  color: var(--text-muted);
}

.auth-link {
  color: var(--color-accent);
  font-weight: 600;
}

.auth-link:hover {
  text-decoration: underline;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-main);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--glass-border);
  background-color: var(--bg-card);
  color: var(--text-main);
  border-radius: 8px;
  font-family: var(--font-family);
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.pr-10 {
  padding-right: 40px;
}

.eye-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.eye-btn:hover {
  color: var(--color-primary);
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 151, 156, 0.2);
}

.w-full {
  width: 100%;
}

.mt-4 {
  margin-top: 16px;
}

.alert {
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
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

.password-meter {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.meter-bar {
  flex-grow: 1;
  height: 6px;
  background-color: var(--glass-border);
  border-radius: 4px;
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.meter-text {
  font-size: 0.8rem;
  font-weight: 600;
  min-width: 45px;
  text-align: right;
}

.help-text {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 4px;
  line-height: 1.4;
}
</style>
