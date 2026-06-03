# ADR 0003: Estrategia de Persistencia

## Estado

Aceptado

## Contexto

El backend usa `drizzle-kit` y D1/SQLite para persistencia en `apps/api`. La arquitectura ya define un dominio rico con agregados, value objects y repositories, pero aún no hay una decisión formal sobre cómo mapear esos agregados a la base de datos y cómo mantener límites transaccionales claros.

El código actual expone un esquema centralizado en `drizzle.config.ts` apuntando a:

- `./apps/api/src/lib/**/infrastructure/persistence/schema.ts`

Esto sugiere que la persistencia debe ser organizada por bounded context e infraestructuras locales.

## Decision

Adoptamos una estrategia de persistencia que separa claramente:

1. Dominio
2. Repositorios/puertos
3. Infraestructura de persistencia (Drizzle/D1)

### 1. Mapeo de agregados a tablas

- Cada aggregate root persiste en su propia tabla principal.
- Las entidades internas de un agregado pueden persistir en tablas secundarias relacionadas.
- Ejemplos:
  - `Usuario` → `usuarios`
  - `Propiedad` → `propiedades`
  - `Lead` → `leads`
  - `Cliente` → `clientes`
  - `Contrato` → `contratos`
  - `Captacion` → `captaciones`

- No se crean agregados artificiales en la base de datos solo para cumplir un patrón; la tabla debe reflejar el ciclo de vida real del agregado.
- El modelo de lectura `reportes` permanece separado y puede usar vistas materializadas o tablas específicas de consulta si es necesario.

### 2. Schema y migrations

- El esquema se define con Drizzle en las carpetas de infraestructura de cada bounded context.
- Las migraciones se generan con `bunx drizzle-kit generate` y se aplican con `wrangler d1 migrations apply`.
- La configuración actual en `drizzle.config.ts` es la fuente autorizada para el esquema de D1.
- Se documentará el flujo de `db:generate`, `db:migrate:local`, `db:migrate:staging` y `db:migrate:production`.

### 3. Reconstructores y mappers

- La infraestructura convierte registros relacionales en objetos de dominio.
- Cada repository expone métodos como `findById`, `save`, `update`, `delete` y reconstruye agregados usando constructores privados o fábricas del dominio.
- Los repositorios nunca devuelven tipos de biblioteca (`DrizzleRow`, `D1Result`) al dominio.
- Las value objects del dominio se construyen a partir de datos primitivos persistidos.

### 4. Transacciones y consistencia

- Las invariantes del dominio se mantienen en las entidades/agregados.
- Cuando una operación afecta a más de un agregado o a varias tablas del mismo agregado, se usa una transacción DB.
- La capa de aplicación orquesta la transacción mediante un repositorio unit-of-work o un adaptador de infraestructura.
- La capa de dominio no ejecuta transacciones ni conoce D1/Drizzle.

### 5. Validación y constraints

- La validación de invariantes complejos ocurre en el dominio.
- La base de datos aplica constraints básicas de integridad: non-null, unicidad, tipos primitivos y llaves foráneas cuando corresponda.
- No se usa la DB como sustituto de las reglas de dominio; la DB protege contra corrupciones accidentales y datos inválidos básicos.

### 6. Bounded contexts y dependencias cruzadas

- Entre bounded contexts se persisten solo identificadores y datos necesarios.
- No se almacenan referencias de objeto entre contextos.
- El acceso a datos de otros contextos ocurre a través de puertos secundarios/adaptadores ACL, no mediante joins complejos entre agregados de diferentes contextos.

### 7. Modelo de lectura y reportes

- Los reportes usan consultas especializadas o modelos de lectura dedicados.
- No se obliga a `reportes` a usar los mismos agregados transaccionales.
- Si se necesita materializar métricas, se pueden crear tablas o vistas de lectura separadas en D1.

## Consecuencias

- **Positivas:** el dominio queda independiente de Drizzle y D1; los repositorios se convierten en la única frontera de persistencia; las transacciones se limitan a operaciones necesarias.
- **Negativas:** mantener mappers y reconstructores añade código adicional.
- **Compromiso:** el equipo acepta escribir un poco más de infraestructura a cambio de un dominio más puro y mejor testeable.

## Referencias

- `drizzle.config.ts`
- `apps/api/src/lib/**/infrastructure/persistence/schema.ts`
- Scripts de DB en `package.json`
- ADR 0001 y ADR 0002
