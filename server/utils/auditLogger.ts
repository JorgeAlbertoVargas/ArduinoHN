export interface AuditLogEntry {
  id: string | number;
  timestamp: string;
  adminName: string;
  adminEmail: string;
  targetUserId: string | number;
  targetUserName?: string;
  targetUserEmail?: string;
  action: string;
  previousRole?: string;
  newRole: string;
  details: string;
}

// In-memory audit log storage with demo history
let inMemoryLogs: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    adminName: 'Jorge Vargas',
    adminEmail: 'jvargas@syteccorp.com',
    targetUserId: '2',
    targetUserName: 'Carlos Gómez',
    targetUserEmail: 'carlos@arduino.hn',
    action: 'CAMBIO_DE_ROL',
    previousRole: 'cliente',
    newRole: 'empleado',
    details: 'Ascenso de permisos a Empleado para atención de pedidos.'
  }
]

export const logSecurityAction = async (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
  const newLog: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry
  }

  inMemoryLogs.unshift(newLog)
  // Keep last 200 logs
  if (inMemoryLogs.length > 200) {
    inMemoryLogs = inMemoryLogs.slice(0, 200)
  }

  console.log(`[AUDIT LOG] ${newLog.timestamp} | Admin: ${newLog.adminEmail} | Acción: ${newLog.action} | Usuario: ${newLog.targetUserEmail} -> ${newLog.newRole}`)
  return newLog
}

export const getAuditLogs = async (): Promise<AuditLogEntry[]> => {
  return inMemoryLogs
}
