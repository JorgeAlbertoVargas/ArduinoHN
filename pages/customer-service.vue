<template>
  <div class="customer-service-page container">
    <div class="hero-section text-center">
      <h1 class="page-title">Centro de Ayuda y Servicio al Cliente</h1>
      <p class="subtitle">Estamos aquí para apoyarte en tus proyectos tecnológicos.</p>
    </div>

    <div class="content-grid">
      <!-- Sección FAQ -->
      <div class="faq-section glass">
        <h2>Preguntas Frecuentes</h2>
        
        <div class="accordion">
          <div 
            v-for="(faq, index) in faqs" 
            :key="index" 
            class="accordion-item"
            :class="{ active: activeIndex === index }"
          >
            <div class="accordion-header" @click="toggleAccordion(index)">
              <h3>{{ faq.question }}</h3>
              <span class="icon">{{ activeIndex === index ? '-' : '+' }}</span>
            </div>
            <div class="accordion-content" v-show="activeIndex === index">
              <p v-html="faq.answer"></p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección Contacto -->
      <div class="contact-section">
        <!-- Info Cards -->
        <div class="contact-cards">
          <div class="contact-card glass">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <h3>Envíanos un Correo</h3>
            <p>Resolvemos dudas técnicas y comerciales.</p>
            <a href="mailto:info@syteccorp.com" class="contact-link">info@arduino.hn</a>
          </div>
          
          <div class="contact-card glass">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <h3>Horario de Atención</h3>
            <p>Lunes a Viernes</p>
            <strong>8:00 AM - 5:00 PM</strong>
          </div>
        </div>

        <!-- Formulario de Contacto -->
        <div class="contact-form glass">
          <h2>Envíanos un Mensaje</h2>
          <form @submit.prevent="submitForm">
            <div class="form-fields">
              <div class="form-group">
                <label for="name">Nombre Completo</label>
                <input type="text" id="name" v-model="form.name" required placeholder="Ej. Juan Pérez" />
              </div>
              
              <div class="form-group">
                <label for="email">Correo Electrónico</label>
                <input type="email" id="email" v-model="form.email" required placeholder="tu@correo.com" />
              </div>
              
              <div class="form-group">
                <label for="subject">Asunto</label>
                <select id="subject" v-model="form.subject" required>
                  <option value="" disabled>Selecciona un tema...</option>
                  <option value="Soporte Técnico">Soporte Técnico</option>
                  <option value="Consulta de Envíos">Consulta de Envíos</option>
                  <option value="Garantías y Devoluciones">Garantías y Devoluciones</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="message">Mensaje</label>
                <textarea id="message" v-model="form.message" required rows="4" placeholder="¿En qué te podemos ayudar?"></textarea>
              </div>
            </div>
            
            <button type="submit" class="btn btn-primary submit-btn" :disabled="isSubmitting">
              {{ isSubmitting ? 'Enviando...' : 'Enviar Mensaje' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useToast } from '~/composables/useToast';

const toast = useToast();

const faqs = [
  {
    question: '¿Cuáles son los tiempos de envío?',
    answer: 'Para garantizar la mejor experiencia, estamos optimizando nuestra logística. <strong>Los envíos nacionales en Honduras</strong> se encuentran actualmente en un estudio de zonificación para asegurar entregas rápidas según el área geográfica y disponibilidad. En cuanto a nuestras <strong>importaciones de almacenes internacionales</strong>, el proceso de desaduanaje y traslado hasta tu puerta toma un tiempo estimado de 7 a 14 días hábiles. ¡Siempre te mantendremos informado del estado de tu paquete!'
  },
  {
    question: '¿Cómo funcionan los Puntos de Lealtad?',
    answer: 'Acumulas puntos con cada compra completada. Puedes usar estos puntos en el carrito de compras para obtener descuentos automáticos en tus próximos pedidos. Los puntos no aplican a productos que ya están en oferta.'
  },
  {
    question: '¿Tienen garantía los componentes?',
    answer: 'Sí, todos nuestros componentes electrónicos tienen garantía contra defectos de fábrica. Por favor revisa nuestra <a href="/terms" class="text-primary">página de Términos y Condiciones</a> para más detalles sobre políticas de reembolso y devoluciones.'
  },
  {
    question: '¿Puedo comprar si no tengo tarjeta de crédito?',
    answer: 'Actualmente nuestro Checkout oficial acepta Tarjetas de Crédito y Débito de forma totalmente segura. Si necesitas otro método de pago, envíanos un mensaje a info@arduino.hn para asistirte de forma personalizada.'
  }
];

const activeIndex = ref<number | null>(0);

const toggleAccordion = (index: number) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
});

const isSubmitting = ref(false);

const submitForm = async () => {
  isSubmitting.value = true;
  
  // Simulando una petición a la API
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  toast.showToast('¡Mensaje enviado con éxito! Te contactaremos pronto.', 5000);
  
  form.value = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  
  isSubmitting.value = false;
};
</script>

<style scoped>
.customer-service-page {
  padding-top: 2rem;
  padding-bottom: 4rem;
}
.hero-section {
  margin-bottom: 3rem;
}
.page-title {
  font-size: 2.5rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}
.subtitle {
  font-size: 1.1rem;
  color: var(--text-muted);
}
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: stretch;
}
.faq-section {
  padding: 2rem;
  border-radius: 12px;
}
.faq-section h2 {
  color: var(--color-secondary);
  margin-bottom: 1.5rem;
}
.accordion-item {
  border-bottom: 1px solid var(--glass-border);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
}
.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem 0;
  transition: color 0.3s;
}
.accordion-header:hover h3 {
  color: var(--color-primary);
}
.accordion-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}
.accordion-header .icon {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
}
.accordion-content {
  padding: 1rem 0;
  color: var(--text-main);
  line-height: 1.6;
  animation: fadeIn 0.3s ease;
}
.contact-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.contact-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
.contact-card {
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.contact-card svg {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}
.contact-card h3 {
  font-size: 1.1rem;
  margin: 0;
}
.contact-card p {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0;
}
.contact-link {
  font-weight: bold;
  color: var(--color-primary);
  text-decoration: none;
  font-size: 1.1rem;
  margin-top: 0.5rem;
}
.contact-link:hover {
  text-decoration: underline;
}
.contact-form {
  padding: 2rem;
  border-radius: 12px;
}
.contact-form h2 {
  color: var(--color-secondary);
  margin-bottom: 1.5rem;
}
.form-fields {
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  margin-bottom: 1.5rem;
  overflow: hidden;
}
.form-group {
  padding: 1.25rem;
  border-bottom: 1px solid var(--glass-border);
  transition: background-color 0.3s;
}
.form-group:last-child {
  border-bottom: none;
}
.form-group:nth-child(even) {
  background-color: rgba(0, 0, 0, 0.02);
}
.form-group:hover {
  background-color: rgba(0, 151, 156, 0.03);
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-main);
}
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background: var(--bg-main);
  color: var(--text-main);
  font-family: inherit;
  transition: border-color 0.3s, box-shadow 0.3s;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 151, 156, 0.1);
}
.submit-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: bold;
}
.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 992px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 600px) {
  .contact-cards {
    grid-template-columns: 1fr;
  }
}
</style>
