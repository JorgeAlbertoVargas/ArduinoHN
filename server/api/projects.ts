export default defineEventHandler((event) => {
  return {
    projects: [
      { id: '1', title: 'Monitoreo de Cultivos con LoRa', category: 'Agrotech' },
      { id: '2', title: 'Control de Acceso Biomédico', category: 'IIoT' },
      { id: '3', title: 'Automatización de Invernaderos', category: 'Automatización' }
    ]
  }
})
