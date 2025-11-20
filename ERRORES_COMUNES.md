
# 🔧 Guía de Solución de Errores Comunes: AUTONOBOT

Esta guía ayuda a Asistentes de Desarrollo y DevOps a diagnosticar y solucionar problemas durante el despliegue y operación de AUTONOBOT.

---

## 1. Errores de Instalación y Despliegue

### 🔴 Error: "npm install falla en la carpeta server"
*   **Mensaje:** `Could not install puppeteer` o errores relacionados con descargar Chromium.
*   **Causa:** Bloqueo de red corporativa o falta de permisos de escritura.
*   **Solución:**
    1.  Intente ejecutar con permisos de administrador (sudo en Linux).
    2.  Configure Puppeteer para saltar la descarga si ya tiene Chrome instalado:
        `export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`

### 🔴 Error: "EADDRINUSE: address already in use :::3001"
*   **Causa:** Ya hay una instancia del servidor backend corriendo o el puerto 3001 está ocupado.
*   **Solución:**
    *   **Windows:** `netstat -ano | findstr :3001` y luego `taskkill /PID <PID> /F`
    *   **Linux/Mac:** `lsof -i :3001` y luego `kill -9 <PID>`

---

## 2. Errores del Backend (Runtime)

### 🟠 Error: "Protocol error (Page.navigate): Session closed."
*   **Causa:** El navegador (Chrome) se cerró inesperadamente o crasheó por falta de memoria.
*   **Solución:** El backend (v2.7+) tiene auto-recuperación. Simplemente reintente el comando en el chat. Si persiste en Docker, asegúrese de usar el flag `--disable-dev-shm-usage` (ya incluido por defecto).

### 🟠 Error: "TimeoutError: Navigation timeout of 60000ms exceeded"
*   **Causa:** La página web es muy pesada o la conexión a internet es lenta.
*   **Solución:**
    1.  Verifique su conexión a internet.
    2.  Pida al bot recargar la página.
    3.  Si es un sitio específico, puede estar bloqueando bots activamente.

### 🟠 Error: "Node is not defined" o Sintaxis inválida
*   **Causa:** Está usando una versión antigua de Node.js.
*   **Solución:** Actualice Node.js a la versión 18.0.0 o superior (`node -v`).

---

## 3. Errores de Inteligencia Artificial y API

### 🟣 Error: "Falta la API Key"
*   **Causa:** No se ha configurado el archivo `.env` o la variable no se está leyendo.
*   **Solución:**
    1.  Cree el archivo `.env` en la raíz del frontend.
    2.  Agregue `API_KEY=su_clave_aqui`.
    3.  Reinicie el frontend (`npm run dev`) para que cargue las nuevas variables.

### 🟣 Error: "ContentUnion is required" o "Protocol Error"
*   **Causa:** Estructura de mensajes corrupta en el historial del chat (usualmente mensajes vacíos enviados a la API).
*   **Solución:**
    1.  Recargue la página web (F5).
    2.  Cree un "Nuevo Perfil" en la configuración para limpiar el historial corrupto.

### 🟣 Error: "429 Too Many Requests"
*   **Causa:** Ha excedido la cuota gratuita de la API de Gemini.
*   **Solución:** Espere unos minutos o cambie a una API Key de pago/distinta.

---

## 4. Problemas Visuales

### 🔵 El panel del navegador dice "SISTEMA DE NAVEGACIÓN DESCONECTADO"
*   **Causa:** El Frontend no puede hablar con el Backend.
*   **Solución:**
    1.  Asegúrese de que la terminal del servidor (`node index.js`) esté abierta y sin errores.
    2.  Verifique que está accediendo a `http://localhost:3001/status` en su navegador para probar la conexión.

### 🔵 La imagen del navegador está congelada
*   **Causa:** El backend puede haberse bloqueado en una operación síncrona.
*   **Solución:**
    1.  Intente enviar el comando "recargar" al bot.
    2.  Si falla, reinicie la terminal del backend.

---

## 5. Mantenimiento

### Limpieza de Sesiones
Si nota comportamientos extraños en logins (ej: Google no loguea):
1.  Cierre el servidor.
2.  Borre la carpeta `server/user_data`.
3.  Reinicie el servidor. Esto forzará una sesión limpia.

