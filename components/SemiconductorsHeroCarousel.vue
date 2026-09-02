<template>
  <div class="semi-hero-carousel-container" @mouseenter="pauseAutoPlay" @mouseleave="startAutoPlay">
    <div class="carousel-track" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
      <div 
        v-for="slide in slides" 
        :key="slide.id" 
        class="carousel-slide"
        :style="{ backgroundImage: `url(${slide.imageUrl})` }"
      >
        <div class="slide-overlay"></div>
        <div class="slide-content text-center">
          <div class="slide-badge">
            <span class="badge-dot"></span>
            <span>{{ slide.badge }}</span>
          </div>
          <h2 class="slide-title">{{ slide.title }}</h2>
          <p class="slide-subtitle">{{ slide.subtitle }}</p>
          <div class="slide-actions">
            <button class="btn-hero-primary" @click="handleAction(slide.query)">
              {{ slide.actionText }}
            </button>
            <button v-if="slide.secondaryAction" class="btn-hero-secondary" @click="scrollToFilters">
              {{ slide.secondaryAction }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Controls -->
    <button class="nav-btn prev-btn" @click="prevSlide" aria-label="Anterior">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>
    <button class="nav-btn next-btn" @click="nextSlide" aria-label="Siguiente">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>

    <!-- Indicators -->
    <div class="indicators">
      <button 
        v-for="(_, index) in slides" 
        :key="index"
        class="indicator-dot"
        :class="{ active: index === currentIndex }"
        @click="goToSlide(index)"
        aria-label="Ir a diapositiva"
      ></button>
    </div>

    <!-- Scroll Indicator -->
    <div class="scroll-indicator" @click="scrollToFilters">
      <div class="mouse">
        <div class="wheel"></div>
      </div>
      <div class="arrow-container">
        <span class="arrow"></span>
        <span class="arrow"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['filter-select']);

const slides = [
  {
    id: 1,
    badge: 'Distribución Global en Honduras',
    title: 'TU PROYECTO NO SE DETIENE POR UN COMPONENTE.',
    subtitle: 'Sabemos lo difícil que es encontrar chips en Honduras. Microcontroladores, ICs, MOSFETs y sensores de precisión: ¿Lo necesitas? ArduinoHN lo consigue y lo trae para ti.',
    imageUrl: '/images/hero/semiconductors_hero_1.jpg',
    actionText: 'Explorar Microcontroladores',
    query: 'Microcontroller',
    secondaryAction: 'Ver Todos los Chips'
  },
  {
    id: 2,
    badge: 'Suministro Maker, Académico & Industrial',
    title: '¿No encuentras el componente que necesitas?',
    subtitle: 'ArduinoHN lo consigue por ti. Accede a millones de semiconductores originales directamente de fábrica. Tú pide, nosotros nos encargamos de todo.',
    imageUrl: '/images/hero/semiconductors_hero_2.jpg',
    actionText: 'Buscar Circuitos Integrados',
    query: 'Integrated Circuit',
    secondaryAction: 'Ver Sensores & MOSFETs'
  },
  {
    id: 3,
    badge: 'Innovación & Prototipado',
    title: 'Imagina. Diseña. Prototipa.',
    subtitle: 'El componente exacto que exige tu esquema técnico, ArduinoHN lo tiene a tu alcance. Pídelo hoy, construye mañana.',
    imageUrl: '/images/hero/semiconductors_hero_3.jpg',
    actionText: 'Ver Catálogo Completo',
    query: '',
    secondaryAction: 'Filtrar Fabricantes'
  }
];

const currentIndex = ref(0);
let autoPlayInterval: any = null;

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % slides.length;
};

const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + slides.length) % slides.length;
};

const goToSlide = (index: number) => {
  currentIndex.value = index;
};

const startAutoPlay = () => {
  autoPlayInterval = setInterval(nextSlide, 4500);
};

const pauseAutoPlay = () => {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
  }
};

const scrollToFilters = () => {
  const el = document.getElementById('search-catalog-section');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  } else {
    window.scrollBy({ top: 450, behavior: 'smooth' });
  }
};

const handleAction = (query: string) => {
  emit('filter-select', query);
  scrollToFilters();
};

onMounted(() => {
  startAutoPlay();
});

onUnmounted(() => {
  pauseAutoPlay();
});
</script>

<style scoped>
.semi-hero-carousel-container {
  position: relative;
  width: 100%;
  height: 60vh;
  min-height: 480px;
  max-height: 650px;
  overflow: hidden;
  background-color: #090e17;
}

.carousel-track {
  display: flex;
  height: 100%;
  width: 100%;
  transition: transform 0.7s cubic-bezier(0.25, 1, 0.5, 1);
}

.carousel-slide {
  flex: 0 0 100%;
  height: 100%;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 10vh;
}

.slide-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(
    180deg, 
    rgba(9, 14, 23, 0.35) 0%, 
    rgba(9, 14, 23, 0.75) 60%, 
    rgba(9, 14, 23, 0.95) 100%
  );
  z-index: 1;
}

.slide-content {
  position: relative;
  z-index: 2;
  color: white;
  width: 100%;
  max-width: 950px;
  padding: 0 20px;
}

.slide-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 168, 150, 0.2);
  border: 1px solid rgba(0, 168, 150, 0.5);
  color: #38bdf8;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
  margin-bottom: 1rem;
  letter-spacing: 0.5px;
  backdrop-filter: blur(8px);
}

.badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
}

.slide-title {
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 0.6rem;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.7);
  letter-spacing: -0.5px;
  line-height: 1.15;
}

.slide-subtitle {
  font-size: 1.15rem;
  font-weight: 400;
  margin-bottom: 2rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  opacity: 0.92;
  max-width: 820px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.45;
  color: #e2e8f0;
}

.slide-actions {
  display: flex;
  justify-content: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.btn-hero-primary, .btn-hero-secondary {
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-hero-primary {
  background: var(--color-primary, #00a896);
  color: #ffffff;
  border: none;
  box-shadow: 0 6px 20px rgba(0, 168, 150, 0.4);
}

.btn-hero-primary:hover {
  background: #008f80;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 168, 150, 0.6);
}

.btn-hero-secondary {
  background: rgba(15, 23, 42, 0.75);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(8px);
}

.btn-hero-secondary:hover {
  background: rgba(15, 23, 42, 0.95);
  border-color: #38bdf8;
  color: #38bdf8;
  transform: translateY(-2px);
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.12);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  z-index: 10;
  transition: background 0.3s, transform 0.2s;
  backdrop-filter: blur(6px);
}

.nav-btn:hover {
  background: rgba(0, 168, 150, 0.5);
  transform: translateY(-50%) scale(1.1);
}

.prev-btn { left: 20px; }
.next-btn { right: 20px; }
.nav-btn svg { width: 24px; height: 24px; }

.indicators {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.indicator-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.35);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator-dot.active {
  background-color: var(--color-primary, #00a896);
  transform: scale(1.35);
  box-shadow: 0 0 8px var(--color-primary, #00a896);
}

/* Scroll Indicator */
.scroll-indicator {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  cursor: pointer;
  opacity: 0.75;
  transition: opacity 0.3s;
}

.scroll-indicator:hover {
  opacity: 1;
}

.mouse {
  width: 32px;
  height: 52px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  position: relative;
  margin-bottom: 4px;
}

.wheel {
  width: 6px;
  height: 12px;
  background: var(--color-primary, #00a896);
  border-radius: 3px;
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  animation: scrollWheel 2s infinite cubic-bezier(0.15, 0.41, 0.69, 0.94);
  box-shadow: 0 0 8px rgba(0, 168, 150, 0.8);
}

.arrow-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.arrow {
  width: 12px;
  height: 12px;
  border-right: 2px solid rgba(255, 255, 255, 0.6);
  border-bottom: 2px solid rgba(255, 255, 255, 0.6);
  transform: rotate(45deg);
  animation: scrollArrow 2s infinite;
}

@keyframes scrollWheel {
  0% { top: 8px; opacity: 1; }
  50% { top: 24px; opacity: 0; }
  100% { top: 8px; opacity: 0; }
}

@keyframes scrollArrow {
  0% { opacity: 0; transform: translateY(-8px) rotate(45deg); }
  50% { opacity: 1; border-color: var(--color-primary, #00a896); }
  100% { opacity: 0; transform: translateY(8px) rotate(45deg); }
}

@media (max-width: 768px) {
  .semi-hero-carousel-container { height: auto; min-height: 440px; padding-top: 2rem; }
  .carousel-slide { padding-bottom: 4rem; }
  .slide-title { font-size: 1.85rem; }
  .slide-subtitle { font-size: 0.95rem; margin-bottom: 1.5rem; }
  .slide-actions { flex-direction: column; gap: 0.75rem; }
  .nav-btn { display: none; }
  .scroll-indicator { display: none; }
}
</style>
