<template>
  <div class="container projects-page">
    <div class="projects-header text-center">
      <h1>Proyectos e IIoT</h1>
      <p>Código, arquitectura y soluciones para automatización industrial.</p>
    </div>
    
    <div class="projects-list">
      <ProjectCard 
        v-for="project in projects" 
        :key="project.id"
        :id="project.id"
        :title="project.title"
        :category="project.category"
        :excerpt="project.excerpt"
      />
    </div>
  </div>
</template>

<script setup>
const projects = [
  { id: '1', title: 'Monitoreo de Cultivos con LoRa', category: 'Agrotech', excerpt: 'Implementación de sensores de humedad y temperatura transmitiendo datos a un servidor central vía LoRaWAN.' },
  { id: '2', title: 'Control de Acceso Biomédico', category: 'IIoT', excerpt: 'Sistema de control de acceso utilizando Arduino Portenta y reconocimiento facial.' },
  { id: '3', title: 'Automatización de Invernaderos', category: 'Automatización', excerpt: 'Código completo para controlar ventilación y riego automatizado según condiciones climáticas.' }
]
</script>

<style scoped>
.projects-page {
  padding: 4rem 0;
}
.projects-header {
  margin-bottom: 4rem;
}
.projects-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}
.text-center {
  text-align: center;
}
</style>
