# Reglas y Directrices de Despliegue en Cloudflare Pages / Workers

Este documento define las directrices y requisitos estrictos para mantener compatibilidad total con el pipeline de compilación y el entorno de ejecución Edge de Cloudflare Pages en **ArduinoHN**.

---

## 1. Gestión de Paquetes y Repositorio (PNPM)

* **NUNCA crear ni commitear `pnpm-workspace.yaml`:**
  - Este repositorio es una aplicación Nuxt autónoma de paquete único, **no un monorepo**.
  - Cloudflare Pages ejecuta `pnpm@10+`. Si existe un archivo `pnpm-workspace.yaml`, el comando `pnpm install --frozen-lockfile` fallará de inmediato con el error: `ERROR packages field missing or empty`.
* **Uso estricto de `pnpm-lock.yaml`:**
  - Todas las dependencias añadidas deben sincronizarse con `pnpm-lock.yaml`.

---

## 2. Compatibilidad con el Entorno Edge de Cloudflare Workers

* **Evitar módulos nativos de Node.js incompatibles:**
  - Cloudflare Workers corre en V8 Isolates (Edge Runtime). No dispone de módulos nativos de Node como `net`, `tls`, `fs` o `child_process` a nivel de servidor Edge.
  - Para autenticación / criptografía, usar siempre librerías isomórficas como `jose` y `bcryptjs`.
  - Para envíos de red y correos en producción, utilizar APIs REST basadas en `$fetch` (ej. Resend, SendGrid o APIs HTTP seguras).
* **Variables de Entorno y Secrets:**
  - El archivo `.env` está en `.gitignore` y **nunca debe subirse al repositorio**.
  - Las variables se gestionan a través del panel de Cloudflare Pages (Environment Variables) y se consumen vía `useRuntimeConfig()`.

---

## 3. Validación de Compilación Previa al Commit

* **Siempre validar localmente antes de hacer push:**
  - Ejecutar `pnpm build` para asegurar que el preset `cloudflare-worker` compile el bundle de Nitro (`.output/server/index.mjs`) al 100% sin errores de chunks o imports.

---
