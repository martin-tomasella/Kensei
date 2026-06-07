require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');
const AGENTS = require('./agents/index');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const PROJECTS_PATH = process.env.PROJECTS_PATH || path.join(__dirname, 'projects');

async function cargarContexto(proyecto) {
  const contextPath = path.join(PROJECTS_PATH, proyecto, 'CONTEXT.md');
  if (!await fs.pathExists(contextPath)) {
    throw new Error(`No existe CONTEXT.md para el proyecto "${proyecto}"`);
  }
  const contenido = await fs.readFile(contextPath, 'utf8');
  logger.info(`[${proyecto}] Contexto cargado — ${contenido.length} caracteres`);
  return contenido;
}

async function llamarAgente(agente, contexto, mensajeUsuario) {
  const systemPrompt = agente.systemPrompt(contexto);
  logger.info(`[${contexto.proyecto}] Llamando agente: ${agente.name}`);
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 16000,
    system: systemPrompt,
    messages: [{ role: 'user', content: mensajeUsuario }],
  });
  const texto = response.content.map(b => b.text || '').join('');
  logger.info(`[${contexto.proyecto}] ${agente.name} completó — ${texto.length} chars`);
  return texto;
}

function extraerJSON(texto) {
  try {
    const match = texto.match(/\{[\s\S]*\}(?=[^}]*$)/);
    if (match) return JSON.parse(match[0]);
  } catch (e) {
    logger.warn('No se pudo parsear JSON de la respuesta');
  }
  return null;
}

async function actualizarContexto(proyecto, tarea, resultado) {
  const contextPath = path.join(PROJECTS_PATH, proyecto, 'CONTEXT.md');
  const contextoActual = await fs.readFile(contextPath, 'utf8');
  const fecha = new Date().toISOString().split('T')[0];
  const entrada = `\n<!-- ACTUALIZACIÓN ${fecha} -->\n## Sesión ${fecha} — "${tarea}"\n${resultado.resumen || 'Tarea completada.'}\n<!-- FIN ACTUALIZACIÓN -->\n`;
  const actualizado = contextoActual.includes('## ⚠️ PENDIENTE')
    ? contextoActual.replace('## ⚠️ PENDIENTE', entrada + '\n## ⚠️ PENDIENTE')
    : contextoActual + entrada;
  await fs.writeFile(contextPath, actualizado, 'utf8');
  logger.info(`[${proyecto}] CONTEXT.md actualizado`);
}

async function orquestar({ proyecto, tarea, jobId = uuidv4() }) {
  logger.info(`JOB ${jobId} — Proyecto: ${proyecto} — Tarea: ${tarea}`);
  const contenidoContexto = await cargarContexto(proyecto);
  const contexto = { proyecto, contenido: contenidoContexto };

  const planTexto = await llamarAgente(
    AGENTS.planner, contexto,
    `Tarea recibida: "${tarea}"\nAnalizá el contexto y generá el plan de acción.`
  );

  const plan = extraerJSON(planTexto);
  if (!plan || !plan.subtareas) throw new Error('El Planner no generó un plan válido');

  logger.info(`Plan generado — ${plan.subtareas.length} subtareas`);

  const resultados = [];
  for (const idSubtarea of plan.orden_ejecucion) {
    const subtarea = plan.subtareas.find(s => s.id === idSubtarea);
    if (!subtarea) continue;
    const agente = AGENTS[subtarea.agente];
    if (!agente) continue;

    const contextoPrevio = resultados.length > 0
      ? `TRABAJO PREVIO:\n${resultados.map(r => `[${r.agente}]: ${r.codigo?.substring(0, 8000)}`).join('\n\n')}\n\n`
      : '';

    const respuesta = await llamarAgente(
      agente, contexto,
      `${contextoPrevio}TU TAREA: ${subtarea.descripcion}`
    );

    resultados.push({
      subtareaId: idSubtarea,
      agente: subtarea.agente,
      descripcion: subtarea.descripcion,
      codigo: respuesta,
      metadatos: extraerJSON(respuesta),
    });
  }

  const resumenFinal = `Completadas ${resultados.length} subtareas. Agentes: ${[...new Set(resultados.map(r => r.agente))].join(', ')}.`;
  await actualizarContexto(proyecto, tarea, { resumen: resumenFinal });

  const outputPath = path.join(PROJECTS_PATH, proyecto, 'outputs');
  await fs.ensureDir(outputPath);
  await fs.writeJSON(path.join(outputPath, `${jobId}.json`), { jobId, proyecto, tarea, plan, resultados }, { spaces: 2 });

  logger.info(`JOB ${jobId} COMPLETADO`);
  const { execSync } = require("child_process");
  try { execSync(`/home/agentes/apply-job.sh ${proyecto}`, {cwd: '/home/agentes'}); logger.info("apply-job ejecutado"); } catch(e) { logger.warn("apply-job falló: " + e.message); }
  return { jobId, proyecto, tarea, plan, resultados, resumen: resumenFinal };
}

module.exports = { orquestar };
