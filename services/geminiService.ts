
import { GoogleGenAI, Type, FunctionDeclaration, Tool, Part } from "@google/genai";

// Define the tools available to the AI
const navigateTool: FunctionDeclaration = {
  name: "navigate",
  description: "Navegar a una URL en el navegador real remoto.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      url: { type: Type.STRING, description: "URL completa (ej. https://google.com)" },
    },
    required: ["url"],
  },
};

const clickTool: FunctionDeclaration = {
  name: "click",
  description: "Hacer clic en un elemento.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      selector: { type: Type.STRING, description: "Selector CSS del elemento" },
    },
    required: ["selector"],
  },
};

const typeTool: FunctionDeclaration = {
  name: "type",
  description: "Escribir texto en un campo.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      selector: { type: Type.STRING, description: "Selector CSS del campo" },
      text: { type: Type.STRING, description: "Texto a escribir. Usa '\\n' al final para simular Enter." },
    },
    required: ["selector", "text"],
  },
};

const selectTool: FunctionDeclaration = {
  name: "select",
  description: "Seleccionar opción de menú.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      selector: { type: Type.STRING, description: "Selector CSS" },
      value: { type: Type.STRING, description: "Valor de la opción" },
    },
    required: ["selector", "value"],
  },
};

const waitTool: FunctionDeclaration = {
  name: "wait",
  description: "Esperar unos segundos antes de la siguiente acción.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      duration: { type: Type.STRING, description: "Duración en milisegundos (ej '3000')" },
    },
    required: ["duration"],
  },
};

const checkDownloadsTool: FunctionDeclaration = {
  name: "check_downloads",
  description: "Verificar la lista de archivos descargados en la sesión actual.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const tools: Tool[] = [{
  functionDeclarations: [navigateTool, clickTool, typeTool, selectTool, waitTool, checkDownloadsTool],
}];

export const SYSTEM_INSTRUCTION = `
Eres AUTONOBOT, un agente de navegación autónomo avanzado con PERSISTENCIA REAL.
Controlas una instancia real de Chrome mediante Puppeteer.

**TUS SUPERPODERES:**
1. **Memoria de Sesión:** Si te logueas en un sitio (Gmail, Facebook), la sesión SE MANTIENE guardada en el perfil del usuario.
2. **Descargas:** Puedes hacer clic en botones de descarga. Los archivos se guardan en el servidor. Usa 'check_downloads' para verlos.
3. **Interacción Completa:** Puedes llenar formularios, dar clic, seleccionar.

**INSTRUCCIONES OPERATIVAS:**
- Para búsquedas o formularios, usa selectores CSS precisos. Si fallan, sugiere al usuario que verifique el selector.
- Si necesitas presionar ENTER después de escribir, añade '\\n' al final del texto en la herramienta 'type'.
- Si el usuario pide descargar algo, navega, haz clic en el enlace de descarga y luego verifica con 'check_downloads'.
- Si te piden una tarea programada (ej: "haz esto a las 5pm"), confirma que el usuario debe configurarla en el panel de TAREAS (Scheduler).

Responde siempre en ESPAÑOL, de forma profesional y futurista.
`;

export const generateResponse = async (
  history: { role: string; parts: { text: string }[] }[],
  lastUserMessage: string,
  onToolCall: (name: string, args: any) => Promise<any>
) => {
  if (!process.env.API_KEY) {
    throw new Error("Falta la API Key. Por favor verifica tu configuración .env.");
  }

  const client = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const chat = client.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: tools,
    },
    history: history, 
  });

  let finalResponseText = "";

  let result = await chat.sendMessage({ message: lastUserMessage });

  let loops = 0;
  while (result.functionCalls && result.functionCalls.length > 0 && loops < 10) {
    loops++;
    const functionResponseParts: Part[] = [];
    
    for (const call of result.functionCalls) {
      console.log(`[Gemini] Calling tool: ${call.name}`, call.args);
      let toolResult;
      try {
        toolResult = await onToolCall(call.name, call.args);
      } catch (e: any) {
        toolResult = `Error executing tool: ${e.message}`;
      }
      
      functionResponseParts.push({
        functionResponse: {
          name: call.name,
          response: { result: toolResult }, 
          id: call.id 
        }
      });
    }

    try {
        result = await chat.sendMessage(functionResponseParts);
    } catch (error) {
        console.error("Error enviando respuesta de herramienta:", error);
        throw new Error("Error de Protocolo IA (Tool Response).");
    }
  }

  if (result.text) {
    finalResponseText = result.text;
  }

  return finalResponseText;
};
