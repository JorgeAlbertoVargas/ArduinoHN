<template>
  <div class="legal-page container">
    <h1 class="page-title">Términos y Condiciones</h1>
    <div class="legal-content glass">
      <p class="last-updated">Última actualización: {{ currentDate }}</p>
      
      <h2>1. Aceptación de los Términos</h2>
      <p>
        Al acceder y utilizar el sitio web de ArduinoHN, operado por Sytec Corp, usted acepta estar sujeto a estos Términos y Condiciones de Uso, todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de cualquier ley local aplicable.
      </p>

      <h2>2. Uso de la Licencia</h2>
      <p>
        Se concede permiso para descargar temporalmente una copia de los materiales (información o software) en el sitio web de ArduinoHN para visualización transitoria personal y no comercial solamente.
      </p>

      <h2>3. Compras y Envíos</h2>
      <p>
        Al realizar una compra en nuestro sitio, usted garantiza que tiene al menos la mayoría de edad en su estado o provincia de residencia. Los productos y servicios están sujetos a disponibilidad y pueden ser retirados en cualquier momento. Nos reservamos el derecho de rechazar cualquier pedido que realice con nosotros.
      </p>

      <h2>4. Puntos de Lealtad (Arduino Points)</h2>
      <p>
        Los puntos acumulados a través de nuestro programa de lealtad no tienen valor en efectivo fuera del ecosistema de ArduinoHN y no pueden ser transferidos ni canjeados por dinero real o en efectivo. ArduinoHN se reserva el derecho de modificar el valor de los puntos o cancelar el programa con previo aviso.
      </p>

      <h2>5. Limitaciones</h2>
      <p>
        En ningún caso ArduinoHN o sus proveedores serán responsables de ningún daño (incluyendo, sin limitación, daños por pérdida de datos o beneficios, o debido a interrupción del negocio) que surja del uso o la imposibilidad de usar los materiales en el sitio de ArduinoHN.
      </p>

      <h2>6. Enlaces Externos</h2>
      <p>
        ArduinoHN no ha revisado todos los sitios vinculados a su sitio web y no es responsable del contenido de dichos sitios vinculados (incluyendo la logística de proveedores o marcas de terceros). El uso de cualquier sitio web vinculado es bajo el propio riesgo del usuario.
      </p>

      <h2>7. Ley Aplicable</h2>
      <p>
        Cualquier reclamación relacionada con el sitio web de ArduinoHN se regirá por las leyes vigentes de la República de Honduras, sin tener en cuenta su conflicto de disposiciones legales.
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
@media (max-width: 768px) {
  .legal-content {
    padding: 1.5rem;
  }
}
</style>
