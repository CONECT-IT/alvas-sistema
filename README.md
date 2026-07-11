# alvas-sistema

[![Test & Quality Pipeline](https://github.com/softwarelazana-ui/alvas-sistema/actions/workflows/test.yml/badge.svg?branch=develop)](https://github.com/softwarelazana-ui/alvas-sistema/actions/workflows/test.yml)
[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fsoftwarelazana-ui%2Falvas-sistema%2Fdevelop)](https://dashboard.stryker-mutator.io/reports/github.com/softwarelazana-ui/alvas-sistema/develop)

Base inicial del monorepo ALVAS alineada al plan tecnico DDD + Hexagonal.

## Objetivo tecnico

Reorganizar ALVAS de forma incremental, sin romper el MVP, con arquitectura modular por contexto y reglas claras de dependencias.

## Estructura

- `apps/api`: backend Hono sobre Cloudflare Workers.
- `apps/web`: frontend SvelteKit.

Estructura objetivo del backend:

```text
apps/api/src/lib/<modulo>/
  domain/
  application/
  infrastructure/
```

Modulos base definidos: `shared`, `usuarios`, `auth`, `propiedades`, `ventas`, `reportes`, `integraciones`.

## Convenciones DDD + Hexagonal

1. `domain` no depende de infraestructura.
2. `application` no depende de framework HTTP ni ORM.
3. `infrastructure` implementa puertos del dominio/aplicacion.
4. Entre modulos, consumir contratos publicos; evitar imports internos por paths profundos.

## Regla de idioma

- Dominio y aplicacion: espanol (lenguaje ubicuo de negocio).
- Nombres de clases, funciones y casos de uso del negocio: español.
- Carpetas y artefactos tecnicos pueden mantenerse en ingles.
- Terminos tecnicos de borde se mantienen en ingles: `Controller`, `Repository`, `DTO`, `Mapper`, `Middleware`, `Adapter`, `Port`.

## Regla de DTOs

- DTOs de request/response usan tipos primitivos y estructuras serializables.
- No exponer entidades o value objects del dominio en DTOs HTTP.
- Flujo esperado:
  `Http Request DTO -> Use Case -> Domain Entity/VO -> Repository -> Persistence -> Http Response DTO`.

## Regla de errores

- `shared` define errores base y estructura comun (`ErrorDeDominio`, `codigo`, `detalle`).
- Cada modulo define errores propios en su dominio (ejemplo: `UsuarioNoEncontradoError`).
- Infraestructura/HTTP mapea errores de dominio a 4xx y errores tecnicos a 5xx.

## Comandos

```bash
bun install
bun run dev:api
bun run dev:web
bun test
bun run lint
bun run typecheck
```

## Instalacion local

Requisitos:

- Bun.
- Node.js 24 o superior. El proyecto ejecuta scripts con Bun, pero Wrangler valida la version de Node en build.

Instalacion reproducible:

```bash
bun install --frozen-lockfile
```

El proyecto fija las dependencias de produccion a versiones exactas (dependency pinning) en los `package.json` de cada workspace, y consolida el arbol completo de dependencias transitivas en `bun.lock` versionado en el repositorio. La instalacion con `--frozen-lockfile` garantiza builds reproducibles: cualquier `bun install` en cualquier maquina resuelve exactamente las mismas versiones que se auditaron y desplegaron, sin derivas por rangos abiertos (`^`).

Dependencias de produccion fijadas a version exacta:

- `apps/api`: `hono 4.12.23`, `drizzle-orm 0.45.2`, `zod 4.4.3`, `@hono/zod-openapi 1.4.0`, `@scalar/hono-api-reference 0.10.20`, `uuid 14.0.0`.
- `apps/web`: `gsap 3.15.0`.
- Raiz: `drizzle-kit 0.31.10`.

Las `devDependencies` se mantienen en rangos `^` porque no llegan al artefacto desplegado y su actualizacion no afecta la inmutabilidad del release.

## Suite de calidad local

Los comandos locales replican el orden del pipeline para evitar diferencias entre la maquina local y CI:

```bash
bun run lint
bun run build
bun run test:unit
bun run test:bdd
bun run coverage:domain
bun run test:mutation
```

Comando consolidado:

```bash
bun run test:all
```

## Politica de Versionamiento (SemVer 2.0.0)

El proyecto sigue SemVer 2.0.0 (Preston-Werner, 2013) con etiquetas formato `vMAJOR.MINOR.PATCH`. La automatizacion del versionado esta delegada en `semantic-release` (`.releaserc.json`), que analiza los commits Conventional Commits y determina el incremento. Cada etiqueta de release es firmada (GPG) y constituye una linea base auditable bajo IEEE Std 828-2012.

Criterios especificos del proyecto:

- **MAJOR** (vX.0.0): cambio incompatible en la API publica de `apps/api`. Ejemplo: alterar la firma de un endpoint Hono o el DTO de respuesta de `POST /ventas` de `{total}` a `{monto, moneda}` sin mantener compatibilidad. Disparador de commit: `feat(ventas)!:` o `BREAKING CHANGE:` en el pie del commit.
- **MINOR** (v0.X.0): nueva funcionalidad retrocompatible. Ejemplo: agregar un nuevo caso de uso en `application/` o un nuevo endpoint `GET /reportes/ventas-mensuales` sin alterar los existentes. Disparador de commit: `feat:`.
- **PATCH** (v0.0.X): correccion retrocompatible de errores. Ejemplo: corregir el calculo de redondeo en el value object `TotalVenta` de `domain/ventas` sin cambiar la firma del endpoint. Disparador de commit: `fix:`.
- **Pre-release** (v0.0.0-alpha): versiones inestables previas a un release oficial, validadas en staging. No se publican a production. Ejemplo: `v1.1.0-rc.1`.

Mapeo Conventional Commits a SemVer (coherente con `commitlint.config.cjs` y `@semantic-release/commit-analyzer`):

| Tipo de commit                           | Incremento SemVer |
| ---------------------------------------- | ----------------- |
| `feat:`                                  | MINOR             |
| `fix:`, `perf:`                          | PATCH             |
| `feat!:` o `BREAKING CHANGE:`            | MAJOR             |
| `chore:`, `docs:`, `style:`, `refactor:` | sin release       |

### Proceso de Release

1. Clasificar el cambio segun la politica anterior mediante el mensaje del commit (Conventional Commits).
2. Abrir PR de `develop` hacia `main` (ver `CONTRIBUTING.md`).
3. Al hacer merge a `main`, `semantic-release` crea la etiqueta firmada `vX.Y.Z` y el GitHub Release de forma automatica.
4. La etiqueta dispara el workflow `deploy-release.yml` que despliega a Cloudflare Workers/Pages production.
5. Verificar la firma de la etiqueta: `git tag -v vX.Y.Z`.

## Pipeline CI/CD

El workflow principal esta en `.github/workflows/test.yml` y se ejecuta en `push` y `pull_request`. Usa Bun para instalacion y ejecucion de scripts, con Node.js 22 configurado para satisfacer el requisito de Wrangler.

Stages configurados:

1. `lint`: formato, ESLint y typecheck.
2. `build`: build de API y web.
3. `unit-test`: pruebas unitarias.
4. `integration-test`: escenarios BDD.
5. `coverage-report`: cobertura con artefacto descargable.
6. `mutation-test`: Stryker con artefacto HTML/JSON descargable.

El job `quality-gate` falla si cualquier stage previo falla.

## Quality gates

Coverage:

- Comando: `bun run coverage:domain`.
- Umbral: 80% en codigo bajo `domain/`.
- Reporte: `coverage/`, publicado como artefacto `coverage-report`.

Mutation testing:

- Comando: `bun run test:mutation`.
- Alcance: `domain/**/*.ts` y `application/use-cases/**/*.ts`.
- Exclusiones: tests, DTOs, puertos, `index.ts`, controllers, adaptadores e infraestructura.
- Umbral: `break: 70`.
- Reporte: `reports/mutation/`, publicado como artefacto `stryker-report`.
- Dashboard: si GitHub Secrets define `STRYKER_DASHBOARD_API_KEY`, Stryker publica el reporte completo en Stryker Dashboard.

## Especificaciones SDD

Las especificaciones humanas viven en `docs/specs/`. Ese directorio define reglas de negocio, lenguaje ubicuo, criterios de aceptacion y trazabilidad hacia tests ejecutables (`unit`, `bdd`, `http`, `contract`, component y E2E).
