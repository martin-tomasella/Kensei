# KENSEI — Sistema Operativo de IA
> Última actualización: 02/06/2026

## ¿Qué es Kensei?
Kensei es el equipo de desarrollo, I+D e inteligencia artificial del holding. Opera como una organización de agentes de IA que desarrolla, investiga, monitorea y gestiona todos los proyectos del holding de forma autónoma.

## Propietario
Martín Tomasella — CEO. Alfred (agente personal): app Android React Native + Expo SDK 52. Supabase Alfred: vkzonjohezyumxxqddux

## Empresas del holding
- VETCOM: Reventa Movistar B2B — 0%
- Inteltech Solutions: IoT, gestión vehicular — 0%
- Zebrano: Carpintería ERP — 60%
- Theron: Servicios Movistar — 95%

## Infraestructura
- VPS: 212.85.15.234 · Ubuntu 24.04 · 96GB disco
- Orquestador: /home/agentes/ · Puerto 3001 · Node.js + Express + PM2
- Dashboard: http://212.85.15.234:3001/kensei-dashboard.html
- Auth: X-Secret: antigravity2026secret
- n8n: https://n8n-n8n.z8ixjp.easypanel.host
- Anthropic key activa: Orquestador-Kensei

## Agentes actuales
- PL Planner: estratega, genera planes
- BE Backend: APIs, SQL, Supabase, Edge Functions
- FE Frontend: React, CSS, componentes
- QA: tests, bugs, validación
- RV Reviewer: calidad, aprobación final


<!-- ACTUALIZACIÓN 2026-06-03 -->
## Sesión 2026-06-03 — "Mejorar el dashboard en /home/agentes/public/kensei-dashboard.html: 1) Agregar Kensei en el sidebar izquierdo bajo la sección Proyectos con badge color azul. 2) Aumentar fuente base a 15px. 3) Tarjetas de estado con max-width de 200px para que no se estiren. Guardar los cambios directamente en el archivo."
Completadas 3 subtareas. Agentes: frontend, qa, reviewer.
<!-- FIN ACTUALIZACIÓN -->


<!-- ACTUALIZACIÓN 2026-06-03 -->
## Sesión 2026-06-03 — "Modificar /home/agentes/orchestrator.js para agregar una herramienta de escritura de archivos que los agentes puedan usar. Cuando un agente genera código para un archivo específico del servidor (como /home/agentes/public/kensei-dashboard.html), el orquestador debe detectarlo en los metadatos del resultado y escribir el archivo automáticamente. Los agentes deben incluir en su JSON final el campo "archivo_destino" con la ruta absoluta y "contenido" con el código completo a escribir."
Completadas 4 subtareas. Agentes: backend, qa, reviewer.
<!-- FIN ACTUALIZACIÓN -->


<!-- ACTUALIZACIÓN 2026-06-03 -->
## Sesión 2026-06-03 — "Agregar en /home/agentes/public/kensei-dashboard.html una animación visual en el registro de misiones: cuando un job está EN COLA o EJECUTANDO, mostrar un indicador pulsante con el nombre del agente activo y un contador de tiempo transcurrido en segundos. El status debe actualizarse automáticamente cada 3 segundos consultando GET /status/:jobId sin recargar la página."
Completadas 4 subtareas. Agentes: backend, frontend, qa, reviewer.
<!-- FIN ACTUALIZACIÓN -->


<!-- ACTUALIZACIÓN 2026-06-03 -->
## Sesión 2026-06-03 — "Modificar /home/agentes/orchestrator.js para agregar escritura automática de archivos. Después de que cada agente complete su subtarea, el orquestador debe buscar en el texto de respuesta bloques con formato ```filepath:/ruta/al/archivo y escribir ese contenido directamente al disco usando fs.writeFile. Implementar esto y reiniciar con pm2 restart orquestador."
Completadas 4 subtareas. Agentes: backend, qa.
<!-- FIN ACTUALIZACIÓN -->


<!-- ACTUALIZACIÓN 2026-06-03 -->
## Sesión 2026-06-03 — "Modificar /home/agentes/orchestrator.js agregando escritura automática de archivos. Al finalizar cada subtarea, el orquestador debe leer del campo "codigo" del resultado si contiene un bloque con este formato exacto:

ARCHIVO:/home/agentes/ruta/archivo.js
[contenido completo del archivo]
FIN_ARCHIVO

Si encuentra ese patrón, debe escribir el contenido en esa ruta con fs.writeFile. Incluir el orchestrator.js completo modificado usando ese mismo formato para que el script apply-job.sh lo detecte y lo aplique."
Completadas 3 subtareas. Agentes: backend, qa, reviewer.
<!-- FIN ACTUALIZACIÓN -->


<!-- ACTUALIZACIÓN 2026-06-03 -->
## Sesión 2026-06-03 — "Usando el formato exacto ARCHIVO:/ruta/completa FIN_ARCHIVO, escribir el kensei-dashboard.html completo en /home/agentes/public/kensei-dashboard.html con estas mejoras: 1) Agregar Kensei en sidebar izquierdo bajo Proyectos con badge azul, 2) fuente base 15px, 3) tarjetas de estado máximo 3 columnas con max-width 220px, 4) auto-refresh del registro de misiones cada 5 segundos consultando GET /jobs con el token."
Completadas 3 subtareas. Agentes: frontend, qa, reviewer.
<!-- FIN ACTUALIZACIÓN -->


<!-- ACTUALIZACIÓN 2026-06-07 -->
## Sesión 2026-06-07 — "Crear el archivo /home/agentes/public/test-agentes.html con un HTML simple que diga "Kensei v1 — agentes funcionando" en el estilo del dashboard (fondo #080c10, texto blanco, fuente Rajdhani). Usar formato ARCHIVO:/ruta FIN_ARCHIVO obligatoriamente."
Completadas 3 subtareas. Agentes: frontend, qa, reviewer.
<!-- FIN ACTUALIZACIÓN -->


<!-- ACTUALIZACIÓN 2026-06-07 -->
## Sesión 2026-06-07 — "Crear el archivo /home/agentes/public/test-agentes.html con un HTML simple que diga "Kensei v1 — agentes funcionando" en el estilo del dashboard (fondo #080c10, texto blanco, fuente Rajdhani). Usar formato ARCHIVO:/ruta FIN_ARCHIVO obligatoriamente."
Completadas 3 subtareas. Agentes: frontend, qa, reviewer.
<!-- FIN ACTUALIZACIÓN -->


<!-- ACTUALIZACIÓN 2026-06-07 -->
## Sesión 2026-06-07 — "Crear el archivo /home/agentes/public/test-agentes.html con un HTML simple que diga "Kensei v1 — agentes funcionando" en el estilo del dashboard (fondo #080c10, texto blanco, fuente Rajdhani). Usar formato ARCHIVO:/ruta FIN_ARCHIVO obligatoriamente."
Completadas 3 subtareas. Agentes: frontend, qa, reviewer.
<!-- FIN ACTUALIZACIÓN -->


<!-- ACTUALIZACIÓN 2026-06-07 -->
## Sesión 2026-06-07 — "Modificar /home/agentes/public/kensei-dashboard.html para agregar funcionalidad de creación de nuevos proyectos. Agregar un botón "＋ Nuevo Proyecto" en la sección sidebar bajo Proyectos. Al clickearlo debe aparecer un modal con campos: nombre del proyecto, descripción breve, stack tecnológico. Al confirmar debe hacer POST a /proyecto/nuevo con esos datos. También modificar /home/agentes/index.js para agregar el endpoint POST /proyecto/nuevo que cree la carpeta /home/agentes/projects/{nombre}/, genere un CONTEXT.md básico con los datos ingresados, y agregue el proyecto al array proyectosValidos. Usar formato ARCHIVO:/ruta FIN_ARCHIVO para todos los archivos modificados."
Completadas 4 subtareas. Agentes: backend, frontend, qa, reviewer.
<!-- FIN ACTUALIZACIÓN -->


<!-- ACTUALIZACIÓN 2026-06-07 -->
## Sesión 2026-06-07 — "test"
Completadas 3 subtareas. Agentes: frontend, qa, reviewer.
<!-- FIN ACTUALIZACIÓN -->


<!-- ACTUALIZACIÓN 2026-06-07 -->
## Sesión 2026-06-07 — "Corregir SOLO /home/agentes/public/kensei-dashboard.html. NO modificar index.js ni orchestrator.js. Cambios requeridos: 1) El boton Nuevo Proyecto debe abrir un modal con campos nombre, descripcion y stack, al confirmar hace POST /proyecto/nuevo. 2) Agregar formulario de nueva mision con select de proyecto, input password para token, textarea para descripcion, y boton ejecutar que hace POST /tarea. 3) Restaurar tarjetas de estado: VPS uptime, disco 53%, RAM 21%, tokens, API OK. 4) Restaurar seccion servicios con n8n, Supabase Zebrano, Supabase Alfred, Vercel, Anthropic, TikTok con indicadores de estado. Mantener el diseno actual. Usar formato ARCHIVO:/ruta FIN_ARCHIVO."
Completadas 3 subtareas. Agentes: frontend, qa, reviewer.
<!-- FIN ACTUALIZACIÓN -->


<!-- ACTUALIZACIÓN 2026-06-07 -->
## Sesión 2026-06-07 — "undefined"
Completadas 4 subtareas. Agentes: backend, frontend, qa, reviewer.
<!-- FIN ACTUALIZACIÓN -->

## ⚠️ PENDIENTE

### Alta prioridad
- [ ] Agregar kensei como proyecto válido en /home/agentes/index.js
- [ ] Mejorar dashboard: fuente 15px, tarjetas compactas 3 columnas, logo SVG inline
- [ ] Conectar Alfred → POST 212.85.15.234:3001/tarea desde alfred.ts
- [ ] Crear repo GitHub kensei-ai

### Media prioridad
- [ ] Monitoreo real de servicios con push a Alfred
- [ ] CONTEXT.md de Theron, VETCOM, Inteltech
- [ ] Sistema para crear agentes nuevos desde el dashboard
- [ ] Módulo I+D: agente investigador de tendencias
- [ ] Login para el dashboard
- [ ] Persistir jobs en Supabase

### Técnico
- [ ] Revocar API keys viejas (Zebrano vieja, Alfredv2)
- [ ] Rate limiting en orquestador
- [ ] Rollback real via GitHub

## Instrucciones para agentes
1. Kensei es el proyecto más estratégico del holding.
2. Stack fijo: Node.js + Express. No cambiar sin aprobación.
3. Dashboard mantiene estética: fondo #080c10, Rajdhani + Share Tech Mono, paleta acero/azul.
4. Al crear agentes nuevos: agregarlos en /home/agentes/agents/index.js
5. Al terminar tarea: marcar como completada con fecha en este archivo.
6. Alfred primero: conexión Alfred-Kensei es máxima prioridad.
