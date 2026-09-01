<template>
  <div class="hero-carousel-container" @mouseenter="pauseAutoPlay" @mouseleave="startAutoPlay">
    <div class="carousel-track" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
      <div 
        v-for="(slide, index) in slides" 
        :key="slide.id" 
        class="carousel-slide"
        :style="{ backgroundImage: `url(${slide.imageUrl})`, backgroundSize: slide.bgSize || 'cover', backgroundColor: slide.bgColor || 'transparent' }"
      >
        <div class="slide-overlay"></div>
        <div class="slide-content text-center">
          <h2 class="slide-title">{{ slide.title }}</h2>
          <p class="slide-subtitle">{{ slide.subtitle }}</p>
          <div class="slide-actions">
            <NuxtLink :to="slide.actionLink" class="btn-hero-primary">{{ slide.actionText }}</NuxtLink>
            <NuxtLink v-if="slide.secondaryAction" :to="slide.secondaryLink" class="btn-hero-secondary">{{ slide.secondaryAction }}</NuxtLink>
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
    <div class="scroll-indicator" @click="scrollToContent">
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

const slides = [
  {
    id: 1,
    title: 'Model Arduino',
    subtitle: 'El microcontrolador ideal para iniciar en el mundo de la electrónica y robótica.',
    imageUrl: '/images/hero/arduino_hero_1788225992254.jpg',
    actionText: 'Ordenar Ahora',
    actionLink: '/store?q=arduino',
    secondaryAction: 'Ver Tutoriales',
    secondaryLink: '/blog'
  },
  {
    id: 2,
    title: 'Raspberry Pi',
    subtitle: 'Potencia tu laboratorio con computadoras de placa reducida de alto rendimiento.',
    imageUrl: '/images/hero/raspberry_hero_1788226002911.jpg',
    actionText: 'Descubrir Modelos',
    actionLink: '/store?q=raspberry',
  },
  {
    id: 3,
    title: 'Conectividad IoT',
    subtitle: 'Módulos ESP32 con WiFi y Bluetooth para domótica e Internet de las Cosas.',
    imageUrl: '/images/hero/esp32_hero_1788226013725.jpg',
    actionText: 'Ver Módulos',
    actionLink: '/store?q=esp32',
  },
  {
    id: 4,
    title: 'Hardware Vestible',
    subtitle: 'Desarrolla tus propios relojes inteligentes y biosensores con tecnología de punta.',
    imageUrl: '/images/hero/smartwatch_hero_1788226036253.jpg',
    actionText: 'Explorar',
    actionLink: '/store?q=reloj',
  },
  {
    id: 5,
    title: 'Sensores de Precisión',
    subtitle: 'Módulos para monitoreo exacto de temperatura y humedad en tus entornos.',
    imageUrl: '/images/hero/dht11_hero_1788226047648.jpg',
    actionText: 'Comprar Sensores',
    actionLink: '/store?q=sensor',
  },
  {
    id: 6,
    title: 'PLC Arduino Opta',
    subtitle: 'La revolución industrial de Arduino. Micro-PLC para automatización profesional con soporte IoT.',
    imageUrl: '/images/hero/arduino_opta_hero.jpg',
    actionText: 'Descubrir Opta',
    actionLink: '/store?q=opta',
  },
  {
    id: 7,
    title: 'Automatización Industrial',
    subtitle: 'Domina los lenguajes KOP, SCL, Graph y AWL. Lleva tus proyectos al siguiente nivel.',
    imageUrl: '/images/hero/plc_languages_hero.jpg',
    actionText: 'Ver Componentes PLC',
    actionLink: '/store?category=plc',
  },
  {
    id: 8,
    title: 'Infraestructura IoT & Domótica',
    subtitle: 'Arquitecturas completas con Home Assistant, ESP32, HACS y sensores avanzados.',
    imageUrl: '/images/hero/iot_ha_hero.jpg',
    actionText: 'Ver Componentes IoT',
    actionLink: '/store?category=iot',
  },
  {
    id: 9,
    title: 'Telefonía IP & VoIP',
    subtitle: 'Soluciones empresariales con FreePBX, Node-RED, Asterisk y Gateways H2M/H2H.',
    imageUrl: '/images/hero/voip_pbx_hero.jpg',
    actionText: 'Explorar VoIP',
    actionLink: '/store?category=voip',
  },
  {
    id: 10,
    title: 'Desarrollo en C++',
    subtitle: 'Crea software de alto rendimiento y firmware avanzado para sistemas embebidos.',
    imageUrl: '/images/hero/cpp_code_hero.jpg',
    actionText: 'Ver Microcontroladores',
    actionLink: '/store?category=mcu',
  },
  {
    id: 11,
    title: 'MicroPython para IoT',
    subtitle: 'Programa sensores y placas ESP32 de forma rápida y sencilla con Python.',
    imageUrl: '/images/hero/python_code_hero.jpg',
    actionText: 'Ver Módulos ESP32',
    actionLink: '/store?category=esp32',
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
  autoPlayInterval = setInterval(nextSlide, 3000);
};

const pauseAutoPlay = () => {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
  }
};

const scrollToContent = () => {
  window.scrollBy({ top: window.innerHeight * 0.5, left: 0, behavior: 'smooth' });
};

onMounted(() => {
  startAutoPlay();
});

onUnmounted(() => {
  pauseAutoPlay();
});
</script>

<style scoped>
.hero-carousel-container {
  position: relative;
  width: 100%;
  height: 65vh; /* Altura amplia */
  min-height: 500px;
  max-height: 750px;
  overflow: hidden;
  background-color: #000;
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
  background-repeat: no-repeat;
  position: relative;
  display: flex;
  align-items: flex-end; /* Alineación Tesla/Apple al fondo */
  justify-content: center;
  padding-bottom: 12vh;
}

.slide-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%);
  z-index: 1;
}

.slide-content {
  position: relative;
  z-index: 2;
  color: white;
  width: 100%;
  max-width: 900px;
  padding: 0 20px;
}

.slide-title {
  font-size: 3.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.4);
  letter-spacing: -0.5px;
}

.slide-subtitle {
  font-size: 1.25rem;
  font-weight: 400;
  margin-bottom: 2.5rem;
  text-shadow: 0 2px 5px rgba(0,0,0,0.5);
  opacity: 0.95;
}

.slide-actions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.btn-hero-primary, .btn-hero-secondary {
  padding: 12px 40px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.btn-hero-primary {
  background-color: rgba(255, 255, 255, 0.9);
  color: #111;
}
.btn-hero-primary:hover {
  background-color: #fff;
  transform: scale(1.02);
}

.btn-hero-secondary {
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.4);
}
.btn-hero-secondary:hover {
  background-color: rgba(0, 0, 0, 0.8);
  border-color: #fff;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  z-index: 10;
  transition: background 0.3s, transform 0.2s;
  backdrop-filter: blur(5px);
}
.nav-btn:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: translateY(-50%) scale(1.1);
}
.prev-btn { left: 20px; }
.next-btn { right: 20px; }
.nav-btn svg { width: 28px; height: 28px; }

.indicators {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 10;
}
.indicator-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(255,255,255,0.4);
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}
.indicator-dot.active {
  background-color: white;
  transform: scale(1.3);
}

/* Scroll Indicator */
.scroll-indicator {
  position: absolute;
  top: 30px; /* Parte superior de la imagen */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.3s;
}
.scroll-indicator:hover {
  opacity: 1;
}

.mouse {
  width: 44px; /* Duplicado */
  height: 72px; /* Duplicado */
  border: 3px solid rgba(255, 255, 255, 0.6); /* Un poco más grueso */
  border-radius: 24px; /* Duplicado */
  position: relative;
  margin-bottom: 8px; /* Duplicado */
}

.wheel {
  width: 8px; /* Duplicado */
  height: 16px; /* Duplicado */
  background: var(--color-primary, #00a896);
  border-radius: 4px; /* Duplicado */
  position: absolute;
  top: 12px; /* Ajustado al nuevo tamaño */
  left: 50%;
  transform: translateX(-50%);
  animation: scrollWheel 2s infinite cubic-bezier(0.15, 0.41, 0.69, 0.94);
  box-shadow: 0 0 8px rgba(0, 168, 150, 0.8);
}

.arrow-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: -8px; /* Duplicado */
}

.arrow {
  width: 16px; /* Duplicado */
  height: 16px; /* Duplicado */
  border-right: 3px solid rgba(255, 255, 255, 0.6); /* Más grueso */
  border-bottom: 3px solid rgba(255, 255, 255, 0.6); /* Más grueso */
  transform: rotate(45deg);
  animation: scrollArrow 2s infinite;
}

.arrow:nth-child(1) { animation-delay: 0s; margin-bottom: -8px; }
.arrow:nth-child(2) { animation-delay: 0.2s; }

@keyframes scrollWheel {
  0% { top: 12px; opacity: 1; }
  50% { top: 32px; opacity: 0; }
  100% { top: 12px; opacity: 0; }
}

@keyframes scrollArrow {
  0% { opacity: 0; transform: translateY(-10px) rotate(45deg); }
  50% { opacity: 1; border-color: var(--color-primary, #00a896); }
  100% { opacity: 0; transform: translateY(10px) rotate(45deg); }
}

@media (max-width: 768px) {
  .slide-title { font-size: 2.5rem; }
  .slide-subtitle { font-size: 1rem; }
  .slide-actions { flex-direction: column; gap: 1rem; }
  .nav-btn { display: none; }
}
</style>
