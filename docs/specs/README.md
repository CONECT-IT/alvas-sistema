# Specs SDD de ALVAS

Este directorio contiene especificaciones humanas del producto. No reemplaza los tests automatizados: define comportamiento esperado, lenguaje ubicuo, reglas de negocio y criterios de aceptacion antes de bajar a codigo.

## Que significa SDD aqui

Specification Driven Development en ALVAS significa:

- Primero se describe una regla de negocio con lenguaje ubicuo.
- Luego se decide que capa la debe proteger: dominio, aplicacion, HTTP, contrato API-Web o UI.
- Finalmente se crean tests ejecutables que prueban esa regla.

La extension `.spec.ts` por si sola no hace SDD. Un test es una especificacion ejecutable solo cuando expresa comportamiento esperado y esta trazado a una regla de negocio.

## Relacion con tests

| Spec humana                      | Test ejecutable esperado                                |
| -------------------------------- | ------------------------------------------------------- |
| Regla de dominio pura            | `apps/api/test/unit/<context>/domain/**/*.spec.ts`      |
| Caso de uso con puertos/fakes    | `apps/api/test/unit/<context>/application/**/*.spec.ts` |
| Flujo de negocio conversacional  | `apps/api/test/bdd/features/**/*.feature`               |
| Contrato HTTP                    | `apps/api/test/http/<context>/**/*.http.spec.ts`        |
| Contrato API-Web                 | `apps/api/test/contract/**/*.contract.spec.ts`          |
| Comportamiento de componente web | `apps/web/test/component/**/*.spec.ts`                  |
| Flujo UX completo                | `apps/web/e2e/**/*.spec.ts`                             |

## Regla de organizacion

- `src/` contiene codigo productivo.
- `test/` contiene especificaciones ejecutables.
- `docs/specs/` contiene especificaciones humanas, decisiones funcionales y criterios de aceptacion.
- `docs/adr/` contiene decisiones arquitectonicas aceptadas.

## Convencion de cada spec

Cada documento debe incluir:

- Contexto.
- Lenguaje ubicuo.
- Reglas.
- Criterios de aceptacion.
- Trazabilidad sugerida a tests.
- Preguntas abiertas cuando el negocio aun no esta cerrado.

## Specs iniciales

- [Ventas, leads y clientes](ventas-leads-clientes.spec.md)
- [Usuarios, roles y permisos](usuarios-roles-permisos.spec.md)
- [Experiencia web y sistema de diseno](web-ux-design-system.spec.md)
- [Propiedades e inventario comercial](propiedades.spec.md)
- [Integraciones y captacion WhatsApp](integraciones-whatsapp.spec.md)
- [Reportes operativos y rendimiento comercial](reportes.spec.md)
