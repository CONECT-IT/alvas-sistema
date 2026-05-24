# Spec: Propiedades e inventario comercial

## Contexto

ALVAS comercializa propiedades propias y propiedades de clientes vendedores. Una propiedad puede nacer como `BORRADOR` desde un lead vendedor, pero solo debe ser visible para compradores cuando la regla comercial la marque como disponible.

Esta spec define el comportamiento esperado del contexto `propiedades` y su relacion con `ventas`.

## Lenguaje ubicuo

- `Propiedad propia`: propiedad de ALVAS, administrada por admin.
- `Propiedad borrador`: propiedad registrada durante la captacion de un lead vendedor; aun no esta disponible para compradores.
- `Propiedad disponible`: propiedad lista para ser ofrecida a leads compradores.
- `Propiedad reservada`: propiedad temporalmente apartada por una operacion en curso.
- `Propiedad vendida`: propiedad que ya no debe mostrarse como disponible.
- `Propiedad archivada`: propiedad retirada del inventario activo sin borrar historial.
- `Cliente vendedor`: cliente formal que autoriza a ALVAS a vender una o varias propiedades.
- `Asesor responsable`: asesor que gestiona la relacion comercial de la propiedad.
- `Lead origen`: lead vendedor desde el que se registro inicialmente la propiedad.

## Reglas de negocio

- Un admin puede crear, editar y eliminar cualquier propiedad.
- Un asesor puede crear propiedades relacionadas con sus leads vendedores o clientes propios.
- Un asesor no puede editar propiedades relacionadas con leads o clientes ajenos.
- Una propiedad en estado `BORRADOR` no aparece en catalogos para leads compradores.
- Una propiedad disponible puede mostrarse a leads compradores si pertenece a ALVAS o a un cliente vendedor habilitado.
- La transicion de `BORRADOR` a `DISPONIBLE` debe conservar el `lead origen`, el cliente propietario cuando exista y el asesor responsable.
- Los estados de negocio esperados son `BORRADOR`, `DISPONIBLE`, `RESERVADA`, `VENDIDA` y `ARCHIVADA`.
- Los estados legados `PRELIMINAR`, `EN_VALIDACION`, `DESCARTADA` e `INACTIVA` no pertenecen al lenguaje ubicuo vigente y deben normalizarse por migracion de datos.
- Una propiedad `VENDIDA` o `ARCHIVADA` no aparece en catalogos comerciales activos.
- El precio no puede ser negativo.
- El titulo debe ser claro y no vacio.
- El historial comercial debe permitir conocer desde que lead o cliente nacio la propiedad.

## Criterios de aceptacion

- Dado un asesor con un lead vendedor asignado, cuando registra una propiedad, queda como `BORRADOR`.
- Dado un asesor sin relacion con una propiedad, cuando intenta editarla, el sistema responde sin permisos.
- Dado un admin, puede actualizar estado, precio y datos comerciales de cualquier propiedad.
- Dado un lead comprador, solo ve propiedades `DISPONIBLE`, no propiedades `BORRADOR`.
- Dado una propiedad de cliente vendedor, conserva referencia al cliente y al lead origen cuando existan.
- Dado un contrato firmado desde lead vendedor, la propiedad asociada queda vinculada al cliente vendedor mediante `idClientePropietario`.
- Dado una propiedad vendida o archivada, no aparece en catalogos comerciales activos.

## Trazabilidad sugerida

- Dominio: `Propiedad`, estados de propiedad, origen de propiedad.
- Aplicacion: crear propiedad, actualizar propiedad, listar propiedades, eliminar propiedad.
- HTTP: `GET /propiedades`, `POST /propiedades`, `PUT /propiedades/:id`, `DELETE /propiedades/:id`.
- Contract: DTO publico de propiedad sin campos internos.
- Web: catalogo, tabla de propiedades, filtros por estado, SidePanel de edicion.
- E2E: admin gestiona propiedad; asesor edita propiedad relacionada; comprador solo ve disponibles.

## Preguntas abiertas

- Quien aprueba que una propiedad `BORRADOR` pase a `DISPONIBLE`: admin, asesor responsable o contrato vigente?
- Una propiedad puede tener mas de un asesor responsable historico?
- El comprador ve propiedades reservadas o solo disponibles?
