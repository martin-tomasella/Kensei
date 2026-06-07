const express = require('express');
const { orquestar } = require('./orchestrator');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');
const fs = require('fs-extra');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'antigravity2026secret';
const PROJECTS_PATH = path.join(__dirname, 'projects');
const PORT = process.env.PORT || 3001;
const cola = new Map();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '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' || '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' });

function autenticar(req, res, next) {
  const secret = req.headers['x-secret'];
  if (secret !== WEBHOOK_SECRET) return res.status(401).json({ error: 'No autorizado' });
  next();
}

app.post('/tarea', autenticar, async (req, res) => {
  const { proyecto, tarea, descripcion } = req.body;
  const tareaFinal = tarea || descripcion;
  const proyectosValidos = ['zebrano', 'theron', 'vetcom', 'inteltech', 'kensei'];
  if (!proyecto || !tareaFinal) return res.status(400).json({ error: 'Faltan parametros: proyecto, tarea' });
  if (!proyectosValidos.includes(proyecto.toLowerCase())) return res.status(400).json({ error: `Proyecto no valido. Opciones: ${proyectosValidos.join(', ')}` });
  const jobId = uuidv4();
  cola.set(jobId, { status: 'en_cola', proyecto, tarea: tareaFinal, inicio: new Date().toISOString() });
  logger.info(`Nueva tarea — Job ${jobId} — ${proyecto}: "${tareaFinal}"`);
  res.json({ jobId, status: 'en_cola', mensaje: `Tarea encolada para ${proyecto}` });
  try {
    cola.set(jobId, { ...cola.get(jobId), status: 'ejecutando' });
    const resultado = await orquestar({ proyecto: proyecto.toLowerCase(), tarea: tareaFinal, jobId });
    cola.set(jobId, { ...cola.get(jobId), status: 'completado', resultado: resultado.resumen });
  } catch (e) {
    logger.error(`JOB ${jobId} ERROR: ${e.message}`);
    cola.set(jobId, { ...cola.get(jobId), status: 'error', error: e.message });
  }
});

app.get('/jobs', autenticar, (req, res) => {
  const jobs = Array.from(cola.entries()).map(([id, job]) => ({ id, ...job }));
  res.json(jobs.reverse());
});

app.get('/jobs/:jobId', autenticar, (req, res) => {
  const job = cola.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job no encontrado' });
  res.json({ id: req.params.jobId, ...job });
});

app.post('/chat', autenticar, async (req, res) => {
  const { mensaje, imagen_base64, agente } = req.body;
  if (!mensaje) return res.status(400).json({ error: 'Falta mensaje' });
  const systemPrompt = agente === 'design'
    ? 'Sos el Design Agent de Kensei. Experto en UI/UX, identidad visual, design systems, SVG, paletas de color, tipografia y branding. Conoces los proyectos del holding: Zebrano (PowerAI theme, primary #8F2FFE), Kensei (fondo #080c10, estilo militar japones). Podes analizar imagenes y dar feedback de diseno detallado.'
    : 'Sos el Orquestador de Kensei, sistema operativo de IA del holding Kensei Technology. Gestionas proyectos: Zebrano (ERP carpinteria 60%), Theron (Movistar 95%), VETCOM, Inteltech, Kensei. Podes recibir instrucciones, planificar tareas y coordinar agentes. Respondas en espanol.';
  const content = [];
  if (imagen_base64) content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imagen_base64 } });
  content.push({ type: 'text', text: mensaje });
  try {
    const response = await anthropic.messages.create({ model: 'claude-sonnet-4-5', max_tokens: 1024, system: systemPrompt, messages: [{ role: 'user', content }] });
    res.json({ respuesta: response.content[0].text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/proyecto/nuevo', autenticar, async (req, res) => {
  const { nombre, descripcion, stack } = req.body;
  if (!nombre || !descripcion || !stack) return res.status(400).json({ error: 'Faltan campos: nombre, descripcion, stack' });
  const nombreClean = nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
  const proyectoPath = path.join(PROJECTS_PATH, nombreClean);
  if (await fs.pathExists(proyectoPath)) return res.status(400).json({ error: 'Proyecto ya existe' });
  await fs.mkdirp(proyectoPath);
  const context = `# ${nombre}\n\n## Descripcion\n${descripcion}\n\n## Stack\n${stack}\n\n## Estado\n- Creado: ${new Date().toISOString()}\n`;
  await fs.writeFile(path.join(proyectoPath, 'CONTEXT.md'), context);
  logger.info(`Nuevo proyecto creado: ${nombreClean}`);
  res.json({ mensaje: `Proyecto ${nombre} creado`, proyecto: nombreClean });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  logger.info(`Orquestador iniciado en puerto ${PORT}`);
  logger.info(`UI: http://localhost:${PORT}`);
  logger.info(`Health: http://localhost:${PORT}/health`);
});
