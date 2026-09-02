interface CachedToken {
  accessToken: string;
  expiresAt: number; // Unix timestamp in ms
}

let tokenCache: CachedToken | null = null;

/**
 * Obtiene un token Bearer OAuth2 para la API de DigiKey utilizando client_credentials.
 * Mantiene el token en memoria y lo renueva automáticamente antes de expirar.
 */
export async function getDigikeyAccessToken(): Promise<string> {
  const config = useRuntimeConfig();
  const clientId = config.digikeyClientId;
  const clientSecret = config.digikeyClientSecret;

  if (!clientId || !clientSecret) {
    throw new Error('DigiKey Client ID o Client Secret no están configurados en runtimeConfig o .env');
  }

  const now = Date.now();
  // Si el token en caché es válido y le quedan al menos 60 segundos de vida, lo reutilizamos
  if (tokenCache && tokenCache.expiresAt > now + 60000) {
    return tokenCache.accessToken;
  }

  try {
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'client_credentials');

    const response = await $fetch<{
      access_token: string;
      token_type: string;
      expires_in: number;
    }>('https://api.digikey.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response || !response.access_token) {
      throw new Error('Respuesta inválida al solicitar token de DigiKey');
    }

    const expiresInMs = (response.expires_in || 86400) * 1000;
    tokenCache = {
      accessToken: response.access_token,
      expiresAt: now + expiresInMs
    };

    return tokenCache.accessToken;
  } catch (err: any) {
    console.error('Error obteniendo token OAuth2 de DigiKey:', err?.data || err?.message || err);
    throw createError({
      statusCode: 502,
      statusMessage: 'Error de autenticación con la API de DigiKey: ' + (err?.message || 'Bad Gateway')
    });
  }
}

/**
 * Helper para realizar llamadas autenticadas a la API de DigiKey
 */
export async function fetchDigikeyApi<T = any>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    query?: Record<string, any>;
  } = {}
): Promise<T> {
  const config = useRuntimeConfig();
  const token = await getDigikeyAccessToken();

  const baseUrl = 'https://api.digikey.com';
  const url = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'X-DIGIKEY-Client-Id': config.digikeyClientId,
    'X-DIGIKEY-Locale-Site': config.digikeyLocaleSite || 'US',
    'X-DIGIKEY-Locale-Language': config.digikeyLocaleLanguage || 'es',
    'X-DIGIKEY-Locale-Currency': config.digikeyLocaleCurrency || 'USD',
    'Content-Type': 'application/json'
  };

  try {
    const data = await $fetch<T>(url, {
      method: options.method || 'GET',
      headers,
      body: options.body,
      query: options.query
    });
    return data;
  } catch (err: any) {
    console.error(`Error en llamada DigiKey [${options.method || 'GET'} ${path}]:`, err?.data || err?.message || err);
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage: err?.data?.errorMessage || err?.message || 'Error al comunicarse con DigiKey'
    });
  }
}
