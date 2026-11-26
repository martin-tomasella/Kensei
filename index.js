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

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
if (!WEBHOOK_SECRET) throw new Error('Falta WEBHOOK_SECRET en el entorno -- no hay fallback por seguridad.');
const PROJECTS_PATH = path.join(__dirname, 'projects');
const PORT = process.env.PORT || 3001;
const cola = new Map();

// Fix seguridad 02/09/2026: la key hardcodeada que estaba aca quedo
// expuesta en un repo publico (visible en el HEAD de main, no solo en el
// historial). Se saco del codigo. Rotarla en console.anthropic.com y
// cargar la key nueva como ANTHROPIC_API_KEY en el entorno de despliegue
// es obligatorio -- este cambio por si solo no invalida la key vieja ya
// expuesta, solo evita que el codigo dependa de ella.
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('Falta ANTHROPIC_API_KEY en el entorno -- no hay fallback por seguridad.');
}
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function autenticar(req, res, next) {
const secret = req.headers['x-secret'];
if (secret !== WEBHOOK_SECRET) return res.status(401).json({ error: 'No autorizado' });
next();
}

// BUs del holding, para /proyectos (cross-BU) -- mismos ids que usa
// alfred-core en /empresas.
const EMPRESAS = [
{ id: 'vetcom', nombre: 'Vetcom', descripcion: 'Reseller Movistar B2B', color: '#3b82f6' },
{ id: 'theron', nombre: 'Theron', descripcion: 'Servicios Movistar CRM', color: '#22c55e' },
{ id: 'inteltech', nombre: 'Inteltech', descripcion: 'IoT y gestion vehicular', color: '#f59e0b' },
{ id: 'zebrano', nombre: 'Zebrano', descripcion: 'ERP carpinteria', color: '#8F2FFE' },
{ id: 'kensei', nombre: 'Kensei', descripcion: 'I+D e Inteligencia Artificial', color: '#080c10' },
{ id: 'microapps', nombre: 'Micro Apps', descripcion: 'Micro apps de pago por uso', color: '#14b8a6' },
];

app.post('/tarea', autenticar, async (req, res) => {
const { proyecto, tarea, descripcion } = req.body;
const tareaFinal = tarea || descripcion;
const proyectosValidos = ['zebrano', 'theron', 'vetcom', 'inteltech', 'kensei', 'microapps'];
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

// GET /jobs -- ahora acepta filtros opcionales: ?proyecto=&estado=&limit=
app.get('/jobs', autenticar, (req, res) => {
const { proyecto, estado, limit } = req.query;
let jobs = Array.from(cola.entries()).map(([id, job]) => ({ id, ...job }));
if (proyecto) jobs = jobs.filter((j) => j.proyecto === proyecto);
if (estado) jobs = jobs.filter((j) => j.status === estado);
jobs = jobs.reverse();
if (limit) jobs = jobs.slice(0, Math.min(parseInt(limit, 10) || 50, 200));
res.json(jobs);
});

app.get('/jobs/:jobId', autenticar, (req, res) => {
const job = cola.get(req.params.jobId);
if (!job) return res.status(404).json({ error: 'Job no encontrado' });
res.json({ id: req.params.jobId, ...job });
});

// GET /proyectos -- cross-BU, consumido por la pantalla "Empresas" de la
// app Alfred (src/screens/CompaniesScreen.tsx en el repo alfred-ai).
app.get('/proyectos', autenticar, (req, res) => {
const todos = Array.from(cola.values());
const proyectos = EMPRESAS.map((e) => {
const jobsDe = todos.filter((j) => j.proyecto === e.id);
const pendientes = jobsDe.filter((j) => j.status === 'en_cola' || j.status === 'ejecutando').length;
const ultima = jobsDe.reduce((max, j) => (!max || j.inicio > max ? j.inicio : max), null);
return { ...e, estado: 'activo', tareas_pendientes: pendientes, ultima_actividad: ultima };
});
res.json({ proyectos });
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

// GET /health -- enriquecido con metricas basicas de memoria y jobs.
app.get('/health', (req, res) => {
const todos = Array.from(cola.values());
res.json({
status: 'ok',
uptime: process.uptime(),
timestamp: new Date().toISOString(),
memoriaMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
jobs: {
total: todos.length,
en_cola: todos.filter((j) => j.status === 'en_cola').length,
ejecutando: todos.filter((j) => j.status === 'ejecutando').length,
},
});
});

app.listen(PORT, () => {
logger.info(`Orquestador iniciado en puerto ${PORT}`);
logger.info(`UI: http://localhost:${PORT}`);
logger.info(`Health: http://localhost:${PORT}/health`);
});
