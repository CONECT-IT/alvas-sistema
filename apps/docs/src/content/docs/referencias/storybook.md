---
title: Storybook
description: Documentación visual e interactiva de componentes UI de ALVAS
---

Storybook documenta los componentes visuales e interactivos de `apps/web`.

## Deploy

El Storybook se despliega junto con la documentación:

- **Producción**: [Storybook estático](../../storybook/)
- **Local**: `bun run --cwd apps/web storybook`

## Componentes documentados

| Componente          | Descripción                                         |
| ------------------- | --------------------------------------------------- |
| `Button`            | Botones con variantes primary, secondary y disabled |
| `TextInput`         | Input de texto estándar                             |
| `FloatingTextInput` | Input con label flotante                            |
| `Textarea`          | Área de texto multilínea                            |
| `Select`            | Selector desplegable                                |
| `Checkbox`          | Checkbox con label                                  |
| `Toggle`            | Toggle switch                                       |
| `Badge`             | Etiqueta de estado                                  |
| `Card`              | Tarjeta de contenido                                |
| `Modal`             | Ventana modal                                       |
| `ConfirmDialog`     | Diálogo de confirmación                             |
| `SidePanel`         | Panel lateral deslizable                            |
| `NavigationShell`   | Shell de navegación interna                         |
| `AlvasLogo`         | Logo de ALVAS                                       |
| `AppShell`          | Layout principal de la app                          |

## Diseño

Los tokens de diseño (colores, tipografía, radios, sombras) están definidos en `tokens.css`.

## Ejecutar localmente

```bash
bun run storybook              # desde la raíz
bun run --cwd apps/web storybook  # desde apps/web
```

Build estático para producción:

```bash
bun run --cwd apps/web build:storybook
```
