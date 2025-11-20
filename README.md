
# 🤖 AUTONOBOT - Agente de Navegación Web Autónomo

> **Versión:** 2.7.1 (Stable)
> **Arquitectura:** Cliente-Servidor (React + Node.js/Puppeteer)
> **Motor IA:** Google Gemini 2.5 Flash

AUTONOBOT es una interfaz avanzada que permite a una Inteligencia Artificial controlar un navegador web real. A diferencia de las simulaciones basadas en iframe, AUTONOBOT utiliza un backend dedicado con Puppeteer para realizar navegación real, clics, escritura y extracción de datos en cualquier sitio web moderno.

![Architecture](https://img.shields.io/badge/Architecture-Client%2FServer-blue)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green)

## 🚀 Características Principales

*   **Navegación Real:** Capacidad para cargar sitios complejos (YouTube, Google, Amazon) sin restricciones de CORS o X-Frame-Options.
*   **Visión Remota:** El frontend recibe una transmisión en vivo (screenshots) de lo que el navegador está viendo en el servidor.
*   **Control Total del DOM:** La IA puede hacer clic, escribir en formularios, seleccionar opciones y hacer scroll.
*   **Interfaz Cyberpunk:** UI futurista con efectos visuales reactivos, modo oscuro/claro y animaciones de estado.
*   **Voz a Comando:** Integración con Web Speech API para dictar instrucciones.
*   **Gestión de Perfiles:** Sistema para guardar historiales y preferencias de usuarios distintos.

## 🛠️ Arquitectura del Sistema

El proyecto se divide en dos componentes que deben ejecutarse simultáneamente:

1.  **Frontend (Client):** Aplicación React que actúa como centro de mando. Gestiona el chat, la visualización y la comunicación con la API de Gemini.
2.  **Backend (Server):** Servidor Node.js ejecutando Puppeteer. Recibe comandos JSON del frontend y ejecuta las acciones físicas en una instancia de Chromium.

---

## 📦 Estructura del Proyecto

```
autonobot/
├── src/                 # Código fuente Frontend (React)
│   ├── components/      # Paneles de Chat y Navegador
│   ├── services/        # Lógica de IA (Gemini)
│   └── App.tsx          # Controlador principal
├── server/              # Código fuente Backend (Node.js)
│   ├── index.js         # Servidor Express + Puppeteer
│   └── package.json     # Dependencias del servidor
├── public/              # Assets estáticos
└── README.md            # Este archivo
```

## 📋 Requisitos Previos

*   Node.js v18 o superior.
*   Una API Key de Google Gemini (AI Studio).
*   Google Chrome instalado en el sistema host.

Para instrucciones detalladas de instalación, consulta la **[GUIA_DESPLIEGUE.md](./GUIA_DESPLIEGUE.md)**.
