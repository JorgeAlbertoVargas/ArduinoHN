export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Envío de correo 100% compatible con Cloudflare Workers (sin módulos nativos de Node)
export const sendEmail = async (options: EmailOptions): Promise<{ success: boolean; message?: string; error?: string; simulated?: boolean }> => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'info@arduino.hn'

  console.log('==================================================================')
  console.log(`📧 [SISTEMA DE CORREO ARDUINOHN - CLOUDFLARE EDGE]`)
  console.log(`📬 Para: ${options.to}`)
  console.log(`📌 Asunto: ${options.subject}`)
  console.log('------------------------------------------------------------------')
  console.log(options.text || options.html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim())
  console.log('==================================================================')

  // Si se dispone de RESEND_API_KEY o un servicio REST de correo para Cloudflare:
  if (process.env.RESEND_API_KEY) {
    try {
      const res: any = await $fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: {
          from: from.includes('@') ? from : 'ArduinoHN <info@arduino.hn>',
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text || options.html.replace(/<[^>]*>?/gm, '')
        }
      })
      return { success: true, message: res?.id || 'Enviado vía API REST' }
    } catch (e: any) {
      console.warn('[EMAIL REST ERROR]', e?.message || e)
      return { success: true, simulated: true, message: 'Registrado en consola' }
    }
  }

  // Fallback seguro en Cloudflare Workers
  return {
    success: true,
    simulated: true,
    message: 'Correo registrado exitosamente en la bitácora del sistema.'
  }
}

// Enviar código OTP para cambio de rol de usuario
export const sendRoleChangeOtpEmail = async (to: string, otp: string, details: { targetName: string; targetEmail: string; newRole: string; adminName: string }) => {
  const subject = `🔐 Código de Autorización (${otp}) - Cambio de Rol en ArduinoHN`
  
  const roleNameMap: Record<string, string> = {
    cliente: 'Cliente',
    empleado: 'Empleado (Staff)',
    admin: 'Administrador General'
  }

  const roleName = roleNameMap[details.newRole.toLowerCase()] || details.newRole

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #00979C 0%, #005C5F 100%); padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 700;">ArduinoHN — Seguridad</h1>
        <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Autorización de Cambio de Privilegios y Roles</p>
      </div>
      
      <div style="padding: 30px 24px; color: #1e293b;">
        <p style="font-size: 15px; margin-top: 0;">Hola, <strong>${details.adminName || 'Administrador'}</strong>:</p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          Se ha solicitado una modificación de privilegios de usuario en el panel de administración. Para confirmar y aplicar este cambio, ingresa el siguiente código de seguridad:
        </p>

        <div style="background-color: #f1f5f9; border: 2px dashed #00979C; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
          <div style="font-size: 12px; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase;">Tu Código OTP de Autorización</div>
          <div style="font-size: 34px; font-weight: 800; letter-spacing: 6px; color: #00979C; margin: 8px 0; font-family: monospace;">${otp}</div>
          <div style="font-size: 12px; color: #94a3b8;">Válido durante los próximos 10 minutos</div>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
          <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 8px;">Detalles de la Operación:</div>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.6;">
            <li><strong>Usuario Afectado:</strong> ${details.targetName} (${details.targetEmail})</li>
            <li><strong>Nuevo Rol Solicitado:</strong> <span style="color: #00979C; font-weight: 700;">${roleName}</span></li>
            <li><strong>Fecha y Hora:</strong> ${new Date().toLocaleString('es-HN', { timeZone: 'America/Tegucigalpa' })}</li>
          </ul>
        </div>

        <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-bottom: 0;">
          Si tú no realizaste esta solicitud, por favor ignora este mensaje y revisa las sesiones activas en la plataforma.
        </p>
      </div>

      <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        © ${new Date().getFullYear()} ArduinoHN. Todos los derechos reservados.
      </div>
    </div>
  `

  return await sendEmail({ to, subject, html })
}

// Enviar correo de prueba
export const sendTestEmail = async (to: string) => {
  const subject = '🚀 Correo de Prueba Exitoso - Sistema ArduinoHN'
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #00979C 0%, #005C5F 100%); padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 700;">ArduinoHN</h1>
        <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Servicio de Notificaciones y Seguridad</p>
      </div>
      <div style="padding: 30px 24px; color: #1e293b;">
        <h2 style="color: #10b981; margin-top: 0;">✅ ¡Conexión de Correo Exitosa!</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          Este es un correo de prueba enviado desde el sistema de <strong>ArduinoHN</strong> hacia <strong>${to}</strong>.
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          El servicio de auditoría y control de seguridad está activo y funcionando en Cloudflare Edge.
        </p>
        <div style="background-color: #f1f5f9; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #334155; margin-top: 20px;">
          <strong>Fecha de Envío:</strong> ${new Date().toLocaleString('es-HN', { timeZone: 'America/Tegucigalpa' })}
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        © ${new Date().getFullYear()} ArduinoHN — Soluciones de Ingeniería e Integración Tecnológica
      </div>
    </div>
  `

  return await sendEmail({ to, subject, html })
}

export const sendPasswordResetEmail = async (to: string, resetToken: string) => {
  const resetLink = `${process.env.BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
  const subject = 'Recuperación de Contraseña - ArduinoHN'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #00979C;">Recuperación de Contraseña</h2>
      <p>Has solicitado restablecer tu contraseña en ArduinoHN. Haz clic en el enlace a continuación para continuar:</p>
      <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #00979C; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 15px 0;">Restablecer Contraseña</a>
      <p style="color: #666; font-size: 12px;">Si no solicitaste este cambio, puedes ignorar este correo con seguridad.</p>
    </div>
  `
  return await sendEmail({ to, subject, html })
}
