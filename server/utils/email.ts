import nodemailer from 'nodemailer'

// Configure standard SMTP transport
// You will need to add SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS to your .env file
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.syteccorp.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'info@syteccorp.com',
    pass: process.env.SMTP_PASS || 'your_smtp_password_here',
  },
})

export const sendPasswordResetEmail = async (to: string, resetToken: string) => {
  // In development/testing without real SMTP, we might just log it
  if (!process.env.SMTP_PASS) {
    console.warn(`[DEV MODE] Password reset email would be sent to ${to} with token: ${resetToken}`)
    return true
  }

  const resetLink = `${process.env.BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

  try {
    const info = await transporter.sendMail({
      from: '"ArduinoHN" <info@arduinohn.com>',
      to,
      subject: 'Recuperación de Contraseña - ArduinoHN',
      text: `Has solicitado recuperar tu contraseña. Por favor haz clic en el siguiente enlace: ${resetLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Recuperación de Contraseña</h2>
          <p>Has solicitado recuperar tu contraseña en ArduinoHN.</p>
          <p>Por favor haz clic en el botón de abajo para restablecer tu contraseña:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        </div>
      `,
    })
    console.log('Message sent: %s', info.messageId)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}
