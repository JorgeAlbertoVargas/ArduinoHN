<template>
  <div class="sitemap-page">
    <div class="container py-12">
      <div class="text-center mb-12">
        <h1 class="sitemap-title">Mapa del Sitio</h1>
        <p class="sitemap-subtitle">Encuentra rápidamente todo lo que buscas en ArduinoHN</p>
      </div>

      <div class="sitemap-grid">
        <!-- Columna 1: Tienda y Categorías -->
        <div class="sitemap-col">
          <h2 class="sitemap-heading">Tienda Virtual</h2>
          <ul class="sitemap-links">
            <li><NuxtLink to="/store">Catálogo Completo</NuxtLink></li>
            <li><NuxtLink to="/semiconductores">Centro de Semiconductores & Chips</NuxtLink></li>
            <li><NuxtLink to="/store?category=arduino">Placas Arduino</NuxtLink></li>
            <li><NuxtLink to="/store?category=raspberry">Raspberry Pi & SBCs</NuxtLink></li>
            <li><NuxtLink to="/store?category=esp32">Módulos ESP32 / IoT</NuxtLink></li>
            <li><NuxtLink to="/store?category=sensor">Sensores y Módulos</NuxtLink></li>
            <li><NuxtLink to="/store?category=motor">Motores y Servos</NuxtLink></li>
            <li><NuxtLink to="/store?category=plc">Automatización Industrial (PLC)</NuxtLink></li>
            <li><NuxtLink to="/store?category=display">Pantallas y Displays</NuxtLink></li>
            <li><NuxtLink to="/store?category=power">Fuentes y Baterías</NuxtLink></li>
            <li><NuxtLink to="/store?category=tool">Herramientas y Soldadura</NuxtLink></li>
          </ul>

          <h2 class="sitemap-heading mt-8">Ofertas y Promociones</h2>
          <ul class="sitemap-links">
            <li><NuxtLink to="/deals">Ofertas del Mes</NuxtLink></li>
            <li><NuxtLink to="/coupons">Cupones de Descuento</NuxtLink></li>
            <li><NuxtLink to="/loyalty">Programa de Lealtad (Puntos)</NuxtLink></li>
          </ul>
        </div>

        <!-- Columna 2: Comunidad y Aprendizaje -->
        <div class="sitemap-col">
          <h2 class="sitemap-heading">Comunidad y Proyectos</h2>
          <ul class="sitemap-links">
            <li><NuxtLink to="/projects">Galería de Proyectos Maker</NuxtLink></li>
            <li><NuxtLink to="/projects?category=robotics">Proyectos de Robótica</NuxtLink></li>
            <li><NuxtLink to="/projects?category=iot">Proyectos IoT y Domótica</NuxtLink></li>
            <li><NuxtLink to="/blog">Blog Técnico</NuxtLink></li>
            <li><NuxtLink to="/blog?category=tutorial">Tutoriales Paso a Paso</NuxtLink></li>
            <li><NuxtLink to="/blog?category=news">Noticias de Hardware</NuxtLink></li>
          </ul>

          <h2 class="sitemap-heading mt-8">Mi Cuenta</h2>
          <ul class="sitemap-links">
            <li><NuxtLink to="/login">Iniciar Sesión / Registro</NuxtLink></li>
            <li><NuxtLink to="/history">Historial de Consumo</NuxtLink></li>
            <li><NuxtLink to="/profile">Mi Perfil</NuxtLink></li>
            <li><NuxtLink to="/track-order">Rastrear Pedido</NuxtLink></li>
          </ul>
        </div>

        <!-- Columna 3: Soporte y Legal -->
        <div class="sitemap-col">
          <h2 class="sitemap-heading">Atención al Cliente</h2>
          <ul class="sitemap-links">
            <li><NuxtLink to="/customer-service">Centro de Ayuda</NuxtLink></li>
            <li><NuxtLink to="/faq">Preguntas Frecuentes (FAQ)</NuxtLink></li>
            <li><NuxtLink to="/shipping">Envíos y Entregas</NuxtLink></li>
            <li><NuxtLink to="/returns">Políticas de Devolución y Garantía</NuxtLink></li>
            <li><NuxtLink to="/contact">Formulario de Contacto</NuxtLink></li>
          </ul>

          <h2 class="sitemap-heading mt-8">Avisos Legales</h2>
          <ul class="sitemap-links">
            <li><NuxtLink to="/terms">Términos y Condiciones de Uso</NuxtLink></li>
            <li><NuxtLink to="/terms-sale">Términos y Condiciones de Venta</NuxtLink></li>
            <li><NuxtLink to="/privacy">Política de Privacidad</NuxtLink></li>
            <li><NuxtLink to="/cookies">Política de Cookies</NuxtLink></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Mapa del Sitio | ArduinoHN'
});
</script>

<style scoped>
.sitemap-page {
  background-color: var(--bg-main, #fafafa);
  min-height: 60vh;
}

.sitemap-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-dark, #111);
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
}

.sitemap-subtitle {
  font-size: 1.1rem;
  color: #666;
}

.sitemap-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  background-color: var(--bg-card, #ffffff);
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

@media (min-width: 768px) {
  .sitemap-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .sitemap-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 4rem;
  }
}

.sitemap-col {
  display: flex;
  flex-direction: column;
}

.sitemap-heading {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary, #00a896);
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(0, 168, 150, 0.2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sitemap-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sitemap-links li a {
  color: #555;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  display: inline-block;
  padding: 2px 0;
}

.sitemap-links li a:hover {
  color: var(--color-primary, #00a896);
  transform: translateX(5px);
}

.mt-8 {
  margin-top: 2.5rem;
}

.py-12 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.mb-12 {
  margin-bottom: 3rem;
}

.text-center {
  text-align: center;
}
</style>
