---
title: "Spec: Usuarios, roles y permisos"
description: "Spec: Usuarios, roles y permisos"
sidebar:
  order: 2
---

# Spec: Usuarios, roles y permisos

## Contexto

ALVAS tiene tres perfiles principales: admin, asesor y variaciones futuras por responsabilidad. El sistema debe proteger visibilidad, edicion y trazabilidad sin acoplar reglas de autorizacion a controladores HTTP.

## Lenguaje ubicuo

- `Admin`: usuario con visibilidad total y capacidad de administracion operativa.
- `Asesor`: usuario responsable de leads asignados y actividades relacionadas.
- `Usuario interno`: identidad de acceso al sistema.
- `Rol`: capacidad funcional de un usuario.
- `Estado de usuario`: disponibilidad de la cuenta para operar.

## Reglas de negocio

### Admin

- Puede ver todos los leads, clientes, propiedades, contratos, reportes y usuarios.
- Puede asignar o reasignar leads a asesores.
- Puede crear leads y decidir asesor responsable.
- Puede crear, actualizar o deshabilitar usuarios.
- No debe eliminar informacion historica comercial; las bajas deben ser logicas cuando afecten trazabilidad.
- Gestiona o supervisa propiedades propias de ALVAS.

### Asesor

- Puede ver leads asignados a el y la informacion necesaria para gestionarlos.
- Puede crear leads propios; por defecto quedan asignados a el.
- Puede editar y cerrar leads asignados mientras el ciclo este abierto.
- Puede gestionar citas, comentarios y seguimiento de sus leads.
- No puede ver ni modificar leads asignados a otros asesores.
- No puede asignar leads a otros asesores salvo que una futura regla de negocio lo permita.
- Puede actualizar solo su propio `username` y contraseña.

### Edicion de usuario propio

- Un asesor puede actualizar solo su `username` y contraseña desde perfil propio.
- Un asesor no puede cambiar su rol, estado, permisos ni campos que lo hagan desaparecer operativamente del sistema.
- Un asesor no puede cambiar su nombre visible.
- Un asesor no puede deshabilitarse a si mismo.
- Un admin conserva la capacidad de corregir datos y deshabilitar cuentas.
- La asignacion automatica ignora asesores deshabilitados o en pausa y prioriza disponibilidad/rendimiento del lead.
- Un token tecnicamente valido debe rechazarse si el usuario fue deshabilitado despues de emitirlo.

## Criterios de aceptacion

- Dado un asesor autenticado, cuando lista leads, recibe solo los leads asignados a el.
- Dado un asesor autenticado, cuando intenta actualizar un lead ajeno, recibe rechazo de autorizacion.
- Dado un admin autenticado, cuando lista leads, recibe todos los leads.
- Dado un admin autenticado, puede reasignar un lead de un asesor a otro.
- Dado un asesor autenticado, puede actualizar su `username` y contraseña si pasan validaciones de dominio.
- Dado un asesor autenticado, no puede cambiar su `rol` ni su `estado`.
- Dado un asesor autenticado, no puede cambiar su nombre visible desde perfil propio.
- Dado un usuario deshabilitado, no puede iniciar sesion.
- Dado un usuario que inicio sesion y luego fue deshabilitado, cuando usa su token vigente, el middleware de sesion rechaza la peticion.

## Trazabilidad sugerida

- Dominio: `Usuario`, `Username`, `Rol`, `EstadoUsuario`.
- Aplicacion: actualizar usuario propio, actualizar usuario por admin, listar leads por visibilidad.
- HTTP: middleware de sesion, validacion de usuario activo, roles requeridos, rechazo de operaciones no autorizadas.
- BDD: administracion de usuarios y gestion de leads por asesor.
- Contract: DTOs de usuario no deben exponer `hashClave` ni detalles sensibles.

## Decisiones cerradas

- Por ahora no existe rol separado de supervisor o coordinador comercial.
- El asesor no edita nombre visible ni datos administrativos desde perfil propio; solo `username` y contraseña.
- La asignacion automatica de leads entrantes por WhatsApp considera disponibilidad/rendimiento y excluye asesores deshabilitados o en pausa.

## Preguntas abiertas

- Debe exigirse contraseña actual para cambiar la contraseña desde perfil propio?
