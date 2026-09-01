<template>
  <div class="legal-page container">
    <h1 class="page-title">Política de Privacidad</h1>
    <div class="legal-content glass">
      <p class="last-updated">Última actualización: {{ currentDate }}</p>
      
      <h2>1. Información que Recopilamos</h2>
      <p>
        En ArduinoHN (operado por Sytec Corp), recopilamos información personal que usted nos proporciona voluntariamente, como su nombre, dirección de correo electrónico, dirección de envío y detalles de pago cuando realiza una compra o se registra en nuestro programa de lealtad.
      </p>

      <h2>2. Cómo Utilizamos su Información</h2>
      <p>
        Utilizamos la información recopilada para:
      </p>
      <ul>
        <li>Procesar y completar sus pedidos (incluyendo la coordinación de envíos a través de nuestros almacenes y socios logísticos internacionales).</li>
        <li>Administrar su cuenta y los puntos de lealtad de ArduinoHN.</li>
        <li>Enviar confirmaciones de pedido, actualizaciones de envío y respuestas a consultas de servicio al cliente.</li>
        <li>Mejorar nuestra tienda y la experiencia del usuario.</li>
      </ul>

      <h2>3. Compartir su Información</h2>
      <p>
        No vendemos ni alquilamos su información personal a terceros. Podemos compartir su información con proveedores de servicios de confianza (como procesadores de pago seguros y sistemas de gestión interna) estrictamente para facilitar las operaciones comerciales.
      </p>

      <h2>4. Cookies y Seguimiento</h2>
      <p>
        Nuestro sitio web utiliza "cookies" para mantener un registro de su carrito de compras, recordar sus preferencias y ofrecer una experiencia más personalizada. Puede configurar su navegador para rechazar todas las cookies o indicar cuándo se envía una cookie.
      </p>

      <h2>5. Seguridad de los Datos</h2>
      <p>
        Implementamos medidas de seguridad estándar de la industria para proteger su información personal, incluyendo el uso de cifrado SSL en todas las transacciones a través de nuestra pasarela de pagos segura.
      </p>

      <h2>6. Sus Derechos</h2>
      <p>
        Usted tiene derecho a solicitar el acceso, la corrección o la eliminación de su información personal almacenada en nuestras bases de datos. Para ejercer estos derechos, comuníquese con nosotros a <strong>info@arduino.hn</strong>.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { formatHondurasDateTime } from '~/utils/dateFormatter';

const currentDate = ref('');

onMounted(() => {
  currentDate.value = formatHondurasDateTime(new Date().toISOString()).split(',')[0];
});
</script>

<style scoped>
.legal-page {
  padding-top: 2rem;
  padding-bottom: 4rem;
  min-height: calc(100vh - 200px);
}
.page-title {
  font-size: 2rem;
  color: var(--color-primary);
  margin-bottom: 2rem;
  text-align: center;
}
.legal-content {
  padding: 3rem;
  border-radius: 12px;
  line-height: 1.6;
  color: var(--text-main);
}
.last-updated {
  color: var(--text-muted);
  font-style: italic;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}
.legal-content h2 {
  color: var(--color-secondary);
  font-size: 1.3rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
}
.legal-content p {
  margin-bottom: 1rem;
}
.legal-content ul {
  list-style-type: disc;
  margin-left: 2rem;
  margin-bottom: 1rem;
}
.legal-content li {
  margin-bottom: 0.5rem;
}
@media (max-width: 768px) {
  .legal-content {
    padding: 1.5rem;
  }
}
</style>
