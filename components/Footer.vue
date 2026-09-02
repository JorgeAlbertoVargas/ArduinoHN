<template>
  <footer class="footer-premium">
    <div class="container">
      <div class="footer-grid">
        <!-- Columna 1: Región/Moneda -->
        <div class="footer-col">
          <h4 class="footer-heading">Configuración</h4>
          <div class="region-selector">
            <span class="current-region">{{ userCountry || 'Honduras' }} / {{ userCurrency || 'HNL' }}</span>
          </div>
          <p class="brand-desc mt-4">
            ArduinoHN by Sytec Corp.<br>
            Innovación tecnológica en Hardware, Software e IIoT.
          </p>
        </div>

        <!-- Columna 2: Atención al cliente -->
        <div class="footer-col">
          <h4 class="footer-heading">Atención al cliente</h4>
          <ul class="footer-links">
            <li><NuxtLink to="/customer-service">Contacto</NuxtLink></li>
            <li><NuxtLink to="/faq">Preguntas frecuentes</NuxtLink></li>
            <li><NuxtLink to="/shipping">Envíos y devoluciones</NuxtLink></li>
            <li><NuxtLink to="/track-order">Rastrea tu pedido</NuxtLink></li>
            <li><NuxtLink to="/deals">Ofertas del mes</NuxtLink></li>
          </ul>
        </div>

        <!-- Columna 3: Explora -->
        <div class="footer-col">
          <h4 class="footer-heading">Explora</h4>
          <ul class="footer-links">
            <li><NuxtLink to="/store">Catálogo de Productos</NuxtLink></li>
            <li><NuxtLink to="/semiconductores">Semiconductores & Chips</NuxtLink></li>
            <li><NuxtLink to="/projects">Proyectos y Tutoriales</NuxtLink></li>
            <li><NuxtLink to="/blog">Blog Técnico</NuxtLink></li>
            <li><NuxtLink to="/coupons">Cupones de Descuento</NuxtLink></li>
            <li><NuxtLink to="/loyalty">Programa de Lealtad <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="external-icon"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></NuxtLink></li>
          </ul>
        </div>

        <!-- Columna 4: Avisos legales y cookies -->
        <div class="footer-col">
          <h4 class="footer-heading">Avisos legales y cookies</h4>
          <ul class="footer-links">
            <li><NuxtLink to="/terms">Términos y Condiciones de Uso</NuxtLink></li>
            <li><NuxtLink to="/terms-sale">Condiciones de Venta</NuxtLink></li>
            <li><NuxtLink to="/privacy">Política de privacidad</NuxtLink></li>
            <li><NuxtLink to="/cookies">Política de cookies</NuxtLink></li>
            <li><NuxtLink to="/sitemap">Mapa del sitio</NuxtLink></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Footer Bottom: Copyright y Redes -->
    <div class="footer-bottom">
      <div class="container bottom-content">
        <div class="copyright">
          &copy; {{ new Date().getFullYear() }} ArduinoHN. Todos los derechos reservados.
        </div>
        <div class="social-icons">
          <a href="#" aria-label="Facebook"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>
          <a href="#" aria-label="Instagram"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>
          <a href="#" aria-label="YouTube"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg></a>
          <a href="#" aria-label="X (Twitter)"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="4" x2="20" y2="20"></line><line x1="20" y1="4" x2="4" y2="20"></line></svg></a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useGlobalCurrencyConfig } from '~/composables/useGlobalCurrencyConfig';

// Importamos para que la región y moneda del footer coincidan con lo detectado
const { userCountry, userCurrency } = useGlobalCurrencyConfig();
</script>

<style scoped>
.footer-premium {
  background-color: var(--color-dark, #111111);
  color: #ffffff;
  margin-top: 4rem;
  font-family: var(--font-family, sans-serif);
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 3rem;
  padding: 4rem 20px 3rem;
}

@media (min-width: 768px) {
  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .footer-grid {
    grid-template-columns: 1.5fr 1fr 1fr 1.5fr;
    gap: 2rem;
  }
}

.footer-col {
  display: flex;
  flex-direction: column;
}

.footer-heading {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #ffffff;
  letter-spacing: 0.5px;
}

.region-selector {
  margin-bottom: 1rem;
}

.current-region {
  font-size: 0.95rem;
  color: #dddddd;
}

.brand-desc {
  font-size: 0.9rem;
  color: #aaaaaa;
  line-height: 1.6;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-links li a {
  color: #cccccc;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.footer-links li a:hover {
  color: #ffffff;
}

.external-icon {
  opacity: 0.7;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  padding: 2rem 20px;
}

.bottom-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .bottom-content {
    flex-direction: row;
    justify-content: space-between;
  }
}

.copyright {
  font-size: 0.85rem;
  color: #aaaaaa;
}

.social-icons {
  display: flex;
  gap: 1.5rem;
}

.social-icons a {
  color: #ffffff;
  transition: opacity 0.3s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-icons a:hover {
  opacity: 0.7;
  transform: scale(1.1);
}

.mt-4 {
  margin-top: 1rem;
}
</style>
