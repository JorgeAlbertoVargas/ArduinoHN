<template>
  <div class="auth-container">
    <div class="auth-card glass">
      <div class="auth-header">
        <h2>Recuperar Contraseña</h2>
        <p class="auth-subtitle">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>
      
      <div v-if="successMsg" class="alert alert-success">
        <p>{{ successMsg }}</p>
        <div class="mt-4">
          <NuxtLink to="/login" class="auth-link">Volver a iniciar sesión</NuxtLink>
        </div>
      </div>
      
      <form v-else class="auth-form" @submit.prevent="handleForgot">
        <div class="form-group">
          <label for="email-address">Correo Electrónico</label>
          <input 
            id="email-address" 
            name="email" 
            type="email" 
            autocomplete="email" 
            required 
            v-model="email"
            class="form-control"
            placeholder="correo@ejemplo.com"
          >
        </div>

        <div v-if="errorMsg" class="alert alert-error">
          {{ errorMsg }}
        </div>

        <button type="submit" :disabled="isLoading" class="btn btn-primary w-full mt-4">
          <span v-if="isLoading">Enviando...</span>
          <span v-else>Enviar Enlace</span>
        </button>
        
        <div class="text-center mt-4">
          <NuxtLink to="/login" class="auth-link text-sm">Volver</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const handleForgot = async () => {
  isLoading.value = true
  errorMsg.value = ''
  
  try {
    const response = await $fetch<{ success: boolean, message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value }
    })
    
    if (response.success) {
      successMsg.value = response.message
    }
  } catch (error: any) {
    errorMsg.value = error.data?.statusMessage || 'Ocurrió un error. Por favor intenta más tarde.'
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

.form-control {
  padding: 12px 15px;
  border: 1px solid var(--glass-border);
  background-color: var(--bg-card);
  color: var(--text-main);
  border-radius: 8px;
  font-family: var(--font-family);
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 151, 156, 0.2);
}

.text-center {
  text-align: center;
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
