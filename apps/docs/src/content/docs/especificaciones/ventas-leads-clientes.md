---
title: "Spec: Ventas, leads y clientes"
description: "Spec: Ventas, leads y clientes"
sidebar:
  order: 1
---

# Spec: Ventas, leads y clientes

## Contexto

ALVAS actua como mediador en la venta de propiedades. Puede vender propiedades propias y propiedades de clientes vendedores. El contexto `ventas` gestiona el pipeline comercial: leads, citas, conversiones, clientes, contratos e historial de actividad.

Esta spec describe la regla de negocio esperada antes de ajustar entidades, casos de uso, controladores o UI.

## Lenguaje ubicuo

- `Lead vendedor`: persona interesada en que ALVAS venda una o varias propiedades.
- `Lead comprador`: persona interesada en comprar una propiedad o varias ofrecidas por ALVAS cuales son de clientes vendedores o propias de ALVAS.
- `Asesor`: usuario que gestiona leads asignados y sus actividades.
- `Admin`: usuario con visibilidad total, control operativo y responsabilidad sobre propiedades propias de ALVAS.
- `Cliente vendedor`: antiguo lead vendedor que formalizo un contrato con ALVAS.
- `Cliente comprador`: antiguo lead comprador que concreto una compra.
- `Cita`: visita, reunion o seguimiento agendado con un lead.
- `Contrato`: formalizacion comercial entre ALVAS y un cliente vendedor.
- `Historial comercial`: registro cronologico de estados, citas, comentarios, conversiones y acciones relevantes.

## Reglas de negocio

### Leads vendedores

- Un lead vendedor puede registrar una o varias propiedades ofrecidas para venta.
- Las propiedades de un lead vendedor aun no son propiedades disponibles para compradores; nacen como `BORRADOR`.
- El asesor asignado puede editar los datos del lead vendedor, sus propiedades relacionadas, citas, comentarios y estado mientras el lead siga abierto.
- Un lead vendedor puede requerir varias citas antes de decidir si firma contrato.
- Cuando firma contrato, el lead vendedor se convierte en cliente vendedor.
- Al firmar contrato, la propiedad asociada registra el `idClientePropietario` del cliente vendedor formal.
- Las propiedades cubiertas por el contrato pueden pasar a ser propiedades disponibles para comercializacion, segun las reglas del contrato, catalogo y aprobacion operativa.
- Si el mismo cliente vuelve a ofrecer otra propiedad en el futuro, se crea un nuevo ciclo de lead relacionado al cliente existente.
- El historial debe conservar cada ciclo comercial, no sobrescribirlo.

### Leads compradores

- Un lead comprador esta interesado en propiedades disponibles de ALVAS.
- Un asesor solo debe mostrar propiedades propias de ALVAS o propiedades de clientes vendedores con contrato vigente.
- Un asesor no debe mostrar propiedades de leads vendedores sin contrato.
- Cuando un lead comprador concreta una compra, se convierte en cliente comprador.
- Aunque no haya contrato directo entre comprador y ALVAS en el modelo actual, la operacion debe quedar registrada y relacionada con la propiedad vendida y el cliente vendedor correspondiente cuando aplique.
- Un cliente comprador puede volver a entrar como lead comprador en otro ciclo comercial.

### Cierre y reapertura funcional

- Un lead cerrado por `CONVERTIDO` o `PERDIDO` no acepta nuevas citas ni edicion de datos comerciales del ciclo cerrado.
- Un cliente existente puede originar nuevos leads sin modificar el historial de ciclos anteriores.
- La trazabilidad debe permitir ver que hizo ALVAS por cada lead antes de convertirlo, perderlo o cerrarlo.

### Asignacion de asesores

- Un admin puede asignar leads a asesores.
- Un asesor puede crear leads propios; por defecto quedan asignados al asesor creador.
- Un asesor no puede reasignar leads; la reasignacion manual corresponde solo al admin.
- La asignacion automatica debe favorecer distribucion equitativa de carga, sin romper reglas de visibilidad.
- Si un lead cambia de asesor, el historial debe registrar el cambio y conservar la responsabilidad anterior.

### Compra concretada

- Cuando un lead comprador concreta una compra, la operacion queda como actividad e historial comercial.
- La propiedad comprada deja de mostrarse como disponible para nuevos compradores.
- Si el comprador vuelve a interesarse en otra propiedad, se crea un nuevo ciclo comercial.

### Captacion externa

- WhatsApp no crea leads directamente.
- WhatsApp crea captaciones pendientes de revision y deduplicacion.
- Luego una captacion validada puede convertirse en lead comprador o lead vendedor.

## Criterios de aceptacion

- Dado un lead vendedor sin contrato, sus propiedades no aparecen como disponibles para leads compradores.
- Dado un lead vendedor abierto, el asesor asignado puede editar datos del lead y propiedades relacionadas.
- Dado un lead vendedor convertido, no se pueden agendar nuevas citas sobre ese ciclo.
- Dado un contrato firmado desde un lead vendedor, el sistema crea o vincula el cliente vendedor y registra ese cliente como propietario de la propiedad asociada.
- Dado un cliente vendedor existente, un nuevo interes de venta crea un nuevo ciclo de lead relacionado al cliente.
- Dado un lead comprador, el sistema lista solo propiedades disponibles segun contrato, propiedad propia o reglas de visibilidad.
- Dado un asesor, solo puede ver y modificar leads asignados a el.
- Dado un admin, puede ver y reasignar cualquier lead.
- Dado un asesor, no puede reasignar leads a otros asesores.
- Dado un cambio de asesor, el historial registra fecha, asesor anterior y asesor nuevo.
- Dado una compra concretada, la propiedad deja de aparecer como disponible.

## Trazabilidad sugerida

- Dominio: `Lead`, `Cliente`, `Contrato`, `Cita`, `EstadoLead`, `TipoVenta`.
- Aplicacion: registrar lead, asignar lead, agendar cita, convertir lead, listar propiedades disponibles para comprador.
- BDD: escenarios de lead vendedor con contrato, lead comprador con propiedad disponible, reasignacion de asesor.
- HTTP: permisos por rol en endpoints de leads, citas, clientes y propiedades disponibles.
- Contract: DTOs de lead, cliente, propiedad disponible e historial.

## Decisiones cerradas

- Solo el admin puede reasignar leads.
- La compra de un lead comprador queda como actividad/historial comercial; por ahora no introduce una entidad transaccional propia.
- La firma de contrato de un lead vendedor pobla `idClientePropietario` en la propiedad asociada.
- Una propiedad comprada deja de mostrarse como disponible.
- Los estados de propiedad esperados son `BORRADOR`, `DISPONIBLE`, `RESERVADA`, `VENDIDA` y `ARCHIVADA`.
- WhatsApp crea captaciones pendientes de revision/deduplicacion, no leads directos.

## Preguntas abiertas

- Que datos minimos formalizan una propiedad de lead vendedor antes del contrato?
