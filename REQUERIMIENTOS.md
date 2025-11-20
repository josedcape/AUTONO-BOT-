
# 📋 Requerimientos del Sistema: AUTONOBOT

Para desplegar y ejecutar correctamente el entorno de desarrollo de AUTONOBOT, asegúrese de cumplir con los siguientes requisitos.

## 1. Entorno del Sistema (Host)

*   **Sistema Operativo:** Windows 10/11, macOS, o Linux (Ubuntu 20.04+ recomendado).
*   **Runtime:** Node.js **v18.0.0** o superior (LTS Recomendado).
*   **Gestor de Paquetes:** npm v9+ o yarn.
*   **Navegador Base:** Google Chrome instalado en el sistema (Puppeteer intentará descargar su propia versión de Chromium, pero tener Chrome ayuda en configuraciones Linux).

## 2. Variables de Entorno (.env)

El archivo `.env` debe estar ubicado en la raíz del proyecto Frontend.

| Variable | Descripción | Requerido |
| :--- | :--- | :--- |
| `API_KEY` | Clave de API de Google AI Studio (Gemini) | **SÍ** |

---

## 3. Dependencias del Backend (`server/package.json`)

Estas librerías son necesarias para el motor de navegación (Node.js).

```json
{
  "dependencies": {
    "express": "^4.18.2",      // Servidor HTTP para recibir comandos
    "puppeteer": "^21.5.2",    // Control del navegador Chrome Headless
    "cors": "^2.8.5",          // Permite peticiones desde el Frontend (puerto distinto)
    "body-parser": "^1.20.2"   // Procesa los cuerpos JSON de las peticiones POST
  }
}
```

> **Nota:** Puppeteer descargará una versión local de Chromium (~170MB) durante el `npm install`.

---

## 4. Dependencias del Frontend (`package.json`)

Estas librerías componen la interfaz de usuario y la lógica del cliente.

### Principales
*   **react**: ^19.2.0 - Librería UI principal.
*   **react-dom**: ^19.2.0 - Renderizado web.
*   **@google/genai**: ^1.30.0 - SDK oficial para conectar con Gemini 2.5.
*   **lucide-react**: ^0.554.0 - Paquete de iconos SVG optimizados.

### Desarrollo y Estilos
*   **tailwindcss**: Framework CSS para estilos utilitarios.
*   **typescript**: Tipado estático para robustez del código.
*   **vite**: Empaquetador y servidor de desarrollo rápido.

---

## 5. Permisos de Red y Firewall

Si despliega en una red corporativa, asegúrese de permitir:

1.  **Salida HTTPS (443):** Hacia `generativelanguage.googleapis.com` (API de Gemini).
2.  **Puerto Local 3001:** Comunicación entre Frontend y Backend.
3.  **Puerto Local 5173/3000:** Servidor de desarrollo del Frontend.
