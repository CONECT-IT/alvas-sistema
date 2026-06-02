# Referencia TypeDoc en Starlight

La referencia tecnica de codigo se genera como Markdown dentro de Starlight con `starlight-typedoc` y `typedoc-plugin-markdown`.

## Generar referencia

```bash
bun run docs:build
```

La salida queda en:

```txt
apps/docs/src/content/docs/referencias/typedoc/
  api/ref/
  web/ref/
```

`api/` y `web/` tienen paginas landing manuales. La referencia generada vive debajo de `ref/` para que cada seccion conserve su propio sidebar en Starlight.

La configuracion principal vive en `apps/docs/astro.config.mjs`. Los archivos `typedoc.api.json` y `typedoc.web.json` se mantienen alineados como referencia para ejecuciones directas de TypeDoc.

- `typedoc.api.json`
- `typedoc.web.json`

## Criterio

TypeDoc documenta la referencia tecnica exhaustiva. La documentacion conceptual de arquitectura, DDD, lenguaje ubicuo, flujos y decisiones permanece como Markdown manual en Starlight y en `docs/`.

La referencia TypeDoc mantiene el `README.md` raiz como introduccion. Los documentos narrativos bajo `docs/` deben vivir en el arbol normal de Starlight para conservar sidebar, rutas y frontmatter controlados por la app de docs.

La salida Markdown usa `router: "kind"` y tablas para indices, parametros y propiedades. Esto prioriza un arbol por tipos como clases, interfaces, enums y aliases, en vez de una lista plana con cada funcion o variable como pagina propia.

Las funciones y variables sin JSDoc se excluyen de la referencia para evitar ruido. Para publicar una funcion o constante concreta en TypeDoc, agrega un comentario JSDoc encima de su export.

## Warnings esperados

TypeDoc documenta principalmente simbolos exportados. Si un simbolo publico referencia tipos internos no exportados, puede mostrar warnings como `is referenced ... but not included in the documentation`.

En ALVAS esto puede aparecer con props privadas de entidades, tipos internos de controllers o bindings de infraestructura. No bloquea la generacion HTML. Si un tipo interno debe formar parte del contrato publico del modulo, se debe exportar desde el barrel correspondiente del bounded context.
