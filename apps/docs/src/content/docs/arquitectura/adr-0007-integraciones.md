---
title: "ADR 0007: Integraciones y captación multicanal"
description: "ADR 0007: Integraciones y captación multicanal"
sidebar:
  order: 7
---

# ADR 0007: Integraciones y captación multicanal

## Estado

Pendiente / Aceptado

## Contexto

El backend gestiona captaciones externas y webhooks entrantes desde al menos un canal identificado: WhatsApp.

El bounded context `integraciones` ya está implementado en el código con los siguientes elementos:

- `IntegracionesController` y rutas en `/integraciones`
- `ProcesarWhatsAppWebhookUseCase`
- `ProcesarCaptacionEntranteUseCase`
- `CaptacionPendiente` como entidad/agregado de integraciones
- `D1CaptacionPendienteRepository` para persistencia de captaciones pendientes
- adapters que delegan el registro de leads y propiedades al contexto `ventas` y `propiedades`

## Decision

Definimos la estrategia de integraciones como un contexto especializado que:

1. Normaliza y registra captaciones entrantes en un ciclo de vida propio.
2. Protege las reglas de negocio de captación antes de delegar a `ventas`.
3. Acepta múltiples canales con validación y autenticación de origen.
4. Mantiene el flujo de revisión/deducción/convertir separado del pipeline comercial principal.

### 1. Flujo principal de captación

- Las captaciones entrantes se reciben en:
  - `POST /integraciones/captaciones` para captaciones genéricas
  - `POST /integraciones/webhooks/whatsapp` para webhooks de WhatsApp
- El payload se valida en la infraestructura con schemas de Zod.
- Los casos de uso crean una `CaptacionPendiente` y la persisten en `captaciones_pendientes`.
- La captura no se convierte inmediatamente en lead comercial sino que queda en estado pendiente para revisión.

### 2. Seguridad del webhook

- El endpoint de WhatsApp acepta un header `x-integracion-secreto`.
- Si `INTEGRACION_WHATSAPP_SECRETO` está configurado, el controlador valida el secreto con comparación segura.
- Esto protege el webhook contra llamadas no autorizadas sin exponer la lógica de negocio.

### 3. Manejo de captaciones pendientes

- Se exponen operaciones para gestionar captaciones pendientes:
  - listar captaciones pendientes
  - revisar una captación pendiente
  - marcar una captación como duplicada
  - rechazar una captación pendiente
  - convertir una captación pendiente en lead/propuesta comercial
- Estas operaciones usan un repositorio dedicado `ICaptacionPendienteRepository` y casos de uso específicos.

### 4. Conversión y adaptación cruzada de contextos

- La conversión de captación pendiente a lead/propuesta usa:
  - `RegistroLeadCaptacionVentasAdapter`
  - `RegistroPropiedadCaptacionAdapter`
- Esto respeta el aislamiento entre contexts: `integraciones` no conoce internamente los detalles de `ventas` ni `propiedades`, solo puertos de integración.

### 5. Deduplicación y política de errores

- El sistema soporta marcar captaciones como duplicadas y rechazar captaciones pendientes.
- No hay una política explícita de idempotencia global o reintentos automáticos en el webhook.
- Esto queda como mejora pendiente si se necesita mayor robustez de integraciones externas.

## Invariantes

- Un webhook solo se acepta si su payload es válido y, cuando corresponda, su secreto es correcto.
- Las captaciones entrantes quedan en estado pendiente antes de convertirse en entidad comercial.
- La conversión de una captación pendiente sólo se realiza mediante el caso de uso correspondiente y usando adaptadores de dominio.
- El contexto de integraciones no escribe directamente en tablas de `ventas` ni `propiedades` sin pasar por adapters.

## Consecuencias

- **Positivas:** el flujo de captación queda claramente aislado en un bounded context con revisión y políticas de estado.
- **Negativas:** el sistema actual no ofrece todavía una solución completa de idempotencia y reintentos para eventos externos.
- **Compromiso:** la integración soporta un canal principal (WhatsApp) y captaciones genéricas, mientras deja mejoras de resiliencia como trabajo futuro.

## Referencias

- `apps/api/src/lib/integraciones/infrastructure/http/IntegracionesController.ts`
- `apps/api/src/composition/integraciones.ts`
- `apps/api/src/lib/integraciones/application/use-cases/ProcesarWhatsAppWebhookUseCase.ts`
- `apps/api/src/lib/integraciones/application/use-cases/ProcesarCaptacionEntranteUseCase.ts`
- `apps/api/src/lib/integraciones/application/use-cases/GestionarCaptacionPendienteUseCases.ts`
- `apps/api/src/lib/integraciones/infrastructure/persistence/D1CaptacionPendienteRepository.ts`
- `apps/api/src/lib/ventas/infrastructure/adapters/RegistroLeadCaptacionVentasAdapter.ts`
- `apps/api/src/lib/propiedades/infrastructure/adapters/RegistroPropiedadCaptacionAdapter.ts`
