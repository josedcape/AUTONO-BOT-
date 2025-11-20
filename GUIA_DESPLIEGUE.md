
# 📘 GUÍA DE DESPLIEGUE TÉCNICO: AUTONOBOT

Esta guía está diseñada para **Asistentes de Desarrollo** e **Ingenieros de DevOps**. Siga estos pasos estrictamente para asegurar el funcionamiento correcto de la arquitectura dual (Frontend + Backend).

---

## 🟢 FASE 1: Configuración de Variables de Entorno

El sistema requiere una clave de API válida para funcionar.

1.  Cree un archivo `.env` en la raíz del proyecto (al mismo nivel que `package.json` del frontend).
2.  Agregue su clave de API de Google:

```env
API_KEY=tu_clave_de_api_aqui_sin_comillas
```

> **Nota Crítica:** Sin esta clave, el servicio de IA (`geminiService.ts`) fallará al iniciar.

---

## 🟠 FASE 2: Despliegue del Backend (Motor de Navegación)

El backend es el "cuerpo" del robot. Debe iniciarse primero para que el frontend detecte la conexión.

1.  Abra una terminal dedicada (Terminal A).
2.  Navegue al directorio del servidor:
    ```bash
    cd server
    ```
3.  Instale las dependencias del backend:
    ```bash
    npm install
    ```
    *(Esto instalará express, puppeteer, cors y body-parser)*.

4.  Inicie el servidor:
    ```bash
    node index.js
    ```

**Resultado Esperado:**
Verá el mensaje: `Servidor de Navegación Real corriendo en http://localhost:3001`

---

## 🔵 FASE 3: Despliegue del Frontend (Centro de Comando)

El frontend es la interfaz visual.

1.  Abra una **segunda** terminal (Terminal B).
2.  Asegúrese de estar en la raíz del proyecto (donde está el `vite.config.ts` o `package.json` principal).
3.  Instale las dependencias del frontend:
    ```bash
    npm install
    ```
4.  Inicie la aplicación:
    ```bash
    npm run dev
    ```
    *(O `npm start` dependiendo de su configuración)*.

5.  Abra el navegador en la URL local (usualmente `http://localhost:5173` o `http://localhost:3000`).

---

## 🟣 FASE 4: Verificación del Sistema

1.  Al abrir la aplicación web, observe el **Panel Derecho (Navegador)**.
2.  **Si todo está correcto:** Verá una pantalla negra o el logo de Autonobot con el estado "ESPERANDO".
3.  **Si hay error:** Verá una pantalla de advertencia roja/negra con instrucciones de "SISTEMA DE NAVEGACIÓN DESCONECTADO".
    *   *Solución:* Verifique que la Terminal A no tenga errores y siga corriendo en el puerto 3001.

---

## ⚠️ Solución de Problemas Comunes

### Error: "Puppeteer no puede encontrar Chrome"
En algunos entornos Linux/Docker, Puppeteer puede necesitar configuración extra.
*   **Solución:** Edite `server/index.js` y modifique `puppeteer.launch`:
    ```javascript
    executablePath: '/usr/bin/google-chrome', // Ruta a su Chrome local
    ```

### Error: "ContentUnion is required" en el Chat
Esto ocurre si la API de Gemini recibe un mensaje vacío.
*   **Solución:** El código ya incluye filtros en `App.tsx`, pero asegúrese de no enviar mensajes vacíos manualmente.

### El navegador remoto va lento
*   **Causa:** Puppeteer está transmitiendo capturas de pantalla en Base64.
*   **Solución:** Es normal en desarrollo local. Para producción, se recomendaría usar WebRTC, pero la implementación actual está optimizada para simplicidad y compatibilidad.

---

**Fin de la Guía.**
