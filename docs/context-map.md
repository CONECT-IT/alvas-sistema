# Context Map — ALVAS

## Bounded Contexts

| Contexto        | Lenguaje ubicuo                                            | Aggregate Root(s)       |
| --------------- | ---------------------------------------------------------- | ----------------------- |
| `auth`          | sesion, token, refresh, credenciales                       | Sesion                  |
| `usuarios`      | usuario, asesor, admin, username, rol, estado              | Usuario                 |
| `propiedades`   | propiedad, catalogo, origen, estado, BORRADOR, DISPONIBLE  | Propiedad               |
| `ventas`        | lead, cita, cliente, contrato, pipeline, conversion        | Lead, Cliente, Contrato |
| `integraciones` | captacion, WhatsApp, webhook, normalizacion, deduplicacion | Captacion               |
| `reportes`      | metrica, dashboard, estadistica, rendimiento, conversion   | (lectura)               |

## Relaciones

### `auth` `<<cliente>>` `usuarios`

- **Patron:** ACL (Anti-Corruption Layer)
- **Consumer:** `auth` define `IConsultaCredencialesUsuario` e `IVerificadorDeClave`
- **Provider:** `usuarios` implementa `ConsultaCredencialesUsuarioAdapter` y `VerificadorDeClavePbkdf2Adapter`
- **Justificacion:** `auth` necesita validar credenciales sin conocer el modelo de usuario interno. La ACL traduce entre el modelo de persistencia de `usuarios` y el contrato que `auth` entiende.
- **Autonomia:** `usuarios` puede cambiar su esquema interno sin afectar `auth` mientras cumpla el contrato.

### `ventas` `<<cliente>>` `propiedades`

- **Patron:** ACL (Anti-Corruption Layer)
- **Consumer:** `ventas` define `IConsultaPropiedadInteres`, `IRegistroPropiedadVendedor`, `IRegistroPropiedadCliente`
- **Provider:** `propiedades` implementa `ConsultaPropiedadInteresVentasAdapter`, `RegistroPropiedadVendedorAdapter`, `RegistroPropiedadClienteAdapter`
- **Justificacion:** `ventas` necesita consultar disponibilidad de propiedades y registrar propiedades desde leads sin acoplarse al catalogo interno de `propiedades`.
- **Autonomia:** `propiedades` puede evolucionar su modelo de inventario independientemente.

### `ventas` `<<cliente>>` `usuarios`

- **Patron:** ACL (Anti-Corruption Layer) interno
- **Consumer:** `ventas` define `IConsultaNombreAsesor`
- **Provider:** `ventas/infrastructure` implementa `ConsultaNombreAsesorAdapter` que usa `IUsuarioRepository` de `usuarios`
- **Justificacion:** `ventas` necesita mostrar el nombre del asesor en el pipeline sin exponer todo el modelo de usuarios.
- **Autonomia:** el adapter vive en infraestructura de `ventas`, no hay contaminacion del dominio de `ventas`.

### `reportes` `<<cliente>>` `ventas`

- **Patron:** ACL de lectura
- **Consumer:** `reportes` define `IConsultaVentasParaReportes`
- **Provider:** `ventas` implementa `ConsultaVentasParaReportesAdapter`
- **Justificacion:** `reportes` solo necesita consultas de solo lectura sobre datos comerciales. La ACL evita que `reportes` escriba o se acople al modelo de `ventas`.
- **Autonomia:** `ventas` puede cachear, agregar o materializar vistas sin afectar `reportes`.

### `integraciones` `<<cliente>>` `ventas`

- **Patron:** ACL (Anti-Corruption Layer)
- **Consumer:** `integraciones` define `IRegistroLeadCaptacion`
- **Provider:** `ventas` implementa `RegistroLeadCaptacionVentasAdapter`
- **Justificacion:** `integraciones` normaliza captaciones entrantes y delega el alta comercial a `ventas` sin conocer el ciclo de vida interno de leads.
- **Autonomia:** `ventas` puede cambiar reglas de creacion de leads sin afectar `integraciones`.

### `integraciones` `<<cliente>>` `propiedades`

- **Patron:** ACL (Anti-Corruption Layer)
- **Consumer:** `integraciones` define `IRegistroPropiedadCaptacion`
- **Provider:** `propiedades` implementa `RegistroPropiedadCaptacionAdapter`
- **Justificacion:** `integraciones` necesita registrar propiedades preliminares desde captaciones sin acoplarse al repositorio de `propiedades`.
- **Autonomia:** `propiedades` controla su logica de creacion de propiedades independientemente.

## Resumen grafico

```
  usuarios ──ACL──▶ auth
      │
      ├──ACL──▶ ventas
      │
      └──ACL──▶ reportes

  propiedades ──ACL──▶ ventas
      │
      └──ACL──▶ integraciones

  ventas ──ACL──▶ reportes
      │
      └──ACL──▶ integraciones
```

> Todas las relaciones usan ACL porque cada contexto necesita autonomia evolutiva. No hay relaciones de conformidad, shared kernel ni OHS porque no hay contexto que domine semanticamente sobre otro: cada contexto define su propio lenguaje ubicuo y los demas se adaptan via traductores.
