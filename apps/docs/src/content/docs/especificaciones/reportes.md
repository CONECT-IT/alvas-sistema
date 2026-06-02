---
title: "Spec: Reportes operativos y rendimiento comercial"
description: "Spec: Reportes operativos y rendimiento comercial"
sidebar:
  order: 5
---

# Spec: Reportes operativos y rendimiento comercial

## Contexto

ALVAS necesita reportes para entender rendimiento del sistema, carga comercial y conversion. Los reportes deben leer datos del negocio sin introducir reglas que contradigan los bounded contexts principales.

Esta spec define el comportamiento esperado para `reportes`.

## Lenguaje ubicuo

- `Conversion`: relacion entre leads captados y clientes concretados.
- `Carga por asesor`: cantidad de leads abiertos, citas pendientes y actividades recientes de un asesor.
- `Actividad comercial`: eventos sobre leads, citas, contratos, propiedades y clientes.
- `Pipeline`: distribucion de leads por estado.
- `Rendimiento`: lectura operativa de conversion, tiempo de cierre y seguimiento.

## Reglas de negocio

- Los reportes no deben modificar datos comerciales.
- Un admin puede ver reportes globales.
- Un asesor solo ve reportes de sus leads, citas y clientes relacionados.
- La conversion debe evitar division por cero y mostrar 0% cuando no hay base suficiente.
- Los conteos por estado deben usar valores del lenguaje ubicuo.
- Los reportes deben permitir filtrar por fecha, asesor y estado cuando aplique.
- Los datos sensibles no deben aparecer en agregados innecesarios.
- Un reporte debe indicar fecha de generacion para evitar confusion operativa.

## Criterios de aceptacion

- Dado un admin, el dashboard muestra leads por estado, citas pendientes, conversion y carga por asesor.
- Dado un asesor, el dashboard muestra solo su pipeline y sus citas pendientes.
- Dado cero leads, la conversion devuelve 0% y no falla.
- Dado leads convertidos y perdidos, el reporte los separa por estado.
- Dado filtros por fecha, las metricas solo consideran actividad del rango solicitado.
- Dado un reporte exportable futuro, no debe incluir hashes, tokens ni datos internos.

## Trazabilidad sugerida

- Dominio: `PorcentajeConversion`.
- Aplicacion: obtener reporte general, obtener estadisticas globales, reportes por asesor.
- HTTP: endpoints de reportes protegidos por rol.
- Contract: DTO de dashboard y metricas.
- Web: dashboard operativo, tarjetas KPI, tabla por asesor, filtros.
- E2E: admin ve reporte global; asesor ve reporte propio.

## Preguntas abiertas

- Cuales KPIs son obligatorios para MVP: conversion, leads por estado, citas pendientes, contratos vigentes?
- Se requiere comparar periodos: semana actual vs anterior, mes actual vs anterior?
- Los reportes deben exportarse a CSV/PDF en MVP o despues?
- Que nivel de detalle puede ver un asesor sobre otros asesores?
