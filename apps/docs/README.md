# ALVAS Docs

Portal de documentacion Starlight para arquitectura, dominio, referencias y API TypeDoc de ALVAS.

## Comandos

Ejecutar desde la raiz del monorepo:

```bash
bun run docs:dev
bun run docs:build
```

La referencia TypeDoc se genera como Markdown durante `docs:dev` y `docs:build` bajo:

```txt
apps/docs/src/content/docs/referencias/typedoc/api/ref/
apps/docs/src/content/docs/referencias/typedoc/web/ref/
```

Esas carpetas son artefactos generados y se ignoran en Git.
