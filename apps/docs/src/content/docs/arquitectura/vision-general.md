---
title: Visión general
description: Estructura del monorepo y principios de arquitectura de ALVAS
---

ALVAS se organiza como monorepo con tres superficies principales:

```txt
apps/api   API Hono sobre Cloudflare Workers
apps/web   UI SvelteKit sobre Cloudflare Pages
apps/docs  Portal de documentación
```

La API concentra las reglas de negocio y expone endpoints HTTP. La web consume la API mediante rutas server-side y componentes de UI. La documentación enlaza referencia automática y guías humanas.

## Principios

- El dominio no depende de infraestructura.
- Los casos de uso coordinan reglas de aplicación.
- Los puertos definen contratos de entrada y salida.
- Los adapters traducen HTTP, persistencia, sesiones y servicios externos.
- Las decisiones de negocio se expresan con lenguaje ubicuo.

## Referencias relacionadas

- [DDD y arquitectura hexagonal](./hexagonal-ddd)
- [Lenguaje ubicuo](../dominio/lenguaje-ubicuo)
- [Referencia TypeDoc API](/typedoc/api/)
