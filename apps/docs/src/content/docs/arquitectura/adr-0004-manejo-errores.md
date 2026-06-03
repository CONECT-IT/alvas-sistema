---
title: "ADR 0004: Manejo de Errores y Excepciones"
description: "ADR 0004: Manejo de Errores y Excepciones"
sidebar:
  order: 4
---

# ADR 0004: Manejo de Errores y Excepciones

## Estado

Aceptado

## Contexto

La API de ALVAS está construida con Hono y un dominio orientado a casos de uso. La aplicación ya distingue entre errores de dominio y errores técnicos, pero necesita una decisión formal que unifique:

- el flujo de errores en controladores y middleware
- los códigos HTTP retornados
- la forma en que se presentan los mensajes al cliente
- la clasificación de errores de validación, de negocio y de infraestructura

## Decision

Adoptamos una estrategia de manejo de errores basada en tres grandes categorías:

1. **Errores de dominio**
2. **Errores de validación**
3. **Errores internos/infrastrukturales**

### 1. Errores de dominio

- Se modelan como `ErrorDeDominio` en el dominio compartido.
- Se usan para invariantes de negocio, reglas de permiso, estados inválidos y casos no encontrados.
- Los casos de uso devuelven `Resultado` con `resultadoFallido(error)` cuando se detecta un `ErrorDeDominio`.
- Los controladores HTTP capturan estos resultados y usan `responderErrorDeDominio`.
- La composición también tiene un manejador global en `app.onError(...)` para errores no capturados.

### 2. Errores de validación

- Las validaciones de entrada se realizan antes de ejecutar los casos de uso, típicamente con `zod`.
- Si la validación falla, se lanza `ValidationError` desde `shared/infrastructure/validation/helpers`.
- El manejador global de errores traduce esto a un status `400` con respuesta:
  - `success: false`
  - `message: "Error de validación"`
  - `code: "VALIDATION_ERROR"`
  - `detalles`: details del error

### 3. Errores internos e imprevistos

- Cualquier excepción no prevista o técnica se considera error interno del servidor.
- El manejador global convierte estos errores en una respuesta genérica `500`:
  - `success: false`
  - `message: "Error interno del servidor."`
  - `code: "ERROR_INTERNO"`
- Estos errores también se registran en consola con `console.error`.

## Mappeo de códigos de dominio a HTTP

La función `mapErrorDeDominioAStatus(error)` define el mapeo:

- `409` para conflictos como `USUARIO_YA_EXISTE`
- `401` para seguridad: `AUTH_TOKEN_INVALIDO`, `REFRESH_TOKEN_INVALIDO`, `CREDENCIALES_INVALIDAS`
- `403` para autorización: `ROL_NO_PERMITIDO`, `SIN_PERMISOS*`
- `404` para entidades no encontradas: códigos con `NOT_FOUND`, `NO_ENCONTRADO`, `NO_ENCONTRADA`
- `400` para el resto de errores de dominio

## Estructura de respuesta

Para errores de dominio y validación, la respuesta JSON debe incluir:

- `success: false`
- `message`: texto legible del error
- `code`: identificador de error estandarizado
- `detalles` (solo para validación)

Ejemplo de respuesta de dominio:

{
"success": false,
"message": "No tienes permisos para ejecutar esta accion.",
"code": "ROL_NO_PERMITIDO"
}

## Controladores e infraestructura

- Los controladores usan `responderErrorDeDominio` cuando tienen un resultado de dominio fallido.
- Usan `responderErrorInterno` para relanzar excepciones no esperadas y dejar que el manejador global las capture.
- Esto mantiene la lógica HTTP separada del dominio.

## Invariantes

- No se debe exponer stack traces a los clientes.
- Los errores de dominio deben representar problemas de negocio o de reglas, no fallos técnicos.
- Los errores de validación deben ser tratados antes de invocar la lógica de dominio.
- Los errores internos deben convertirse en un único formato genérico y registrarse para auditoría.

## Consecuencias

- **Positivas:** mayor consistencia en respuestas API, menos fugas de información, reglas de negocio claramente diferenciadas de errores técnicos.
- **Negativas:** requiere disciplina para clasificar correctamente cada excepción.
- **Compromiso:** se acepta la sobrecarga de definir errores de dominio y códigos para obtener respuestas uniformes y navegables.

## Referencias

- `apps/api/src/main.ts`
- `apps/api/src/lib/shared/infrastructure/http/responses.ts`
- `apps/api/src/lib/shared/infrastructure/validation/helpers.ts`
- `apps/api/src/lib/ventas/infrastructure/http/*`
- `apps/api/src/lib/propiedades/infrastructure/http/PropiedadController.ts`
- `apps/api/src/lib/reportes/infrastructure/http/ReportesController.ts`
