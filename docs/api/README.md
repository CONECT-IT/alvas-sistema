# API ALVAS

La documentacion de contrato viva se expone desde el API:

- UI interactiva: `/docs`
- Contrato JSON: `/openapi.json`

El OpenAPI se genera automáticamente desde el código via `@hono/zod-openapi`. Cada ruta se documenta inline donde se define su handler.

## Herramienta recomendada

Para este repositorio conviene usar OpenAPI como contrato y visualizarlo con Swagger UI o Scalar.

- Vista local rapida: levantar `bun run dev:api` y abrir `http://127.0.0.1:8787/docs`.
- Contrato consumible por herramientas: `http://127.0.0.1:8787/openapi.json`.
- Generacion: `@hono/zod-openapi` registra las rutas documentadas usando schemas Zod de infraestructura.
- Visualizacion: `@scalar/hono-api-reference`.

## Convenciones

- Todas las respuestas usan `{ success: true, data }` o `{ success: false, message, code }`.
- Las rutas privadas usan `Authorization: Bearer <authToken>`.
- `/auth/login`, `/auth/refresh`, `/health` y webhooks/captaciones publicas no requieren Bearer.
