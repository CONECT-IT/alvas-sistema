# alvas-sistema

[![Test & Quality Pipeline](https://github.com/softwarelazana-ui/alvas-sistema/actions/workflows/test.yml/badge.svg?branch=develop)](https://github.com/softwarelazana-ui/alvas-sistema/actions/workflows/test.yml)
[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fsoftwarelazana-ui%2Falvas-sistema%2Fdevelop)](https://dashboard.stryker-mutator.io/reports/github.com/softwarelazana-ui/alvas-sistema/develop)

Base inicial del monorepo ALVAS alineada al plan tecnico DDD + Hexagonal.

## Objetivo tecnico

Reorganizar ALVAS de forma incremental, sin romper el MVP, con arquitectura modular por contexto y reglas claras de dependencias.

## Estructura

- `apps/api`: backend Hono sobre Cloudflare Workers.
- `apps/web`: placeholder para frontend Svelte.
- `packages/shared-types`: tipos compartidos del dominio.
- `packages/shared-utils`: utilidades compartidas.

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
- Node.js 22 o superior. El proyecto ejecuta scripts con Bun, pero Wrangler valida la version de Node en build.

Instalacion reproducible:

```bash
bun install --frozen-lockfile
```

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

Justificacion S07/S08: el 70% de mutation score representa un equilibrio entre rigor de asserts y costo de ejecucion en CI. La corrida ampliada actual registro 59.40%, por lo que el gate falla hasta reforzar pruebas en mutantes sobrevivientes.

Para activar el badge de mutation score:

1. Habilitar el repositorio en https://dashboard.stryker-mutator.io.
2. Crear el secret `STRYKER_DASHBOARD_API_KEY` en GitHub Actions.
3. Ejecutar el pipeline en `develop` para publicar el primer reporte.

## Auditoria arquitectonica

Comando de verificacion:

```bash
rg -n "import.*infrastructure" apps/api/src/lib/*/domain
```

Deuda registrada: `apps/api/src/lib/auth/domain/ports/ITokenProvider.ts` importa `SessionClaims` desde `shared/infrastructure/session`. Esta dependencia debe moverse a un contrato de dominio o shared neutral para cumplir estrictamente la arquitectura hexagonal.

## Evidencias de entrega

- Workflow: `.github/workflows/test.yml`.
- Reporte de cobertura: artefacto `coverage-report`.
- Reporte de Stryker: artefacto `stryker-report`.
- Log de walkthrough cruzado: `docs/walkthrough-log.md`.
- Tag esperado al cierre: `v1.1.0`.
