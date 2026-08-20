<template>
  <header class="navbar glass">
    <div class="container navbar-inner">
      <NuxtLink to="/" class="brand">
        <img src="/logo.png" alt="Logo" class="brand-logo" />
        <span class="logo">ArduinoHN</span>
      </NuxtLink>
      <nav class="nav-links">
        <NuxtLink to="/store">Tienda</NuxtLink>
        <NuxtLink to="/projects">Proyectos</NuxtLink>
        <NuxtLink to="/blog">Blog</NuxtLink>
      </nav>
      <div class="nav-actions">
        <NuxtLink to="/auth/login" class="btn btn-primary">Iniciar Sesión</NuxtLink>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 1rem 0;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-top: none;
}
.navbar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.brand {
  display: flex;
  align-items: center;
}
.brand-logo {
  height: 40px;
  width: auto;
  margin-right: 12px;
  /* Convierte el rojo en verde Arduino (#00979C) */
  filter: brightness(0) saturate(100%) invert(42%) sepia(51%) saturate(2320%) hue-rotate(143deg) brightness(93%) contrast(101%);
}
.brand .logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}
.nav-links {
  display: flex;
  gap: 2rem;
}
.nav-links a {
  font-weight: 500;
  color: var(--text-main);
}
.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--color-primary);
}
</style>
