# ZEBRANO ERP — Contexto del proyecto
> Archivo de contexto para sistema multi-agente. Actualizar después de cada sesión de trabajo.
> Última actualización: 01/06/2026

## ¿Qué es Zebrano?
ERP completo para una carpintería de muebles a medida. Integra cotización con IA, gestión de prospectos, producción en taller, marketing en RRSS y app móvil para carpinteros.

## Stack tecnológico
- Frontend: React + Vercel (zebrano-web.vercel.app)
- Backend: Supabase (xsciujuvkbubnhhnpcix · eu-west-1)
- IA: Claude Sonnet 4 via Anthropic API
- App móvil: React Native / Expo SDK · APK Android v6
- Automatización: n8n en VPS Hostinger

## Design system — PowerAI Theme
- Primary: #8F2FFE
- Secondary: #DF53FE
- Body bg: #0E0912
- Card bg: #151019
- Font: Inter 15px base
- Sidebar: 56px compacto, íconos SVG + tooltips
- Todo código nuevo debe respetar este theme.


<!-- ACTUALIZACIÓN 2026-06-02 -->
## Sesión 2026-06-02 — "Implementar la conversión de cotización a orden de trabajo: al aprobar una cotización, crear automáticamente un registro en historial_compras y en ordenes_trabajo con todos los datos del cliente y los ítems cotizados"
Completadas 7 subtareas. Agentes: backend, frontend, qa, reviewer.
<!-- FIN ACTUALIZACIÓN -->


<!-- ACTUALIZACIÓN 2026-06-03 -->
## Sesión 2026-06-03 — "Leer /home/agentes/index.js y agregar "kensei" al dropdown del dashboard HTML en /home/agentes/public/kensei-dashboard.html. También mejorar el dashboard: aumentar fuente base a 15px, hacer tarjetas de status más compactas (max 3 columnas, no que ocupen todo el ancho), y reemplazar el logo con texto SVG estilizado KENSEI en estilo metálico. Guardar los cambios directamente en los archivos del servidor."
Completadas 1 subtareas. Agentes: reviewer.
<!-- FIN ACTUALIZACIÓN -->


<!-- ACTUALIZACIÓN 2026-06-03 -->
## Sesión 2026-06-03 — "Mejorar el dashboard en /home/agentes/public/kensei-dashboard.html: 1) Agregar Kensei en el sidebar izquierdo bajo la sección Proyectos con badge color azul. 2) Aumentar fuente base a 15px. 3) Tarjetas de estado con max-width de 200px para que no se estiren. Guardar los cambios directamente en el archivo."
Completadas 1 subtareas. Agentes: reviewer.
<!-- FIN ACTUALIZACIÓN -->

## ⚠️ PENDIENTE

### 🔴 Alta prioridad
- [ ] Tablero de producción avanzado — avance visual por orden, asignación de carpintero, fechas
- [ ] Plantilla orden de trabajo PDF — datos cliente, trabajo, condiciones de pago, anticipo
- [ ] Conversión cotización → orden — al aprobar cotización crear historial_compras + ordenes_trabajo

### 🟡 Media prioridad
- [ ] Cálculo de materiales por orden
- [ ] Stock de materiales — tabla stock_materiales
- [ ] Notificaciones — prospecto nuevo via n8n
- [ ] Dashboard de ventas

## Instrucciones para agentes
1. Nunca mezclar contexto con otros proyectos.
2. Respetar el PowerAI theme en todo código frontend.
3. Prioridad actual: completar los 3 ítems de alta prioridad.
4. Al terminar una tarea: marcar ítem como completado con fecha.
5. Stack fijo: no proponer cambios de tecnología.
6. Supabase: toda nueva tabla debe tener RLS configurado.
7. Edge Functions: versionar siempre (v1, v2...).
