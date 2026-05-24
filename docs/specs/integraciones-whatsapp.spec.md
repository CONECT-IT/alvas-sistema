# Spec: Integraciones y captacion WhatsApp

## Contexto

Muchos leads de ALVAS llegan por WhatsApp. La integracion no debe acoplar el dominio a un proveedor externo: debe traducir mensajes entrantes a captaciones normalizadas y luego crear leads o propiedades `BORRADOR` segun reglas del negocio.

Esta spec define el comportamiento esperado para `integraciones`.

## Lenguaje ubicuo

- `Captacion`: entrada comercial recibida desde un canal externo.
- `Canal`: origen operativo como WhatsApp, formulario web o carga manual.
- `Lead comprador`: captacion interesada en comprar.
- `Lead vendedor`: captacion interesada en vender una propiedad mediante ALVAS.
- `Propiedad borrador`: propiedad creada desde una captacion vendedora antes de formalizar contrato.
- `Deduplicacion`: proceso para evitar crear multiples leads por el mismo contacto e interes.

## Reglas de negocio

- Una captacion debe normalizar telefono, nombre, canal, origen y tipo de interes.
- Si falta email, el sistema puede generar un email local tecnico, sin presentarlo como email real del cliente.
- WhatsApp crea captaciones pendientes de revision y deduplicacion; no crea leads directamente.
- Una captacion compradora validada crea o actualiza un lead comprador.
- Una captacion vendedora validada puede crear un lead vendedor y una propiedad en estado `BORRADOR`.
- La integracion de WhatsApp debe ser un adapter primario; el dominio no conoce payloads de WhatsApp.
- La asignacion automatica de asesor debe respetar carga, disponibilidad y reglas de visibilidad.
- Si hay duplicado probable, la captacion debe quedar trazable antes de crear otro lead.
- Todo webhook procesado debe poder auditarse con fecha, canal y resultado.

## Criterios de aceptacion

- Dado un mensaje WhatsApp comprador valido, se crea una captacion normalizada y un lead comprador.
- Dado un mensaje WhatsApp comprador valido, antes de crear lead queda como captacion pendiente de revision/deduplicacion.
- Dado un mensaje WhatsApp vendedor con datos de propiedad, primero se crea captacion pendiente y luego, al validarla, lead vendedor y propiedad en estado `BORRADOR`.
- Dado un telefono ya existente con lead abierto similar, el sistema evita duplicacion automatica.
- Dado un payload invalido, el adapter responde error controlado y registra el fallo.
- Dado una captacion sin email, el sistema genera email local solo para cumplir restricciones tecnicas.
- Dado una captacion asignada automaticamente, queda registrada la razon de asignacion.

## Trazabilidad sugerida

- Dominio: `Captacion`, `CanalCaptacion`, `OrigenCaptacion`, datos de contacto.
- Aplicacion: procesar captacion entrante, procesar webhook WhatsApp, asignar asesor.
- HTTP: webhook de WhatsApp, endpoint manual de captacion.
- Contract: payload normalizado de captacion hacia Web.
- BDD: captacion comprador, captacion vendedor, duplicado, payload invalido.
- Web: bandeja de captaciones, revision manual, conversion a lead.

## Preguntas abiertas

- Que campos minimos exige ALVAS para considerar vendedor vs comprador?
- Cual es la regla final de deduplicacion: telefono, email, propiedad, ventana de tiempo o combinacion?
- Como se auditan mensajes que traen datos incompletos pero utiles?
