---
title: "ADR 0005: Autenticación y Autorización"
description: "ADR 0005: Autenticación y Autorización"
sidebar:
  order: 5
---

# ADR 0005: Autenticación y Autorización

## Estado

Aceptado

## Contexto

El backend ya tiene un bounded context `auth` con:

- `Sesion` como agregado del dominio
- `IniciarSesionUseCase` y `RenovarSesionUseCase`
- un proveedor de tokens HMAC en `HmacTokenProvider`
- middlewares `verifySessionMiddleware` y `requireRolesMiddleware`

La implementación actual expone un modelo de sesión con `authToken` y `refreshToken`, y el sistema necesita una política clara de seguridad para tokens, roles y acceso a rutas.

## Decision

Adoptamos estas decisiones para autenticación y autorización:

### 1. Tokens de doble capa

- **Auth Token**: token de corta duración usado en las peticiones autenticadas.
- **Refresh Token**: token de larga duración usado solo para renovar una sesión.
- Ambos tokens son JWT firmados con HMAC (`HS256`) en `HmacTokenProvider`.
- El payload mínimo incluye:
  - `idUsuario`
  - `rol`
  - `tipo` (`auth` o `refresh`)
  - `exp`

### 2. Estados y límites de sesión

- Una sesión válida se representa con la entidad de dominio `Sesion`.
- `Sesion` expone `authToken`, `refreshToken`, `idUsuario`, `username` y `rol`.
- Los tokens se generan en los casos de uso de autenticación:
  - `IniciarSesionUseCase`
  - `RenovarSesionUseCase`

### 3. Validación de credenciales

- `IniciarSesionUseCase` valida que:
  - el `username` exista
  - el usuario esté `ACTIVO`
  - la clave coincida con `hashClave`
- Si alguna validación falla, se devuelve `CredencialesInvalidasError`.
- No se retornan detalles específicos de qué parte falló para evitar fugas de información.

### 4. Renovación de sesión

- `RenovarSesionUseCase` valida el `refreshToken` y vuelve a emitir ambos tokens.
- También verifica que el usuario siga `ACTIVO` antes de renovar.
- El `refreshToken` no se almacena en la sesión del servidor; se basa en la firma HMAC y la expiración.

### 5. Middleware de autenticación

- `verifySessionMiddleware` extrae el header `Authorization: Bearer <token>`.
- Valida el token mediante `validarAuthToken`.
- Verifica que el usuario asociado esté todavía `ACTIVO` en DB.
- Establece `authPayload` en el contexto con los claims validados.
- Si el token es inválido o el usuario no está activo, falla con `AUTH_TOKEN_INVALIDO`.

### 6. Autorización por roles

- `requireRolesMiddleware` controla acceso basado en el claim `rol`.
- Los roles permitidos se configuran por ruta.
- Si el rol del usuario no está autorizado, falla con `ROL_NO_PERMITIDO`.
- Ejemplo actual: `/reportes` requiere `ADMIN`.

### 7. Configuración de secretos y TTL

Los valores se obtienen desde variables de entorno:

- `AUTH_SECRET`
- `AUTH_REFRESH_SECRET` (opcional, puede ser igual a `AUTH_SECRET`)
- `AUTH_TOKEN_TTL_SEGUNDOS` (defecto `900`)
- `REFRESH_TOKEN_TTL_SEGUNDOS` (defecto `604800`)

### 8. Autorización operativa y límites del dominio

- La configuración de roles y permisos se mantiene en el dominio y la infraestructura de auth.
- El resto de los bounded contexts consume `SessionClaims` sin conocer la implementación del token.
- Las rutas autorizadas usan los middleware como capa de protección primaria.

## Invariantes

- `authToken` solo es válido si:
  - la firma HMAC es correcta
  - el claim `tipo` es `auth`
  - el `exp` aún no ha expirado
  - el usuario existe y está `ACTIVO`
- `refreshToken` solo es válido si:
  - la firma HMAC es correcta
  - el claim `tipo` es `refresh`
  - el `exp` aún no ha expirado
  - el usuario tiene estado `ACTIVO`
- `rol` se interpreta como valor del lenguaje ubicuo del dominio.
- Las rutas protegidas son accesibles solo cuando el middleware confirma la sesión y el rol.

## Consecuencias

- **Positivas:** la seguridad se centraliza en un bounded context bien definido; la autenticación es stateless y el middleware no se mezcla con lógica de negocio.
- **Negativas:** no hay revocación de refresh tokens a menos que se implemente un mecanismo adicional de blacklist o almacenamiento.
- **Compromiso:** se prioriza la simplicidad y la claridad de flujo de tokens, dejando la revocación o invalidez de refresh token para una posible mejora futura.

## Referencias

- `apps/api/src/lib/auth/domain/entities/Sesion.ts`
- `apps/api/src/lib/auth/infrastructure/security/HmacTokenProvider.ts`
- `apps/api/src/lib/auth/infrastructure/security/TokenProviderFactory.ts`
- `apps/api/src/lib/auth/application/use-cases/IniciarSesionUseCase.ts`
- `apps/api/src/lib/auth/application/use-cases/RenovarSesionUseCase.ts`
- `apps/api/src/lib/shared/infrastructure/session/SessionMiddleware.ts`
- `apps/api/src/main.ts`
