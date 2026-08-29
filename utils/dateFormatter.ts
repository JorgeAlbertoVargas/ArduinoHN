// NocoDB server is 3 hours ahead of true UTC. 
// We subtract 3 hours to get true UTC so the frontend can format it correctly for the user's local timezone.
export function fixNocoDBDate(dateString: string | Date | number): string {
  if (!dateString) return new Date().toISOString()
  try {
    const d = new Date(dateString)
    d.setHours(d.getHours() - 3)
    return d.toISOString()
  } catch(e) {
    return new Date().toISOString()
  }
}

export function formatHondurasDate(dateString: string | Date | number): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('es-HN', { timeZone: 'America/Tegucigalpa' });
  } catch (e) {
    return String(dateString);
  }
}

export function formatHondurasTime(dateString: string | Date | number): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleTimeString('es-HN', { timeZone: 'America/Tegucigalpa' });
  } catch (e) {
    return String(dateString);
  }
}

export function formatHondurasDateTime(dateString: string | Date | number): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return `${d.toLocaleDateString('es-HN', { timeZone: 'America/Tegucigalpa' })} ${d.toLocaleTimeString('es-HN', { timeZone: 'America/Tegucigalpa' })}`;
  } catch (e) {
    return String(dateString);
  }
}
