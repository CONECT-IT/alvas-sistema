---
title: DDD y hexagonal
description: Separación por bounded context y capas domain, application e infrastructure
---

La API sigue una separación por bounded context:

```txt
src/lib/<modulo>/
  domain/
  application/
  infrastructure/
```

## Domain

Contiene entidades, value objects, errores de dominio y puertos que pertenecen al núcleo del módulo.

## Application

Contiene casos de uso y puertos inbound/outbound. Aquí se coordinan operaciones como registrar leads, convertir captaciones, listar propiedades o generar reportes.

## Infrastructure

Contiene controllers HTTP, repositorios D1/Drizzle, adapters y servicios técnicos. Esta capa depende de application/domain; el dominio no depende de ella.

## Regla importante

Los módulos no deben compartir value objects internos como dependencia directa. Si un módulo necesita consultar otro, debe hacerlo mediante puerto o adapter.
