<template>
  <div class="container auth-page">
    <div class="auth-card glass">
      <h2 class="text-center">Únete a la Revolución Tecnológica</h2>
      <p class="text-center auth-subtitle">Inicia sesión o regístrate para acceder a tus pedidos y beneficios de la comunidad.</p>
      
      <form class="auth-form" @submit.prevent="login">
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input type="email" id="email" class="form-control" placeholder="tu@correo.com" required>
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input type="password" id="password" class="form-control" placeholder="••••••••" required>
        </div>
        <button type="submit" class="btn btn-primary w-full">Ingresar</button>
      </form>
    </div>
  </div>
</template>

<script setup>
const login = () => {
  alert('Función de Autenticación lista para integrar con Supabase.')
}
</script>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
}
.auth-card {
  width: 100%;
  max-width: 450px;
  padding: 3rem 2rem;
}
.auth-subtitle {
  color: var(--text-muted);
  margin-bottom: 2rem;
  font-size: 0.95rem;
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-group label {
  font-weight: 500;
  font-size: 0.9rem;
}
.form-control {
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid var(--glass-border);
  background: rgba(0,0,0,0.02);
  color: var(--text-main);
  font-family: var(--font-family);
}
.text-center {
  text-align: center;
}
.w-full {
  width: 100%;
}
</style>
