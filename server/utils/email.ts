export const sendPasswordResetEmail = async (to: string, resetToken: string) => {
  const resetLink = `${process.env.BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
  
  // En Cloudflare Workers / Pages, nodemailer no es compatible porque requiere módulos
  // nativos de Node (como net, tls, y stream) que no funcionan en el entorno Edge.
  // 
  // Para enviar correos en producción (Cloudflare), debes usar la API REST de un servicio
  // como Resend, SendGrid, MailChannels o Postmark usando $fetch.
  
  // MOCK temporal que solo imprime el enlace en consola
  console.log('----------------------------------------')
  console.log(`[EMAIL SIMULADO] Para: ${to}`)
  console.log(`Enlace de recuperación: ${resetLink}`)
  console.log('----------------------------------------')
  
  /* EJEMPLO CON RESEND API (Recomendado para Cloudflare):
  try {
    await $fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: {
        from: 'info@arduinohn.com',
        to: [to],
        subject: 'Recuperación de Contraseña - ArduinoHN',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Recuperación de Contraseña</h2>
            <p>Haz clic abajo para restablecer tu contraseña:</p>
            <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Restablecer</a>
          </div>
        `
      }
    })
    return true
  } catch (e) {
    return false
  }
  */

  return true
}
