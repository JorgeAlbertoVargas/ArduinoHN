<template>
  <div class="auth-container">
    <div class="auth-card glass">
      <div class="auth-header">
        <h2>Crear Cuenta</h2>
        <p class="auth-subtitle">
          ¿Ya tienes cuenta?
          <NuxtLink to="/login" class="auth-link">Inicia sesión aquí</NuxtLink>
        </p>
      </div>
      
      <form class="auth-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="full_name">Nombre Completo</label>
          <input 
            id="full_name" 
            name="full_name" 
            type="text" 
            required 
            v-model="form.full_name"
            class="form-control"
            placeholder="Juan Pérez"
          >
        </div>
        
        <div class="form-group">
          <label for="email-address">Correo Electrónico</label>
          <input 
            id="email-address" 
            name="email" 
            type="email" 
            autocomplete="email" 
            required 
            v-model="form.email"
            class="form-control"
            placeholder="correo@ejemplo.com"
          >
        </div>
        
        <div class="form-group">
          <label for="password">Contraseña</label>
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
              placeholder="Contraseña segura"
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
              placeholder="Confirma tu contraseña"
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

        <div v-if="successMsg" class="alert alert-success">
          {{ successMsg }}
        </div>

        <button type="submit" :disabled="isLoading" class="btn btn-primary w-full mt-4">
          <span v-if="isLoading">Registrando...</span>
          <span v-else>Registrarse</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const { register } = useAuth()
const router = useRouter()

const form = ref({
  full_name: '',
  email: '',
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

const handleRegister = async () => {
  errorMsg.value = ''
  successMsg.value = ''

  if (form.value.password !== form.value.confirm_password) {
    errorMsg.value = 'Las contraseñas no coinciden'
    return
  }
  
  // Client-side password validation
  const hasUppercase = /[A-Z]/.test(form.value.password);
  const hasLowercase = /[a-z]/.test(form.value.password);
  const hasNumber = /\d/.test(form.value.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(form.value.password);

  if (form.value.password.length < 6 || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    errorMsg.value = 'La contraseña debe tener al menos 6 caracteres e incluir mayúsculas, minúsculas, números y caracteres especiales'
    return
  }

  isLoading.value = true
  
  const result = await register(form.value)
  
  if (result.success) {
    successMsg.value = '¡Cuenta creada exitosamente! Redirigiendo...'
    setTimeout(() => {
      router.push('/')
    }, 2000)
  } else {
    errorMsg.value = result.error || 'Error al registrarse'
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
  position: relative;
  overflow: hidden;
}

.auth-container::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vmin;
  height: 90vmin;
  background-image: url('/logo.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.03;
  pointer-events: none;
  z-index: 0;
}

:global([data-theme="dark"]) .auth-container::before {
  opacity: 0.05;
}

.auth-card {
  width: 100%;
  max-width: 450px;
  padding: 40px;
  position: relative;
  z-index: 1;
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
  border: 1px solid rgba(0, 0, 0, 0.15);
  background-color: var(--bg-card);
  color: var(--text-main);
  border-radius: 8px;
  font-family: var(--font-family);
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.form-control::placeholder {
  color: #9ca3af;
}

:global([data-theme="dark"]) .form-control {
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
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
