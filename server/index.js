
const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Configuración de seguridad y límites
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Aumentar límite para screenshots grandes si fuera necesario

// Directorios de datos
const DATA_DIR = path.join(__dirname, 'user_data');
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');

// Asegurar directorios
try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
    if (!fs.existsSync(DOWNLOADS_DIR)) fs.mkdirSync(DOWNLOADS_DIR);
} catch (err) {
    console.error('FATAL: No se pudieron crear los directorios de datos.', err);
    process.exit(1);
}

// Estado Global
let browser = null;
let page = null;
let currentProfileId = null;

/**
 * Función para cerrar el navegador de forma segura
 */
async function closeBrowser() {
    if (browser) {
        try {
            console.log('Cerrando instancia de navegador...');
            await browser.close();
        } catch (e) {
            console.error('Error cerrando navegador:', e.message);
        }
        browser = null;
        page = null;
        currentProfileId = null;
    }
}

/**
 * Inicializar el navegador con persistencia y robustez
 */
async function initBrowser(profileId = 'default') {
    // Si hay un navegador activo pero el perfil es diferente, reiniciamos
    if (browser && currentProfileId !== profileId) {
        console.log(`Cambio de perfil detectado: ${currentProfileId} -> ${profileId}`);
        await closeBrowser();
    }

    // Si el navegador se desconectó inesperadamente (crash), limpiamos referencias
    if (browser && !browser.isConnected()) {
        console.warn('Navegador desconectado inesperadamente. Reiniciando...');
        browser = null;
        page = null;
    }

    currentProfileId = profileId;
    const profilePath = path.join(DATA_DIR, profileId);
    const downloadPath = path.join(DOWNLOADS_DIR, profileId);

    // Crear directorio de descargas para el perfil si no existe
    if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath, { recursive: true });

    if (!browser) {
        console.log(`Iniciando navegador Puppeteer para perfil: ${profileId}`);
        try {
            browser = await puppeteer.launch({
                headless: "new", // Modo Headless nuevo (más estable)
                userDataDir: profilePath,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage', // Crítico para evitar crashes de memoria en Docker/Linux
                    '--window-size=1280,800',
                    '--disable-infobars',
                    '--disable-features=IsolateOrigins,site-per-process' // Mejora la carga de iframes/cross-origin
                ]
            });

            // Manejador de desconexión del proceso hijo
            browser.on('disconnected', () => {
                console.warn('Navegador emitio evento "disconnected".');
                browser = null;
                page = null;
            });

            page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 800 });
            
            // Configurar User Agent para parecer humano
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

            // Configurar descargas automáticas vía CDP
            const client = await page.target().createCDPSession();
            await client.send('Page.setDownloadBehavior', {
                behavior: 'allow',
                downloadPath: downloadPath,
            });

            console.log('Navegador listo y configurado.');
        } catch (error) {
            console.error('Error FATAL iniciando Puppeteer:', error);
            throw new Error('No se pudo iniciar el motor de navegación.');
        }
    }
    
    // Recuperación: Si browser existe pero page se cerró
    if (browser && (!page || page.isClosed())) {
         page = await browser.newPage();
         await page.setViewport({ width: 1280, height: 800 });
    }

    return { page, downloadPath };
}

/**
 * Helper para tomar screenshots optimizados
 */
async function getScreenshot(p) {
    if (!p || p.isClosed()) return null;
    try {
        return await p.screenshot({ encoding: 'base64', type: 'jpeg', quality: 60 });
    } catch (e) {
        console.error('Error tomando screenshot:', e.message);
        return null;
    }
}

// --- ENDPOINTS ---

// Health Check
app.get('/status', async (req, res) => {
    if (!browser || !page || !browser.isConnected()) {
        return res.json({ active: false, message: "Navegador no iniciado o desconectado" });
    }
    try {
        const screenshot = await getScreenshot(page);
        const url = page.url();
        const title = await page.title();
        res.json({ active: true, url, title, screenshot: screenshot ? `data:image/jpeg;base64,${screenshot}` : null });
    } catch (e) {
        console.error('Error en status:', e);
        res.status(500).json({ active: false, error: e.message });
    }
});

// Navegación
app.post('/navigate', async (req, res) => {
    const { url, profileId } = req.body;

    if (!url) return res.status(400).json({ error: "Falta el parámetro 'url'" });

    try {
        const { page: p } = await initBrowser(profileId);
        console.log(`[${profileId}] Navegando a: ${url}`);
        
        // Timeout de 60s para cargas pesadas
        await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        // Extracción segura de texto
        const textContent = await p.evaluate(() => document.body.innerText.substring(0, 20000)).catch(() => "");
        const screenshot = await getScreenshot(p);
        
        res.json({ 
            status: 'success', 
            url: p.url(),
            title: await p.title(),
            screenshot: `data:image/jpeg;base64,${screenshot}`,
            content: textContent
        });
    } catch (e) {
        console.error('Error en navegación:', e.message);
        res.status(500).json({ error: `Error navegando: ${e.message}` });
    }
});

// Acciones (Click, Type, Select)
app.post('/action', async (req, res) => {
    const { type, selector, value, profileId } = req.body;

    try {
        const { page: p } = await initBrowser(profileId);
        console.log(`[${profileId}] Acción: ${type} en selector: "${selector}"`);

        if (type === 'click') {
            if (!selector) throw new Error("Selector requerido para click");
            try {
                await p.waitForSelector(selector, { timeout: 5000, visible: true });
                await p.click(selector);
            } catch (err) {
                console.warn(`Click nativo falló, intentando click JS para ${selector}`);
                await p.evaluate((sel) => {
                    const el = document.querySelector(sel);
                    if (!el) throw new Error(`Elemento no encontrado en DOM: ${sel}`);
                    el.click();
                }, selector);
            }
        } else if (type === 'type') {
            if (!selector || value === undefined) throw new Error("Selector y texto requeridos para type");
            await p.waitForSelector(selector, { timeout: 5000 });
            
            // Intentar limpiar campo
            await p.evaluate((sel) => { 
                const el = document.querySelector(sel);
                if(el) el.value = ''; 
            }, selector);
            
            await p.click(selector);
            await p.type(selector, value, { delay: 50 }); // Retraso humano
            
            // Manejo de Enter
            if (value.includes('\\n') || value.includes('Enter')) {
                 await p.keyboard.press('Enter');
            }
        } else if (type === 'select') {
            if (!selector || !value) throw new Error("Selector y valor requeridos para select");
            await p.waitForSelector(selector, { timeout: 5000 });
            await p.select(selector, value);
        } else if (type === 'scroll') {
             await p.evaluate((y) => window.scrollBy(0, y), parseInt(value) || 500);
        } else if (type === 'wait') {
             const ms = parseInt(value) || 2000;
             console.log(`Esperando ${ms}ms...`);
             await new Promise(r => setTimeout(r, ms));
        }

        // Pequeña espera para renderizado visual post-acción
        await new Promise(r => setTimeout(r, 1000));

        const screenshot = await getScreenshot(p);
        res.json({ status: 'success', screenshot: `data:image/jpeg;base64,${screenshot}` });

    } catch (e) {
        console.error(`Error ejecutando acción ${type}:`, e.message);
        // Intentamos tomar foto del error
        let errorShot = null;
        if (page) errorShot = await getScreenshot(page);
        
        res.status(500).json({ 
            error: e.message, 
            screenshot: errorShot ? `data:image/jpeg;base64,${errorShot}` : null 
        });
    }
});

// Listar Descargas
app.post('/downloads', async (req, res) => {
    const { profileId } = req.body;
    try {
        const downloadPath = path.join(DOWNLOADS_DIR, profileId || 'default');
        if (!fs.existsSync(downloadPath)) {
             return res.json({ files: [] });
        }
        const files = fs.readdirSync(downloadPath);
        // Filtrar archivos ocultos o temporales (.crdownload)
        const validFiles = files.filter(f => !f.startsWith('.') && !f.endsWith('.crdownload'));
        res.json({ files: validFiles });
    } catch (e) {
        console.error('Error leyendo descargas:', e);
        res.status(500).json({ error: e.message });
    }
});

// Extracción de datos específica
app.post('/extract', async (req, res) => {
    const { selector, profileId } = req.body;
    try {
        const { page: p } = await initBrowser(profileId);
        const data = await p.evaluate((sel) => {
            if (!sel) return document.body.innerText;
            const el = document.querySelector(sel);
            return el ? el.innerText : 'Elemento no encontrado';
        }, selector);
        res.json({ data });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- MANEJO DE CIERRE DE SERVIDOR (Graceful Shutdown) ---
process.on('SIGINT', async () => {
    console.log('\nRecibida señal SIGINT. Cerrando navegador y servidor...');
    await closeBrowser();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nRecibida señal SIGTERM. Cerrando navegador y servidor...');
    await closeBrowser();
    process.exit(0);
});

// Iniciar Express
app.listen(PORT, () => {
    console.log(`================================================`);
    console.log(`🚀 BACKEND AUTONOBOT LISTO PARA PRODUCCIÓN`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📂 Perfiles: ${DATA_DIR}`);
    console.log(`💾 Descargas: ${DOWNLOADS_DIR}`);
    console.log(`================================================`);
});
