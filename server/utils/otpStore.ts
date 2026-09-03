export interface RoleChangeRequest {
  requestId: string;
  adminEmail: string;
  adminName: string;
  targetUserId: number | string;
  targetUserName: string;
  targetUserEmail: string;
  newRole: string;
  previousRole: string;
  otpCode: string;
  expiresAt: number; // timestamp
}

// In-memory OTP storage
const pendingRequests = new Map<string, RoleChangeRequest>()

export const createRoleChangeRequest = (data: Omit<RoleChangeRequest, 'requestId' | 'otpCode' | 'expiresAt'>): RoleChangeRequest => {
  // Generate 6 digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

  const req: RoleChangeRequest = {
    ...data,
    requestId,
    otpCode,
    expiresAt
  }

  pendingRequests.set(requestId, req)
  return req
}

export const verifyRoleChangeOtp = (requestId: string, otpInput: string): { valid: boolean; request?: RoleChangeRequest; error?: string } => {
  const req = pendingRequests.get(requestId)
  if (!req) {
    return { valid: false, error: 'Solicitud no encontrada o expirada. Por favor solicita un nuevo código.' }
  }

  if (Date.now() > req.expiresAt) {
    pendingRequests.delete(requestId)
    return { valid: false, error: 'El código OTP ha expirado (validez de 10 minutos). Solicita uno nuevo.' }
  }

  if (req.otpCode.trim() !== otpInput.trim()) {
    return { valid: false, error: 'Código de verificación incorrecto. Por favor verifica e intenta de nuevo.' }
  }

  // Valid, delete so it can't be reused
  pendingRequests.delete(requestId)
  return { valid: true, request: req }
}
