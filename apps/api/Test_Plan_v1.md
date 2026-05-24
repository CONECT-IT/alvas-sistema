# Plan Maestro de Pruebas (Test Plan) v2.2

Este documento define la estrategia de testing de ALVAS para API y Web. El objetivo no es solo correr tests: es proteger la arquitectura DDD + hexagonal, el lenguaje ubicuo y los flujos comerciales de la inmobiliaria.

## 1. Regla de lenguaje

| Area                | Regla                                                                                                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dominio y negocio   | Espanol con lenguaje ubicuo: `asesor`, `lead vendedor`, `lead comprador`, `cliente vendedor`, `cliente comprador`, `cita`, `contrato`, `captacion`, `propiedad disponible`. |
| Artefactos tecnicos | Ingles permitido: `Controller`, `Repository`, `DTO`, `Mapper`, `Middleware`, `Adapter`, `Port`, `QueryHandler`, `SidePanel`, `E2E`, `contract test`.                        |
| Nombres de suites   | Nombrar comportamiento, no metodologia. Correcto: `ventas / domain / Lead`.                                                                                                 |
| Ubicacion           | `src/` es codigo productivo. `test/` y `*.spec.ts` son specs ejecutables. `docs/specs/` son specs humanas SDD.                                                              |

## 2. Mapa de capas de testing

| Capa                 | Que valida                                                 | Infraestructura real                         | Herramienta                  | Ubicacion                                       | Estado        |
| -------------------- | ---------------------------------------------------------- | -------------------------------------------- | ---------------------------- | ----------------------------------------------- | ------------- |
| Static analysis      | Formato, lint, tipos estrictos                             | No                                           | Prettier, ESLint, TypeScript | Root, API, Web                                  | Activo        |
| API unit domain      | Value Objects, entidades, Aggregate Roots, Domain Services | No                                           | `bun test`                   | `apps/api/test/unit/<context>/domain/`          | Activo        |
| API application      | Use cases contra ports y fakes in-memory                   | No                                           | `bun test`                   | `apps/api/test/unit/<context>/`                 | Activo        |
| API BDD              | Flujos de negocio con lenguaje Gherkin                     | No                                           | Cucumber + TypeScript        | `apps/api/test/bdd/features/`                   | Activo        |
| API HTTP             | Adaptadores HTTP, status codes, serializacion, auth        | No servidor real; `app.request()` in-process | Hono + `bun test`            | `apps/api/test/http/<context>/`                 | Inicial       |
| API contract         | Contratos serializados API-Web sin paquete compartido      | No                                           | `bun test`                   | `apps/api/test/contract/`                       | Inicial       |
| API coverage         | Cobertura de `domain/`                                     | No                                           | Bun coverage + script local  | `coverage/`                                     | Gate 80%      |
| API mutation         | Fuerza de asserts en dominio y use cases                   | No                                           | Stryker                      | `reports/mutation/`                             | Gate 70%      |
| Web unit/application | Use cases de Web contra ports                              | No                                           | Vitest                       | `apps/web/src/lib/**/application/**/*.spec.ts`  | Activo        |
| Web component        | Componentes Svelte 5 y UI aislada                          | jsdom                                        | Vitest + Testing Library     | `apps/web/src/lib/**/presentation/**/*.spec.ts` | Inicial       |
| Web coverage         | Cobertura de `domain/` y `application/`                    | No                                           | Vitest coverage v8           | `apps/web/coverage/`                            | Gate 70%      |
| Web E2E              | Flujos UX reales                                           | Si: preview + Chromium                       | Playwright                   | `apps/web/e2e/`                                 | Smoke inicial |

## 3. Matriz por bounded context

| Contexto        | Reglas principales                                                   | Unit/Application | HTTP                   | Contract                | Web/component              | E2E                        |
| --------------- | -------------------------------------------------------------------- | ---------------- | ---------------------- | ----------------------- | -------------------------- | -------------------------- |
| `auth`          | Sesion, tokens, refresh, rechazo de usuario deshabilitado            | Activo           | Login/refresh inicial  | Pendiente               | `User` domain web          | Rutas protegidas pendiente |
| `usuarios`      | Admin gestiona usuarios; asesor edita solo datos permitidos          | Activo           | Listar/obtener inicial | Usuario sin `hashClave` | Use cases web activos      | Admin usuarios pendiente   |
| `ventas`        | Leads, citas, conversion, contratos, historial, asesor asignado      | Activo           | Pipeline inicial       | Pipeline inicial        | Kanban y use cases activos | Kanban drag/drop pendiente |
| `propiedades`   | Propias, preliminares, disponibles, cliente vendedor                 | Activo           | Listado/filtro inicial | Pendiente               | Use cases web activos      | Catalogo pendiente         |
| `integraciones` | Captacion WhatsApp, normalizacion, email local, propiedad preliminar | Activo           | Captacion/webhook      | Captacion inicial       | Captaciones web activo     | Pendiente                  |
| `reportes`      | KPIs, conversion, carga por asesor, actividad                        | Activo           | Admin/reportes inicial | Dashboard inicial       | Use cases web activo       | Dashboard pendiente        |

## 4. Estructura esperada

```text
apps/api/test/
  unit/
    <context>/
      domain/
      application/
  bdd/
    features/
      *.feature
      step_definitions/*.steps.ts
  http/
    auth/*.http.spec.ts
    usuarios/*.http.spec.ts
    ventas/*.http.spec.ts
    propiedades/*.http.spec.ts
  contract/
    api-web.contract.spec.ts

apps/web/
  src/lib/<context>/
    domain/**/*.spec.ts
    application/**/*.spec.ts
    presentation/**/*.spec.ts
  e2e/*.spec.ts
```

## 5. Comandos

| Comando                                      | Proposito                                             |
| -------------------------------------------- | ----------------------------------------------------- |
| `bun run typecheck`                          | TypeScript estricto de API y Web.                     |
| `bun run test:unit`                          | API unit, application, HTTP y contract specs con Bun. |
| `bun run test:bdd`                           | BDD Gherkin de API.                                   |
| `bun run test:web`                           | Web unit/component specs con Vitest.                  |
| `bun run coverage:domain`                    | Gate API domain coverage >= 80%.                      |
| `bun run --cwd apps/web coverage:components` | Gate Web domain/application coverage >= 70%.          |
| `bun run test:mutation`                      | Gate mutation score >= 70%.                           |
| `bun run --cwd apps/web test:e2e`            | E2E Playwright.                                       |

## 6. Pipeline CI/CD

| Stage | Job                   | Scope     | Dependencia           | Gate                                    |
| ----- | --------------------- | --------- | --------------------- | --------------------------------------- |
| 1     | `lint` matrix         | API, Web  | Ninguna               | Formato, lint, typecheck por app        |
| 2     | `build` matrix        | API, Web  | `lint`                | Build por app                           |
| 3a    | `api-unit-test`       | API       | `build`               | `bun --cwd apps/api test`               |
| 4a    | `api-integration-bdd` | API       | `api-unit-test`       | Gherkin                                 |
| 5a    | `api-coverage`        | API       | `api-integration-bdd` | Domain coverage >= 80%                  |
| 6a    | `api-mutation`        | API       | `api-coverage`        | Mutation >= 70%                         |
| 3b    | `web-component-test`  | Web       | `build`               | Vitest                                  |
| 4b    | `web-e2e`             | Web       | `web-component-test`  | Playwright                              |
| 5b    | `web-coverage`        | Web       | `web-e2e`             | Coverage >= 70%                         |
| Final | `quality-gate`        | API + Web | Todos                 | Falla si cualquier job no fue `success` |

## 7. Quality gates

| Gate                | Umbral    | Justificacion                                                                       |
| ------------------- | --------- | ----------------------------------------------------------------------------------- |
| API domain coverage | 80%       | El dominio es el nucleo comercial; debe estar protegido con alta cobertura.         |
| API mutation score  | 70%       | Evita asserts debiles en reglas de negocio y casos de uso.                          |
| Web coverage        | 70%       | Protege `domain/` y `application/`; UI visual se complementa con component/E2E.     |
| E2E                 | Pass/fail | Los flujos UX criticos no tienen umbral numerico: si falla el flujo, falla el gate. |

No se bajan umbrales para hacer pasar CI. Si un gate falla, se agregan specs o se corrige el codigo.

## 8. Estado actual de specs ejecutables

| Area                                                 | Archivos principales                                                                                                                                                                                                    | Estado  |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| API domain ventas                                    | `Lead.spec.ts`, `EstadoLead.spec.ts`, `TipoVenta.spec.ts`, `cita.test.ts`, `contrato.test.ts`, `cliente.test.ts`                                                                                                        | Activo  |
| API application ventas                               | `ventas-use-cases.test.ts`, `evaluador-asignacion.test.ts`                                                                                                                                                              | Activo  |
| API auth/usuarios/propiedades/reportes/integraciones | `test/unit/<context>/`                                                                                                                                                                                                  | Activo  |
| API HTTP                                             | `health.http.spec.ts`, `auth-routes.http.spec.ts`, `usuarios-routes.http.spec.ts`, `ventas-routes.http.spec.ts`, `propiedades-routes.http.spec.ts`, `integraciones-routes.http.spec.ts`, `reportes-routes.http.spec.ts` | Inicial |
| API contract                                         | `api-web.contract.spec.ts` con auth, usuario, pipeline, propiedad, captacion y reportes                                                                                                                                 | Inicial |
| Web application                                      | `*-use-cases.spec.ts` por contexto                                                                                                                                                                                      | Activo  |
| Web component                                        | `LeadKanban.spec.ts`, `SidePanel.spec.ts`                                                                                                                                                                               | Inicial |
| Web E2E                                              | `smoke.spec.ts`                                                                                                                                                                                                         | Inicial |

## 9. Backlog de testing

| Prioridad | Capa             | Trabajo                                                                                  |
| --------- | ---------------- | ---------------------------------------------------------------------------------------- |
| Alta      | HTTP ventas      | Profundizar specs de compra concretada, reasignacion admin y asesor no reasigna.         |
| Alta      | HTTP propiedades | Profundizar specs de propiedad vendida/archivada y disponibilidad para compradores.      |
| Alta      | E2E Web          | Kanban drag/drop actualiza estado, dark mode persiste, SidePanel edita sin perder lista. |
| Alta      | Contract         | Mantener contratos locales por contexto antes de cambiar DTOs.                           |
| Media     | Component Web    | Tablas, badges de estado, sidebar, perfil, formularios dentro de SidePanel.              |
| Media     | BDD              | Escenarios de lead vendedor, lead comprador, contrato y cliente recurrente.              |
| Media     | Mutation         | Subir mutantes sobrevivientes hasta 70% real.                                            |
| Baja      | Integration DB   | D1 test para repositorios criticos, migraciones e integridad referencial.                |

## 10. Trazabilidad SDD

| Spec humana                                  | Specs ejecutables esperadas                                                         |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| `docs/specs/ventas-leads-clientes.spec.md`   | Domain specs de `Lead`, application specs de ventas, BDD, HTTP ventas, E2E Kanban.  |
| `docs/specs/usuarios-roles-permisos.spec.md` | Unit/application usuarios, HTTP usuarios, E2E admin usuarios, rutas protegidas.     |
| `docs/specs/web-ux-design-system.spec.md`    | Component specs, E2E dark mode, SidePanel, sidebar y vistas informativas.           |
| `docs/specs/propiedades.spec.md`             | Domain/application propiedades, HTTP propiedades, contract propiedad, E2E catalogo. |
| `docs/specs/integraciones-whatsapp.spec.md`  | Unit/application integraciones, HTTP webhook, BDD captacion WhatsApp.               |
| `docs/specs/reportes.spec.md`                | Unit reportes, contract dashboard, Web dashboard, E2E dashboard operativo.          |

## 11. Principios

- Los tests de dominio no conocen HTTP, DB, Hono, Drizzle ni Svelte.
- Los tests de application usan fakes tipados por ports.
- Los HTTP tests usan `app.request()` o routers Hono in-process, sin abrir puertos.
- Los contract tests no crean paquetes compartidos; validan la forma serializada acordada entre API y Web.
- Los E2E son los unicos que levantan servidor y browser real.
- Cada nuevo bounded context debe traer su carpeta en `src/lib/<context>/` y su espejo minimo en tests.
