<template>
  <div class="promo-container">
    <div class="slide slide-1">
      <img src="/logo.png" alt="ArduinoHN" class="promo-logo" />
      <h2 class="slide-title">Bienvenido a ArduinoHN</h2>
    </div>
    
    <div class="slide slide-2">
      <div class="icon-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
      </div>
      <h2 class="slide-title text-primary">El Hardware que necesitas</h2>
      <p class="slide-text">Componentes, placas y módulos industriales.</p>
    </div>

    <div class="slide slide-3">
      <div class="icon-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19A4.5 4.5 0 0 0 18 10h-1.26A8 8 0 1 0 3 16.29"></path><path d="M8 22h8"></path><path d="M12 16v6"></path></svg>
      </div>
      <h2 class="slide-title text-primary">Líderes en IIoT</h2>
      <p class="slide-text">Conecta tus ideas a la nube desde Honduras para el mundo.</p>
    </div>

    <div class="slide slide-4">
      <h2 class="slide-title glow">Construyamos el Futuro.</h2>
      <p class="slide-text">Explora nuestro catálogo ahora.</p>
    </div>
  </div>
</template>

<style scoped>
.promo-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, #111 0%, #1a2a29 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: white;
  text-align: center;
  border-radius: 12px;
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  opacity: 0;
  transform: scale(0.95);
  animation-duration: 16s; /* Total duration of all 4 slides (4s each) */
  animation-iteration-count: infinite;
}

/* Slide 1: 0-4s */
.slide-1 {
  animation-name: slideAnim1;
}
/* Slide 2: 4-8s */
.slide-2 {
  animation-name: slideAnim2;
}
/* Slide 3: 8-12s */
.slide-3 {
  animation-name: slideAnim3;
}
/* Slide 4: 12-16s */
.slide-4 {
  animation-name: slideAnim4;
}

@keyframes slideAnim1 {
  0% { opacity: 0; transform: scale(0.95); }
  5% { opacity: 1; transform: scale(1); }
  20% { opacity: 1; transform: scale(1.02); }
  25% { opacity: 0; transform: scale(1.05); }
  100% { opacity: 0; }
}

@keyframes slideAnim2 {
  0% { opacity: 0; }
  25% { opacity: 0; transform: scale(0.95); }
  30% { opacity: 1; transform: scale(1); }
  45% { opacity: 1; transform: scale(1.02); }
  50% { opacity: 0; transform: scale(1.05); }
  100% { opacity: 0; }
}

@keyframes slideAnim3 {
  0% { opacity: 0; }
  50% { opacity: 0; transform: scale(0.95); }
  55% { opacity: 1; transform: scale(1); }
  70% { opacity: 1; transform: scale(1.02); }
  75% { opacity: 0; transform: scale(1.05); }
  100% { opacity: 0; }
}

@keyframes slideAnim4 {
  0% { opacity: 0; }
  75% { opacity: 0; transform: scale(0.95); }
  80% { opacity: 1; transform: scale(1); }
  95% { opacity: 1; transform: scale(1.02); }
  100% { opacity: 0; transform: scale(1.05); }
}

.promo-logo {
  height: 80px;
  width: auto;
  margin-bottom: 2rem;
  filter: brightness(0) invert(1);
}

.slide-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.slide-title.glow {
  text-shadow: 0 0 20px rgba(0, 168, 150, 0.8);
}

.text-primary {
  color: #00a896;
}

.slide-text {
  font-size: 1.25rem;
  color: #ccc;
  max-width: 600px;
}

.icon-wrapper {
  margin-bottom: 1.5rem;
  color: #00a896;
}
</style>
