---
title: "ADR 0008: Plataforma de backend API en Cloudflare Workers + D1"
description: "ADR 0008: Plataforma de backend API en Cloudflare Workers + D1"
sidebar:
  order: 8
---

# ADR 0008: Plataforma de backend API en Cloudflare Workers + D1

## Estado

Aceptado

## Contexto

El backend de `apps/api` está diseñado como un servicio serverless que se despliega con Cloudflare Workers. La configuración actual incluye:

- `apps/api/src/main.ts` como punto de entrada de la aplicación.
- `wrangler.toml` para definición de entornos `development`, `staging` y `production`.
- `DB` como binding D1 en cada entorno y `drizzle` como directorio de migraciones.
- `Hono` como framework HTTP ligero compatible con Workers.
- Variables de entorno y secrets gestionados por Wrangler (`AUTH_SECRET`, `AUTH_REFRESH_SECRET`, `AUTH_PEPPER`, `CORS_ORIGINS`, `INTEGRACION_WHATSAPP_SECRETO`).

La aplicación también usa `bun` para scripts y comandos locales, pero el runtime de despliegue es Cloudflare.

## Decisión

Adoptamos Cloudflare Workers + D1 como plataforma principal para el backend API con estas decisiones específicas:

### 1. Ejecución serverless en Cloudflare Workers

- La API se despliega como un Worker sin servidor dedicado.
- El proyecto evita frameworks tradicionales de servidor como Express y utiliza `Hono` para mantener la compatibilidad con el runtime de Workers.
- La infraestructura de rutas, middleware y error handling se construye sobre el modelo de Workers.

### 2. Persistencia en D1 con Drizzle

- La base de datos es D1, accesible desde el binding `DB` en `wrangler.toml`.
- El esquema y las migraciones se gestionan con `drizzle-kit` y el directorio `drizzle/`.
- Los repositorios usan el tipo `D1DatabaseLike` para mantener una interfaz de acceso al DB compatible con el runtime de Cloudflare.

### 3. Configuración de entornos y secretos

- `wrangler.toml` define entornos `development`, `staging` y `production` con bindings D1 separados.
- Las variables de entorno compartidas se definen en los bloques `vars` y se extienden por entorno.
- Los secrets sensibles deben gestionarse con `wrangler secret put` en el entorno remoto, no en el repositorio.

### 4. Manejo de estado efímero y limitaciones

- Los Workers son efímeros; cualquier estado en memoria puede reiniciarse en cualquier momento.
- El rate limiter actual es puramente en memoria y se reinicia en cada cold start, por lo que no se usa como fuente de verdad distribuida.
- Cualquier requerimiento de estado duradero debe residir en D1 o en otra infraestructura externa.

### 5. Desarrollo local con `wrangler dev`

- El desarrollo local usa `bun --cwd apps/api wrangler dev` y `.dev.vars` para variables de entorno.
- El flujo local debe reflejar el runtime de Cloudflare tanto como sea posible, aunque la edición y prueba se haga con Bun.

## Invariantes

- La API se ejecuta siempre en un entorno compatible con Cloudflare Workers.
- No se debe confiar en persistencia en memoria para datos críticos.
- Las dependencias del backend deben ser compatibles con el runtime de Workers (`Hono`, `D1`, `crypto`, etc.).
- La infraestructura de persistencia sigue siendo un boundary explícito: los repositorios son la única capa que toca D1.

## Consecuencias

- **Positivas:** escalabilidad automática, despliegue sencillo y menor costos de infraestructura serverless.
- **Positivas:** el uso de D1 simplifica la persistencia y evita un backend de DB tradicional separado.
- **Negativas:** hay límites de ejecución y memoria propios de Workers que afectan a operaciones pesadas o a estado en memoria.
- **Negativas:** la lógica de rate limiting en memoria no es confiable a escala, por lo que puede requerir migración a un sistema distribuido si se necesita protección robusta.
- **Compromiso:** priorizamos un modelo simple y compatible con Workers, aceptando sus limitaciones para obtener un backend ágil y fácil de desplegar.

## Referencias

- `apps/api/src/main.ts`
- `apps/api/wrangler.toml`
- `apps/api/package.json`
- `docs/CONTRIBUTING.md` (Cloudflare Workers, secrets y migraciones D1)
- `drizzle.config.ts`
