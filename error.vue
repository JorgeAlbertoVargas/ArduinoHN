<template>
  <div class="error-page">
    <div class="hero-bg-overlay"></div>
    <div class="content-wrapper container text-center">
      <div class="logo-wrapper">
        <img src="/logo.png" alt="ArduinoHN" class="logo-img glow-effect" />
      </div>
      
      <h1 class="error-title">
        <span v-if="error?.statusCode === 404">Página en Construcción</span>
        <span v-else>Algo salió mal</span>
      </h1>
      
      <p class="error-subtitle">
        <span v-if="error?.statusCode === 404">
          Estamos preparando algo increíble para ti en esta sección. Vuelve pronto.
        </span>
        <span v-else>
          Ha ocurrido un error inesperado ({{ error?.statusCode }}). Nuestro equipo ya lo está revisando.
        </span>
      </p>

      <div class="quote-box">
        <p class="quote-text">"{{ currentQuote.text }}"</p>
        <p class="quote-author">— {{ currentQuote.author }}</p>
      </div>
      
      <div class="actions">
        <button class="btn btn-primary btn-apple" @click="handleError">
          Regresar a la Tienda
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { clearError } from '#app';
import { techQuotes } from '~/utils/quotes';

const props = defineProps({
  error: Object
});

const currentQuote = ref(techQuotes[0]);

onMounted(() => {
  // Select a random quote on mount
  const randomIndex = Math.floor(Math.random() * techQuotes.length);
  currentQuote.value = techQuotes[randomIndex];
});

const handleError = () => {
  clearError({ redirect: '/store' });
};
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f8ff 0%, #e0f2f1 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.hero-bg-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100vw;
  height: 100vw;
  max-width: 1000px;
  max-height: 1000px;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(0,168,150,0.1) 0%, rgba(255,255,255,0) 70%);
  z-index: 0;
  pointer-events: none;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  max-width: 800px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-wrapper {
  margin-bottom: 2rem;
}

.logo-img {
  height: 100px;
  width: auto;
  filter: brightness(0) saturate(100%) invert(42%) sepia(51%) saturate(2320%) hue-rotate(143deg) brightness(93%) contrast(101%);
  animation: float 6s ease-in-out infinite;
}

.glow-effect {
  filter: brightness(0) saturate(100%) invert(42%) sepia(51%) saturate(2320%) hue-rotate(143deg) brightness(93%) contrast(101%) drop-shadow(0 0 20px rgba(0, 168, 150, 0.4));
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.error-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--color-dark, #333);
  margin-bottom: 1rem;
  letter-spacing: -1.5px;
}

.error-subtitle {
  font-size: 1.25rem;
  color: #555;
  margin-bottom: 3rem;
  line-height: 1.6;
  max-width: 600px;
}

.quote-box {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  margin-bottom: 3rem;
  max-width: 600px;
  width: 100%;
}

.quote-text {
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--color-primary, #00a896);
  font-style: italic;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.quote-author {
  font-size: 1rem;
  color: #666;
  font-weight: 600;
  text-align: right;
}

.btn-apple {
  padding: 14px 32px;
  font-size: 1.1rem;
  border-radius: 30px;
  font-weight: 600;
  background-color: var(--color-primary, #00a896);
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(0, 168, 150, 0.2);
  transition: all 0.3s ease;
}

.btn-apple:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 15px 25px rgba(0, 168, 150, 0.3);
}

.text-center { text-align: center; }
</style>
