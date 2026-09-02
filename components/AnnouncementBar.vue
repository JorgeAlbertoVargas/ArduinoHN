<template>
  <Transition name="slide-down">
    <div v-if="isVisible" class="announcement-bar">
      <div class="announcement-content">
        <!-- Left spacing or brand link (optional) -->
        <div class="announcement-left hidden-mobile">
          <NuxtLink to="/deals" class="brand-link">OFERTAS ARDUINOHN</NuxtLink>
        </div>

        <!-- Center: Carousel -->
        <div class="announcement-center">
          <button class="nav-arrow" @click="prevMessage" aria-label="Anterior">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          
          <Transition name="fade" mode="out-in">
            <div :key="currentIndex" class="message-text">
              <span v-html="messages[currentIndex]"></span>
            </div>
          </Transition>

          <button class="nav-arrow" @click="nextMessage" aria-label="Siguiente">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

        <!-- Right: Close Button -->
        <div class="announcement-right">
          <button class="close-btn" @click="dismissBar" aria-label="Cerrar banner">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isVisible = ref(true);
const currentIndex = ref(0);
let autoPlayInterval: any = null;

const messages = [
  '<strong>Envío estándar gratuito</strong> en pedidos superiores a L. 1500',
  'Acumula puntos con nuestro <strong>Programa de Lealtad</strong>',
  'Aprovecha nuestras <strong>Ofertas del Mes</strong> con hasta 30% off'
];

const nextMessage = () => {
  currentIndex.value = (currentIndex.value + 1) % messages.length;
  resetAutoPlay();
};

const prevMessage = () => {
  currentIndex.value = (currentIndex.value - 1 + messages.length) % messages.length;
  resetAutoPlay();
};

const dismissBar = () => {
  isVisible.value = false;
  if (import.meta.client) {
    sessionStorage.setItem('announcementDismissed', 'true'); // Using session storage so it resets next time they visit
  }
};

const resetAutoPlay = () => {
  if (autoPlayInterval) clearInterval(autoPlayInterval);
  startAutoPlay();
};

const startAutoPlay = () => {
  autoPlayInterval = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % messages.length;
  }, 5000); // Change message every 5 seconds
};

onMounted(() => {
  if (import.meta.client) {
    const dismissed = sessionStorage.getItem('announcementDismissed');
    if (dismissed === 'true') {
      isVisible.value = false;
    } else {
      startAutoPlay();
    }
  }
});

onUnmounted(() => {
  if (autoPlayInterval) clearInterval(autoPlayInterval);
});
</script>

<style scoped>
.announcement-bar {
  width: 100%;
  background-color: #000000; /* Black for premium look */
  color: #ffffff;
  font-family: var(--font-family, sans-serif);
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 101; /* Above navbar */
}

.announcement-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 8px 20px;
  min-height: 40px;
}

.announcement-left, .announcement-right {
  flex: 1;
  display: flex;
}

.announcement-left {
  justify-content: flex-start;
}

.announcement-right {
  justify-content: flex-end;
}

.brand-link {
  color: #aaaaaa;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.75rem;
  transition: color 0.3s ease;
}

.brand-link:hover {
  color: #ffffff;
}

.announcement-center {
  flex: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  text-align: center;
}

.message-text {
  /* Using deep to style v-html tags if necessary, but <strong> is standard */
}
.message-text :deep(strong) {
  font-weight: 700;
}

.nav-arrow, .close-btn {
  background: transparent;
  border: none;
  color: #888888;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: color 0.3s ease;
}

.nav-arrow:hover, .close-btn:hover {
  color: #ffffff;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.4s ease, opacity 0.4s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

@media (max-width: 768px) {
  .hidden-mobile {
    display: none;
  }
  .announcement-center {
    flex: 1;
    gap: 5px;
  }
  .message-text {
    font-size: 0.75rem;
  }
}
</style>
