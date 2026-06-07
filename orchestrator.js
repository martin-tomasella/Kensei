const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'sk-ant-api03-qjqiYDkGPTZZxUuZ-9J_q59KU6Wz7LlcgVYi-LVvlYwxN8k3xHd2VllvUd1J9SGYMCdUbFO1uOPvQUqZ0Gc5FQ-OZ7hNgAA'
});

const SECRET = 'antigravity2026secret';
const jobs = new Map();
let jobCounter = 0;

// Middleware de autenticación
function authMiddleware(req, res, next) {
  const secret = req.headers['x-secret'];
  if (secret !== SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

// Cargar agentes
async function loadAgents() {
  try {
    const agentsPath = path.join(__dirname, 'agents', 'index.js');
    const agentsModule = require(agentsPath);
    return agentsModule.agents || [];
  } catch (error) {
    console.error('Error cargando agentes:', error);
    return [];
  }
}

// Cargar contexto del proyecto
async function loadContext(proyecto) {
  try {
    const contextPath = path.join(__dirname, 'projects', proyecto, 'CONTEXT.md');
    const context = await fs.readFile(contextPath, 'utf-8');
    return context;
  } catch (error) {
    console.error(`Error cargando contexto de ${proyecto}:`, error);
    return '';
  }
}

// Función para hacer fetch con timeout
async function fetchWithTimeout(url, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const text = await response.text();
    return text;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout after 10s');
    }
    throw error;
  }
}

// Llamar a un agente con soporte de tool use
async function callAgent(agentName, agentPrompt, userPrompt, isToolResult = false, toolResults = []) {
  const agents = await loadAgents();
  const agent = agents.find(a => a.code === agentName);
  
  if (!agent) {
    throw new Error(`Agente ${agentName} no encontrado`);
  }

  const messages = isToolResult 
    ? toolResults 
    : [{ role: 'user', content: userPrompt }];

  const requestBody = {
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 8000,
    system: agentPrompt,
    messages: messages
  };

  // Solo agregar tools si es Design Agent
  if (agentName === 'design') {
    requestBody.tools = [{
      name: 'fetch_url',
      description: 'Fetches content from a URL, useful for reading GitHub files, documentation, or design resources',
      input_schema: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The URL to fetch'
          }
        },
        required: ['url']
      }
    }];
  }

  let response = await client.messages.create(requestBody);

  // Tool use loop
  while (response.stop_reason === 'tool_use') {
    const toolUseBlock = response.content.find(block => block.type === 'tool_use');
    
    if (!toolUseBlock) break;

    console.log(`[${agentName}] Tool use detected: ${toolUseBlock.name}`);
    
    let toolResult;
    try {
      if (toolUseBlock.name === 'fetch_url') {
        const url = toolUseBlock.input.url;
        console.log(`[${agentName}] Fetching: ${url}`);
        const content = await fetchWithTimeout(url);
        toolResult = {
          type: 'tool_result',
          tool_use_id: toolUseBlock.id,
          content: content.substring(0, 50000) // Limitar a 50k caracteres
        };
      } else {
        toolResult = {
          type: 'tool_result',
          tool_use_id: toolUseBlock.id,
          content: 'Unknown tool',
          is_error: true
        };
      }
    } catch (error) {
      console.error(`[${agentName}] Tool error:`, error.message);
      toolResult = {
        type: 'tool_result',
        tool_use_id: toolUseBlock.id,
        content: `Error: ${error.message}`,
        is_error: true
      };
    }

    // Construir nuevo mensaje con tool result
    const newMessages = [
      { role: 'user', content: userPrompt },
      { role: 'assistant', content: response.content },
      { role: 'user', content: [toolResult] }
    ];

    requestBody.messages = newMessages;
    response = await client.messages.create(requestBody);
  }

  const textContent = response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n');

  return textContent;
}

// Parsear y escribir archivos desde formato ARCHIVO:/ruta