export default defineEventHandler((event) => {
  return {
    products: [
      { id: 1, title: 'Arduino UNO R4 WiFi', price: 950.00 },
      { id: 2, title: 'Kit de Robótica IIoT', price: 2500.00 },
      { id: 3, title: 'Módulo de Sensor Ultrasónico', price: 120.00 },
      { id: 4, title: 'Display OLED 0.96"', price: 180.00 }
    ]
  }
})
