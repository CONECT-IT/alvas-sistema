---
title: API y Scalar
description: Referencia interactiva de la API de ALVAS con Scalar
---

La API expone su referencia interactiva con Scalar desde el propio servicio Hono.

Usa Scalar para probar endpoints, revisar schemas y validar contratos HTTP.

El contrato OpenAPI se genera automáticamente desde el código y se sirve en vivo:

- UI interactiva: `/docs`
- Contrato JSON: `/openapi.json`

Por entorno:

| Entorno    | URL                                                         |
| ---------- | ----------------------------------------------------------- |
| Local      | `http://127.0.0.1:8787/docs`                                |
| Staging    | `https://alvas-api-staging.softwarelazana.workers.dev/docs` |
| Production | `https://alvas-api.softwarelazana.workers.dev/docs`         |
