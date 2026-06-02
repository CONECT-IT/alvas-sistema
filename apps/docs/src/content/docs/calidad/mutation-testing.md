---
title: "Mutation Testing"
description: "Mutation Testing"
sidebar:
  order: 1
---

# Mutation Testing

Mutation testing valida la calidad de la suite de pruebas inyectando defectos pequenos en el codigo de produccion y verificando si los tests fallan. Una suite puede tener alta cobertura de lineas y aun asi ser debil si sus aserciones no detectan esos defectos.

## Comandos

```bash
bun install
bun run test:mutation:dry-run
bun run test:mutation
```

Usa primero `bun run test:mutation:dry-run`. Ese comando confirma que Stryker puede copiar el proyecto a su sandbox y ejecutar los tests configurados con Bun sin crear mutantes.

## Alcance

La configuracion de Stryker muta codigo de negocio bajo:

- `apps/api/src/lib/*/domain/**/*.ts`
- `apps/api/src/lib/*/application/use-cases/**/*.ts`

Excluye tests, DTOs, puertos e `index.ts`. El objetivo es evaluar aserciones sobre comportamiento de dominio y casos de uso, no codigo de pegado de frameworks.

## Quality gate

El umbral de quiebre configurado es 70%:

```js
thresholds: {
  high: 80,
  low: 70,
  break: 70,
}
```

Justificacion S07/S08: el 70% obliga a que las pruebas detecten defectos de negocio relevantes sin exigir un 100% artificial. La corrida ampliada sobre `domain` y `application/use-cases` registro un baseline de 59.40%; por eso el pipeline debe fallar hasta que se agreguen asserts para matar mutantes sobrevivientes en casos de uso y value objects.

## Stryker Dashboard

El proyecto esta preparado para publicar en Stryker Dashboard cuando exista el secret `STRYKER_DASHBOARD_API_KEY` en GitHub Actions.

Configuracion aplicada:

- Reporter `dashboard` habilitado solo cuando `STRYKER_DASHBOARD_API_KEY` existe.
- Proyecto: `github.com/softwarelazana-ui/alvas-sistema`.
- Version: rama o tag detectado por GitHub Actions.
- Tipo de reporte: `full`.

Pasos para activar el badge:

1. Entrar a https://dashboard.stryker-mutator.io con GitHub.
2. Habilitar el repositorio `softwarelazana-ui/alvas-sistema`.
3. Copiar la API key generada.
4. Crear el secret `STRYKER_DASHBOARD_API_KEY` en GitHub.
5. Ejecutar el workflow en `develop`.

## Como leer resultados

- `Killed`: al menos un test fallo despues de que Stryker inyecto el defecto. Es el resultado deseado.
- `Survived`: todos los tests pasaron despues del defecto. Normalmente significa que los tests ejecutan el codigo, pero no validan el comportamiento con suficiente precision.
- `No Coverage`: el codigo mutado no fue ejecutado por el comando de tests configurado.
- `Timeout`: la mutacion probablemente genero una ruta lenta o infinita.
- `Equivalent`: la mutacion cambio la sintaxis, pero no el comportamiento observable. Estos casos requieren revision manual y documentacion.

## Ciclo de revision

1. Ejecuta `bun run test:mutation`.
2. Abre `reports/mutation/index.html`.
3. Empieza por mutantes `Survived` y `No Coverage` en objetos de dominio y casos de uso.
4. Agrega o endurece tests sobre limites de negocio, estados invalidos y valores esperados.
5. Ejecuta mutation testing otra vez y compara el mutation score.

No persigas 100% a ciegas. Trata los mutantes sobrevivientes como evidencia para inspeccionar. Algunos son brechas reales; otros pueden ser mutantes equivalentes o ramas intencionalmente poco relevantes.
