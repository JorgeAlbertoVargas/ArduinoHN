<template>
  <div class="landing-page">
    <!-- Hero Section (Apple Style) -->
    <section class="apple-hero">
      <div class="hero-bg-overlay"></div>
      <div class="container hero-inner text-center">
        <div class="hero-logo-wrapper">
          <img src="/logo.png" alt="ArduinoHN Logo" class="hero-logo glow-effect" />
        </div>
        
        <h1 class="hero-title">ArduinoHN</h1>
        
        <p class="hero-slogan">
          Automatización <span class="dot">•</span> 
          Innovación <span class="dot">•</span> 
          Investigación & Desarrollo <span class="dot">•</span> 
          Motivación <span class="dot">•</span> 
          Líder Tecnológico
        </p>
        
        <div class="hero-actions justify-center mt-4" style="display: flex; gap: 1rem;">
          <NuxtLink to="/store" class="btn btn-primary btn-apple">Descubre la tienda</NuxtLink>
          <button class="btn btn-outline btn-apple" @click="isVideoModalOpen = true">Ver Presentación</button>
        </div>
      </div>
    </section>

    <VideoModal 
      :is-open="isVideoModalOpen" 
      video-url="promo" 
      @close="isVideoModalOpen = false" 
    />

    <!-- Acronym DNA Section -->
    <section class="acronym-dna">
      <div class="container text-center">
        <h2 class="section-title">El ADN de ARDUINOHN</h2>
        <p class="section-subtitle">Lo que nos define en cada letra</p>
        
        <div class="dna-grid">
          <div class="dna-card">
            <div class="dna-icon-wrap">
              <span class="dna-bg-letter">A</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dna-icon"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </div>
            <h3>Automatización</h3>
            <p>Automatización Industrial con PLCs y Microcontroladores.</p>
          </div>
          <div class="dna-card">
            <div class="dna-icon-wrap">
              <span class="dna-bg-letter">R</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dna-icon"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
            </div>
            <h3>Robótica</h3>
            <p>Robótica Móvil e Industrial.</p>
          </div>
          <div class="dna-card">
            <div class="dna-icon-wrap">
              <span class="dna-bg-letter">D</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dna-icon"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
            </div>
            <h3>Desarrollo</h3>
            <p>Desarrollo de hardware y Software.</p>
          </div>
          <div class="dna-card">
            <div class="dna-icon-wrap">
              <span class="dna-bg-letter">U</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dna-icon"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            </div>
            <h3>Universalidad</h3>
            <p>Universalidad en el uso de herramientas tecnológicas.</p>
          </div>
          <div class="dna-card">
            <div class="dna-icon-wrap">
              <span class="dna-bg-letter">I</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dna-icon"><path d="M12 2v4"></path><path d="M12 18v4"></path><path d="M4.93 4.93l2.83 2.83"></path><path d="M16.24 16.24l2.83 2.83"></path><path d="M2 12h4"></path><path d="M18 12h4"></path><path d="M4.93 19.07l2.83-2.83"></path><path d="M16.24 7.76l2.83-2.83"></path><circle cx="12" cy="12" r="4"></circle></svg>
            </div>
            <h3>Inteligencia Artificial</h3>
            <p>Lenguaje Natural, Agentes Inteligentes.</p>
          </div>
          <div class="dna-card">
            <div class="dna-icon-wrap">
              <span class="dna-bg-letter">N</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dna-icon"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
            <h3>Nuevas Tecnologías</h3>
            <p>Tecnologías con IIoT para el Hogar Inteligente.</p>
          </div>
          <div class="dna-card">
            <div class="dna-icon-wrap">
              <span class="dna-bg-letter">O</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dna-icon"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a5 5 0 0 1 5 5c0 1.43-.8 2.59-1.54 3.44a5.22 5.22 0 0 0-1.46 3.56v2h-4v-2a5.22 5.22 0 0 0-1.46-3.56C7.8 10.59 7 9.43 7 7a5 5 0 0 1 5-5z"></path></svg>
            </div>
            <h3>Originalidad</h3>
            <p>Originalidad en implementación de soluciones a medida.</p>
          </div>
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
            <div class="icon hardware-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
            </div>
            <h3>Hardware</h3>
            <p>Placas, módulos y kits listos para la industria con componentes originales y fiables.</p>
            <NuxtLink to="/store" class="feature-link">Explorar Hardware &rarr;</NuxtLink>
          </div>
          <div class="feature-card">
            <div class="icon software-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            </div>
            <h3>Software</h3>
            <p>Bibliotecas, ejemplos de código y soluciones open-source para programar rápidamente.</p>
            <NuxtLink to="/projects" class="feature-link">Ver Código &rarr;</NuxtLink>
          </div>
          <div class="feature-card">
            <div class="icon cloud-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19A4.5 4.5 0 0 0 18 10h-1.26A8 8 0 1 0 3 16.29"></path><path d="M8 22h8"></path><path d="M12 16v6"></path></svg>
            </div>
            <h3>IIoT & Cloud</h3>
            <p>Conecta tus dispositivos a la nube, monitorea en tiempo real y controla sensores a distancia.</p>
            <NuxtLink to="/blog" class="feature-link">Aprender más &rarr;</NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const isVideoModalOpen = ref(false);
</script>

<style scoped>
.landing-page {
  display: flex;
  flex-direction: column;
}

/* Hero Section (Apple Style) */
.apple-hero {
  position: relative;
  background: linear-gradient(135deg, #f0f8ff 0%, #e0f2f1 100%);
  padding: 8rem 0;
  overflow: hidden;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.hero-bg-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80vw;
  height: 80vw;
  max-width: 800px;
  max-height: 800px;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(0,168,150,0.15) 0%, rgba(255,255,255,0) 70%);
  z-index: 0;
  pointer-events: none;
}

.apple-hero .hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.hero-logo-wrapper {
  margin-bottom: 1.5rem;
  position: relative;
}

.hero-logo {
  height: 120px;
  width: auto;
  filter: brightness(0) saturate(100%) invert(42%) sepia(51%) saturate(2320%) hue-rotate(143deg) brightness(93%) contrast(101%);
  animation: float 6s ease-in-out infinite;
}

.glow-effect {
  filter: brightness(0) saturate(100%) invert(42%) sepia(51%) saturate(2320%) hue-rotate(143deg) brightness(93%) contrast(101%) drop-shadow(0 0 25px rgba(0, 168, 150, 0.6));
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.apple-hero .hero-title {
  font-size: 5rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1.1;
  margin-bottom: 1rem;
  letter-spacing: -2px;
}



.hero-slogan {
  font-size: 1.4rem;
  font-weight: 500;
  color: #444;
  max-width: 800px;
  margin: 0 auto 2.5rem;
  line-height: 1.6;
  letter-spacing: -0.5px;
}

.hero-slogan .dot {
  color: var(--color-primary);
  margin: 0 0.4rem;
  opacity: 0.6;
}

.hero-actions.justify-center {
  justify-content: center;
}

.mt-4 { margin-top: 1rem; }

.btn-apple {
  padding: 14px 32px;
  font-size: 1.2rem;
  border-radius: 30px;
  font-weight: 600;
  box-shadow: 0 10px 20px rgba(0, 168, 150, 0.2);
  transition: all 0.3s ease;
}
.btn-apple:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 15px 25px rgba(0, 168, 150, 0.3);
}

.btn-outline {
  background-color: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
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
  width: 56px;
  height: 56px;
  background-color: rgba(0, 168, 150, 0.1);
  color: var(--color-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}
.icon svg {
  width: 28px;
  height: 28px;
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

/* Acronym DNA Section */
.acronym-dna {
  padding: 5rem 0 6rem;
  background-color: #ffffff;
}

.dna-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

/* Make it look like a 4-top, 3-bottom grid on large screens */
@media (min-width: 1024px) {
  .dna-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  .dna-card:nth-child(5) {
    grid-column: 2 / span 1; /* Center the bottom row of 3 */
  }
}
@media (min-width: 1200px) {
  .dna-grid {
    grid-template-columns: repeat(7, 1fr); /* Actually, 7 in a row is too much text. Let's force 4 then 3 */
  }
  .dna-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  .dna-card {
    flex: 0 1 23%; /* Approx 4 per row */
  }
}

.dna-card {
  background: var(--bg-card);
  padding: 2.5rem 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  transition: all 0.3s ease;
  border: 1px solid var(--glass-border);
  position: relative;
  overflow: hidden;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dna-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 151, 156, 0.12);
  border-color: rgba(0, 151, 156, 0.3);
}

.dna-icon-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dna-bg-letter {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 5rem;
  font-weight: 900;
  color: var(--color-primary);
  opacity: 0.1;
  line-height: 1;
  z-index: 0;
}

.dna-icon {
  width: 32px;
  height: 32px;
  color: var(--color-primary);
  z-index: 1;
}

.dna-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 1;
}

.dna-card p {
  font-size: 0.95rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0;
  position: relative;
  z-index: 1;
}



/* Responsive */
@media (max-width: 768px) {
  .apple-hero {
    padding: 4rem 0;
  }
  .hero-inner {
    flex-direction: column;
    text-align: center;
  }
  .hero-actions.justify-center {
    flex-direction: column;
    align-items: center;
    gap: 1rem !important;
  }
  .apple-hero .hero-title {
    font-size: 2.8rem;
  }
  .hero-slogan {
    font-size: 1.1rem;
    padding: 0 1rem;
  }
  .btn-apple {
    width: 100%;
    max-width: 300px;
  }
}
.text-center { text-align: center; }
</style>
