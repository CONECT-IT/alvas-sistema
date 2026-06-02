---
title: TypeDoc
description: Referencia técnica exhaustiva del código TypeScript de ALVAS
---

TypeDoc genera Markdown para que Starlight lo publique como páginas nativas del portal.

Generar:

```bash
bun run docs:build
```

Páginas principales servidas por Starlight:

- [API](/referencias/typedoc/api/)
- [Web](/referencias/typedoc/web/)

La generación ocurre dentro de la integración `starlight-typedoc`, durante `astro dev` y `astro build`.
