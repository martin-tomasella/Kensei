# Micro Apps — unidad de negocios

## Qué es
Herramientas de una sola función para nichos globales, en inglés, cobradas en USD por uso con créditos y activación automática. Meta: 10–12 apps. No se hacen desarrollos a medida por cliente.

## Roles
- Kensei construye: núcleo, cada micro app, integración de pago, arreglos de código y base de datos.
- Alfred opera: tablero (ventas, uso, créditos, bajas), soporte y alertas. Lo que requiere código se lo pasa a Kensei por /tarea.

## Código
- Repo: github.com/martin-tomasella/kensei-microapps (privado). Leer su README y CLAUDE.md antes de tocar nada.
- Base: esquema `microapps` en el Supabase de Alfred (`vkzonjohezyumxxqddux`). No exponerlo por PostgREST.
- Una Edge Function por app, con prefijo `microapps-`.

## Núcleo
- `microapps.consume(clave, app, unidades)`: valida la clave y descuenta créditos.
- `microapps.grant_credits(email, créditos, reason, ref)`: acredita; idempotente por (reason, ref).
- `microapps.issue_key(email)`: devuelve la clave en claro una sola vez.
- Toda app nueva: fila en `microapps.apps` + Edge Function que llama a `consume` después de procesar con éxito.

## Apps
| App | Estado | Edge Function |
| --- | --- | --- |
| Tracker Decoder (Teltonika Codec 8/8E) | API en producción, sin pasarela | microapps-tracker-decode |
| Cut List Optimizer | pendiente | — |
| OG Image API | pendiente | — |

## Reglas
- Nada que genere costos extra en Supabase, GitHub o Vercel.
- La pasarela de pago espera la LLC de EE. UU.; hasta entonces los créditos se cargan con `grant_credits`.
- Plan completo: doc "Unidad de Micro Apps — análisis de casos y plan" (https://claude.ai/artifact/Xi2RGZnUQbfg4smSNyRMFJ).
