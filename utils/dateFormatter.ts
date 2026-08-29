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
