<template>
  <div class="auth-container">
    <div class="auth-card glass">
      <div class="auth-header">
        <h2>Iniciar Sesión</h2>
        <p class="auth-subtitle">
          O
          <NuxtLink to="/register" class="auth-link">crea una cuenta nueva</NuxtLink>
        </p>
      </div>

      <form class="auth-form" @submit.prevent="handleLogin">
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
              autocomplete="current-password" 
              required 
              v-model="form.password"
              @focus="$event.target.select()"
              class="form-control pr-10"
              placeholder="Tu contraseña"
            >
            <button type="button" class="eye-btn" @click="showPassword = !showPassword" aria-label="Mostrar contraseña">
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
            </button>
          </div>
        </div>

        <div class="form-options">
          <div class="checkbox-group">
            <input id="remember-me" name="remember-me" type="checkbox">
            <label for="remember-me">Recordarme</label>
          </div>
          <NuxtLink to="/forgot-password" class="auth-link text-sm">¿Olvidaste tu contraseña?</NuxtLink>
        </div>

        <div v-if="errorMsg" class="alert alert-error">
          {{ errorMsg }}
        </div>

        <div v-if="successMsg" class="alert alert-success">
          {{ successMsg }}
        </div>

        <button type="submit" :disabled="isLoading" class="btn btn-primary w-full mt-4">
          <span v-if="isLoading">Cargando...</span>
          <span v-else>Entrar</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const { login } = useAuth()
const router = useRouter()

const form = ref({
  email: '',
  password: ''
})

const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  
  const result = await login(form.value)
  
  if (result.success) {
    successMsg.value = '¡Inicio de sesión exitoso! Redirigiendo...'
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } else {
    errorMsg.value = result.error || 'Error al iniciar sesión'
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--text-main);
}

.text-sm {
  font-size: 0.9rem;
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
</style>
