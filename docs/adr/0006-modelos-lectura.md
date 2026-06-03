# ADR 0006: Modelos de Lectura para Reportes

## Estado

Aceptado

## Contexto

El bounded context `reportes` no tiene un aggregate root transaccional propio. Los reportes se construyen a partir de datos de ventas y actividades comerciales, y deben evitar acoplarse a entidades transaccionales complejas.

Actualmente, `reportes` usa un puerto de lectura `IConsultaVentasParaReportes` y un adaptador `ConsultaVentasParaReportesAdapter` que convierte repositorios de ventas en snapshots ligeros. Esto sugiere un enfoque de lectura separado.

## Decision

Adoptamos un enfoque de modelos de lectura dedicados para reportes, manteniendo a `reportes` como un contexto de lectura que consume datos normalizados de `ventas`.

### 1. Puerto de lectura independiente

- `reportes` depende de `IConsultaVentasParaReportes`, no de entidades del dominio `ventas`.
- El puerto define tipos de lectura mínimos:
  - `LeadLecturaParaReportes`
  - `ClienteLecturaParaReportes`
  - `ActividadRecienteLectura`
  - `AsesorConTotalLeads`
  - `AccionResumenLectura`
- El dominio de reportes trabaja con estas proyecciones y no con `Lead`, `Cliente`, `Contrato` u otras entidades transaccionales.

### 2. Adaptadores de lectura

- `ConsultaVentasParaReportesAdapter` transforma los resultados del repositorio de ventas en datos de reporte.
- El adaptador puede evolucionar para usar consultas SQL especializadas o vistas materializadas cuando la complejidad lo amerite.
- Este adaptador actúa como una capa ACL entre `reportes` y `ventas`.

### 3. Casos de uso de reportes

- La lógica de reportes se distribuye en use cases específicos:
  - `ObtenerReporteGeneralUseCase`
  - `ObtenerEstadisticasGlobalesUseCase`
- Ambos casos construyen resultados a partir de datos de lectura y entidades de dominio ligeras como `ReporteGeneral` y `ResumenAcciones`.
- No hay operaciones de escritura en `reportes`.

### 4. Separación lectura/escritura

- Se mantiene un claro boundary entre:
  - operaciones transaccionales en `ventas`
  - consultas de reporte en `reportes`
- Los reportes pueden usar la misma base de datos D1, pero deben preferir consultas especificas y proyecciones.
- Los joins o agregaciones complejas deben implementarse en adaptadores/infrastructure, no en el dominio de reportes.

### 5. Evolución futura

- Si la carga de reportes crece, se puede introducir una capa de materialización:
  - vistas o tablas de resumen en D1
  - procesos batch o event-driven para sincronizar datos de `ventas`
- Mientras tanto, `reportes` usará el repositorio existente a través del adaptador.

## Invariantes

- El contexto `reportes` no debe importar entidades internas de `ventas`.
- Los datos de reporte deben ser mínimos y explicar solamente lo necesario para la métrica o consulta.
- Los modelos de lectura deben expirar rápido y ser reconstruibles sin afectar el dominio.
- Las métricas deben ser coherentes con el estado real de `ventas`, pero no tienen que ser transaccionales con cada cambio.

## Consecuencias

- **Positivas:** menor acoplamiento entre consulta y escritura; reportes más fáciles de testear; dominio de `ventas` no se contamina con variantes de presentación.
- **Negativas:** puede haber duplicación de lógica de datos si se construyen múltiples vistas de reporte similares.
- **Compromiso:** se prioriza la claridad y la separación de responsabilidades sobre un único modelo universal.

## Referencias

- `apps/api/src/lib/reportes/domain/ports/IConsultaVentasParaReportes.ts`
- `apps/api/src/lib/reportes/application/use-cases/ObtenerReporteGeneralUseCase.ts`
- `apps/api/src/lib/reportes/application/use-cases/ObtenerEstadisticasGlobalesUseCase.ts`
- `apps/api/src/lib/ventas/infrastructure/adapters/ConsultaVentasParaReportesAdapter.ts`
- `apps/api/src/composition/reportes.ts`
- `apps/api/src/main.ts`
