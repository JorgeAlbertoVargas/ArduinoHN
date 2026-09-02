<template>
  <Transition name="fade">
    <div v-if="isVisible" class="welcome-modal-overlay">
      <div class="welcome-modal-card">
        <button class="close-btn" @click="closeModal" aria-label="Cerrar modal">&times;</button>
        
        <div class="modal-content text-center">
          <h2 class="modal-title">¡Bienvenido a ArduinoHN!</h2>
          <p class="modal-text">
            Detectamos que nos visitas desde <strong>{{ userCountry }}</strong>.
          </p>
          <p class="modal-text">
            Para tu comodidad, todos los precios se muestran en <strong>{{ userCurrency }}</strong> por defecto. 
            Puedes ver su equivalente en USD presionando el indicador <span class="badge">USD</span> en cada producto.
          </p>
          <p class="modal-text text-sm mt-3">
            <em>Los impuestos están siempre incluidos.</em>
          </p>
          
          <button class="btn btn-primary mt-6 w-full continue-btn" @click="closeModal">
            CONTINUAR
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGlobalCurrencyConfig } from '~/composables/useGlobalCurrencyConfig';

const { userCountry, userCurrency } = useGlobalCurrencyConfig();
const isVisible = ref(false);

onMounted(() => {
  // Solo mostramos el modal si estamos en el cliente y el usuario no lo ha visto
  if (import.meta.client) {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeModal');
    if (!hasSeenWelcome) {
      // Pequeño delay para que no aparezca tan bruscamente
      setTimeout(() => {
        isVisible.value = true;
      }, 800);
    }
  }
});

const closeModal = () => {
  isVisible.value = false;
  if (import.meta.client) {
    localStorage.setItem('hasSeenWelcomeModal', 'true');
  }
};
</script>

<style scoped>
.welcome-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.welcome-modal-card {
  background-color: var(--bg-card, #ffffff);
  border-radius: 12px;
  padding: 2.5rem 2rem;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #888;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--color-primary, #00a896);
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--color-primary, #00a896);
}

.modal-text {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  color: var(--text-color, #333);
}

.badge {
  background-color: var(--color-primary, #00a896);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
}

.text-sm {
  font-size: 0.9rem;
  color: #666;
}

.continue-btn {
  padding: 14px;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 1px;
  background-color: #222;
  color: white;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.continue-btn:hover {
  background-color: #000;
  transform: translateY(-2px);
}

.w-full {
  width: 100%;
}

.mt-3 {
  margin-top: 0.75rem;
}

.mt-6 {
  margin-top: 1.5rem;
}

/* Transición Vue */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
