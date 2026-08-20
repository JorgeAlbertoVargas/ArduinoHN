<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">Automatización al alcance de todos</h1>
          <p class="hero-subtitle">Descubre la plataforma de Hardware, Software e IIoT líder en Honduras para impulsar tus proyectos desde la idea hasta el mercado.</p>
          <div class="hero-actions">
            <NuxtLink to="/store" class="btn btn-primary btn-lg">Ir a la tienda</NuxtLink>
            <NuxtLink to="/projects" class="btn btn-outline btn-lg">Descubrir proyectos</NuxtLink>
          </div>
        </div>
        <div class="hero-image-wrapper">
          <img src="/hero-board.png" alt="Placa de desarrollo ArduinoHN" class="hero-image" />
        </div>
      </div>
    </section>

    <!-- Ecosystem Section -->
    <section class="ecosystem">
      <div class="container text-center">
        <h2 class="section-title">El Ecosistema ArduinoHN</h2>
        <p class="section-subtitle">Todo lo que necesitas para innovar en un solo lugar.</p>
        
        <div class="feature-grid">
          <div class="feature-card">
            <div class="icon hardware-icon"></div>
            <h3>Hardware</h3>
            <p>Placas, módulos y kits listos para la industria con componentes originales y fiables.</p>
            <NuxtLink to="/store" class="feature-link">Explorar Hardware &rarr;</NuxtLink>
          </div>
          <div class="feature-card">
            <div class="icon software-icon"></div>
            <h3>Software</h3>
            <p>Bibliotecas, ejemplos de código y soluciones open-source para programar rápidamente.</p>
            <NuxtLink to="/projects" class="feature-link">Ver Código &rarr;</NuxtLink>
          </div>
          <div class="feature-card">
            <div class="icon cloud-icon"></div>
            <h3>Cloud & IIoT</h3>
            <p>Conecta tus dispositivos a la nube, monitorea en tiempo real y controla sensores a distancia.</p>
            <NuxtLink to="/blog" class="feature-link">Aprender más &rarr;</NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.landing-page {
  display: flex;
  flex-direction: column;
}
/* Hero Section */
.hero {
  background-color: #ffffff;
  padding: 6rem 0;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.hero-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4rem;
}
.hero-text {
  flex: 1;
  max-width: 600px;
}
.hero-title {
  font-size: 4rem;
  font-weight: 800;
  color: var(--color-dark);
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -1px;
}
.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-muted);
  margin-bottom: 2.5rem;
  line-height: 1.5;
}
.hero-actions {
  display: flex;
  gap: 1rem;
}
.hero-image-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
}
.hero-image {
  max-width: 100%;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
}
.btn-lg {
  padding: 12px 28px;
  font-size: 1.1rem;
}
.btn-outline {
  background-color: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-family);
  display: inline-block;
}
.btn-outline:hover {
  background-color: var(--color-primary);
  color: white;
}

/* Ecosystem Section */
.ecosystem {
  padding: 6rem 0;
  background-color: var(--color-light);
}
.section-title {
  font-size: 2.5rem;
  color: var(--color-dark);
  margin-bottom: 0.5rem;
}
.section-subtitle {
  color: var(--text-muted);
  font-size: 1.1rem;
  margin-bottom: 4rem;
}
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
.feature-card {
  background: #ffffff;
  padding: 3rem 2rem;
  border-radius: 8px;
  text-align: left;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid rgba(0,0,0,0.05);
}
.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.06);
}
.icon {
  width: 48px;
  height: 48px;
  background-color: var(--color-primary);
  border-radius: 8px;
  margin-bottom: 1.5rem;
  opacity: 0.1;
}
.feature-card h3 {
  font-size: 1.5rem;
  color: var(--color-dark);
  margin-bottom: 1rem;
}
.feature-card p {
  color: var(--text-muted);
  margin-bottom: 2rem;
}
.feature-link {
  font-weight: 600;
  color: var(--color-primary);
}
.feature-link:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-inner {
    flex-direction: column;
    text-align: center;
  }
  .hero-actions {
    justify-content: center;
  }
  .hero-title {
    font-size: 3rem;
  }
}
.text-center { text-align: center; }
</style>
