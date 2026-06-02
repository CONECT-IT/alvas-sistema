# Referencia TypeDoc

La referencia tecnica de codigo se genera con TypeDoc como HTML standalone.

## Generar referencia completa

```bash
bun run docs:typedoc
```

La salida queda en:

```txt
docs/typedoc/
  api/
  web/
```

`docs/typedoc/` es un artefacto generado y no se versiona. La configuracion versionada vive en:

- `typedoc.api.json`
- `typedoc.web.json`

## Criterio

TypeDoc documenta la referencia tecnica exhaustiva. La documentacion conceptual de arquitectura, DDD, lenguaje ubicuo, flujos y decisiones permanece como Markdown manual en `docs/`.

## Warnings esperados

TypeDoc documenta principalmente simbolos exportados. Si un simbolo publico referencia tipos internos no exportados, puede mostrar warnings como `is referenced ... but not included in the documentation`.

En ALVAS esto puede aparecer con props privadas de entidades, tipos internos de controllers o bindings de infraestructura. No bloquea la generacion HTML. Si un tipo interno debe formar parte del contrato publico del modulo, se debe exportar desde el barrel correspondiente del bounded context.
