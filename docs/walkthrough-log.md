# Log de walkthrough cruzado

Producto: ALVAS MVP v1.1  
Fecha: 2026-05-21  
Pipeline auditado: `.github/workflows/test.yml`

## Resumen del pipeline

| Etapa            | Comando                   | Evidencia                            |
| ---------------- | ------------------------- | ------------------------------------ |
| Lint             | `bun run lint`            | Stage 1: Lint                        |
| Build            | `bun run build`           | Stage 2: Build                       |
| Unit test        | `bun run test:unit`       | Stage 3: Unit Test                   |
| Integration test | `bun run test:bdd`        | Stage 4: Integration Test            |
| Coverage report  | `bun run coverage:domain` | Stage 5: Coverage Report + artefacto |
| Mutation test    | `bun run test:mutation`   | Stage 6: Mutation Test + artefacto   |

## Quality gates

| Metrica              | Umbral | Resultado esperado                    |
| -------------------- | ------ | ------------------------------------- |
| Cobertura de dominio | 80%    | Falla si `domain/` baja del umbral    |
| Mutation score       | 70%    | Falla si Stryker reporta menos de 70% |

## Hallazgos y acciones

| Defecto                                                                                                                                                 | Etapa afectada              | Severidad | Accion correctiva propuesta                                                                                                        | Responsable  | Fecha limite | Estado     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------ | ---------- |
| `auth/domain/ports/ITokenProvider.ts` importa `SessionClaims` desde `shared/infrastructure/session`, creando dependencia inversa hacia infraestructura. | Verificacion arquitectonica | Alta      | Mover `SessionClaims` a un contrato neutral de dominio/shared y actualizar imports.                                                | Equipo ALVAS | Pendiente    | Registrado |
| Mutation score ampliado sobre `domain` + `application/use-cases` reporta baseline 59.40%, menor al gate de 70%.                                         | Mutation test               | Alta      | Agregar asserts en casos de uso y value objects con mutantes sobrevivientes; priorizar ventas, usuarios, reportes e integraciones. | Equipo ALVAS | Pendiente    | Registrado |
| El pipeline requiere Node.js 22 por Wrangler aunque los scripts se ejecutan con Bun.                                                                    | Build                       | Media     | Mantener `actions/setup-node@v4` con `node-version: "22"` antes de instalar Bun.                                                   | Equipo ALVAS | 2026-05-21   | Corregido  |

## Preguntas de auditoria cruzada

| Pregunta                                                         | Respuesta                                                                                                                                                                            |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Como garantizan que las pruebas no sean flaky?                   | El pipeline ejecuta pruebas unitarias y BDD con `CI=true`, sin watch mode, y usa comandos locales equivalentes a CI. Las pruebas de dominio no dependen de base de datos real ni UI. |
| Que metricas de suficiencia de pruebas del SWEBOK implementaron? | Cobertura de codigo del dominio y mutation score como calidad de asserts.                                                                                                            |

## Firmas

| Rol             | Nombre       | Firma     |
| --------------- | ------------ | --------- |
| Equipo auditado | Equipo ALVAS | Pendiente |
| Equipo auditor  | Pendiente    | Pendiente |
