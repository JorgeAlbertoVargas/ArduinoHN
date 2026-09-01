<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <h3>ArduinoHN</h3>
        <p>Innovación tecnológica en Hardware, Software e IIoT.</p>
      </div>
      <div class="footer-links-group">
        <div class="footer-links">
          <h4>Navegación</h4>
          <NuxtLink to="/store">Tienda</NuxtLink>
          <NuxtLink to="/projects">Proyectos</NuxtLink>
          <NuxtLink to="/blog">Blog</NuxtLink>
          <NuxtLink to="/customer-service">Servicio al Cliente</NuxtLink>
        </div>
        <div class="footer-links">
          <h4>Legal</h4>
          <NuxtLink to="/terms">Términos y Condiciones</NuxtLink>
          <NuxtLink to="/privacy">Política de Privacidad</NuxtLink>
        </div>
      </div>
    </div>
    <div class="footer-bottom text-center">
      <p>&copy; {{ new Date().getFullYear() }} ArduinoHN por Sytec Corp. Todos los derechos reservados.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--color-dark);
  color: var(--color-light);
  padding: 4rem 0 2rem;
  margin-top: 4rem;
}
.footer-inner {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 2rem;
}
.footer-brand h3 {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}
.footer-links-group {
  display: flex;
  gap: 4rem;
  flex-wrap: wrap;
}
.footer-links {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.footer-links h4 {
  color: var(--color-light);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}
.footer-links a {
  color: var(--color-light);
  opacity: 0.8;
  text-decoration: none;
  font-size: 0.95rem;
}
.footer-links a:hover {
  opacity: 1;
  color: var(--color-primary);
}
.footer-bottom {
  text-align: center;
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 2rem;
  opacity: 0.6;
}
</style>
