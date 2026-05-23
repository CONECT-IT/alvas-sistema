# Spec: Experiencia web y sistema de diseno

## Contexto

La web de ALVAS es una vista operativa sobre la API. Debe permitir trabajo diario de admins y asesores con baja friccion, buena densidad de informacion y una identidad visual propia. La UI no debe ser un formulario como primera impresion de cada seccion; primero debe mostrar informacion accionable y dejar la creacion como accion disponible.

## Principios UX

- La primera vista de una seccion muestra informacion existente, filtros y acciones relevantes.
- Los formularios aparecen como accion secundaria: boton, side panel, modal o flujo dedicado.
- Admin y asesor ven pantallas adaptadas a sus permisos y tareas frecuentes.
- La navegacion debe aprovechar el espacio y evitar barras redundantes.
- Iconos, texto y estados visuales deben comunicar accion sin depender de explicaciones largas.
- El sistema debe mantener consistencia de tema, espaciado, bordes, tipografia y tokens.

## Navegacion

- El sidebar puede evolucionar hacia una barra vertical liviana, inspirada en navegadores tipo Arc.
- Cada seccion debe tener icono y estado activo claro.
- La barra puede usar fondo transparente y efectos de blur/color por item, siempre que no reduzca legibilidad.
- El hover puede enfatizar fuente, icono y glow/blur del item.
- La navegacion superior debe integrarse o reducirse si duplica acciones del sidebar.

## Secciones operativas

### Leads

- Vista inicial: tabla, kanban o lista filtrable de leads disponibles para el rol.
- Acciones visibles: crear lead, filtrar, buscar, cambiar vista, abrir detalle.
- El detalle debe mostrar historial, citas, asesor asignado, estado y acciones permitidas.
- La edicion debe ocurrir en side panel o pantalla de detalle, no reemplazar la lista principal sin contexto.

### Propiedades

- Vista inicial: catalogo operativo con estado, propietario/origen, disponibilidad y asesor relacionado cuando aplique.
- Debe distinguir propiedad propia de ALVAS, propiedad de cliente vendedor y propiedad en captacion aun no disponible.
- Un lead comprador solo debe ver propiedades comercialmente disponibles.

### Usuarios

- Admin ve lista de usuarios con rol, estado y acciones.
- Asesor ve su perfil editable con campos permitidos.
- Campos sensibles o administrativos no deben mostrarse como editables a asesores.

### Reportes

- Vista inicial: indicadores de rendimiento, conversiones, carga por asesor y actividad comercial.
- Reportes deben ayudar a detectar cuellos de botella del sistema comercial, no solo mostrar conteos.

## Sistema de diseno

- Los tokens deben vivir en archivos dedicados, no hardcodeados en componentes aislados.
- Colores de marca se respetan, pero pueden combinarse con acentos, gradientes o efectos cuando aporten jerarquia real.
- Tipografia, espaciado, radios y sombras deben tener escala definida.
- Los componentes atomicos deben ser reutilizables: botones, inputs, badges, tabs, side panels, tablas, cards de entidad y estados vacios.
- Los iconos deben venir de una libreria consistente o de un set propio organizado.
- Los efectos visuales no deben tapar informacion ni reducir contraste.

## Criterios de aceptacion

- Dado un admin que entra a Leads, ve informacion y filtros antes que un formulario.
- Dado un asesor que entra a Leads, ve solo sus leads y puede abrir detalle sin perder la lista.
- Dado un cambio de tema, dark mode persiste entre paginas y recargas.
- Dado un item activo del sidebar, su estado es visible por color, icono o efecto sin depender solo de texto.
- Dado una pantalla de propiedades, queda claro si una propiedad es propia, de cliente vendedor o no disponible todavia.
- Dado un asesor en perfil propio, no puede editar rol ni estado.

## Trazabilidad sugerida

- Component tests: sidebar, tokens, tema, tabla/lista de leads, side panel.
- E2E: dark mode persistente, navegacion por rol, detalle de lead, edicion de usuario propio, proteccion de rutas.
- Contract tests: DTOs de lead, usuario, propiedad y permisos visibles para UI.

## Preguntas abiertas

- Cuales son los colores de marca definitivos y cuales pueden ser acentos secundarios?
- La vista principal de leads debe ser kanban, tabla o selector entre ambas?
- Que libreria de iconos queda como estandar?
- Que informacion necesita ver un asesor en los primeros 5 segundos de cada seccion?
