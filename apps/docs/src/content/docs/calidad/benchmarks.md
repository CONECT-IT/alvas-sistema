---
title: Benchmarks y smoke tests
description: Criterios para k6 y Lighthouse en CI.
---

# Benchmarks y smoke tests

ALVAS ejecuta pruebas externas de rendimiento en el workflow `External Benchmarks`.
Estas pruebas no reemplazan los tests unitarios, BDD, contract ni mutation testing:
validan que el sistema responda con latencias razonables en un entorno automatizado.

## k6 API smoke

El script `apps/api/test/benchmark/k6/api-smoke.js` es un smoke test de API:

- levanta la API local con Wrangler;
- aplica migraciones y seed local;
- autentica con el usuario semilla `admin/admin123`;
- recorre rutas criticas de ventas, propiedades, usuarios, integraciones y reportes;
- guarda el resultado JSON como artifact `k6-results`.

No es una prueba de capacidad real. Usa pocos usuarios virtuales y una duracion corta para
detectar regresiones basicas sin volver inestable el CI.

## Benchmark real de API

Un benchmark real debe ejecutarse de forma programada o manual, no como gate obligatorio de
cada pull request. Para que sea confiable necesita:

- datos sembrados y versionados;
- escenario separado por caso de uso;
- ramp-up y ramp-down;
- duracion suficiente para medir percentiles;
- thresholds por endpoint, no solo globales;
- entorno aislado de staging o local reproducible.

El smoke actual es la base para esos escenarios, pero no debe interpretarse como limite de
capacidad productiva.

## Lighthouse web

Lighthouse se ejecuta contra la build de SvelteKit servida con Wrangler Pages local.
Audita:

- `/login`;
- `/admin/leads`.

Los umbrales actuales son warnings para evitar que el benchmark bloquee despliegues por ruido
del runner. Los reportes HTML/JSON quedan como artifact `lighthouse-reports`.

## Comandos locales

```bash
bun run --cwd apps/web build
bun run --cwd apps/web test:benchmark:lighthouse
```

Para k6 local se requiere tener k6 instalado y levantar la API:

```bash
bun run db:migrate:local
bun run seed:local
bun run --cwd apps/api dev --port 3000
k6 run --env API_URL=http://127.0.0.1:3000 apps/api/test/benchmark/k6/api-smoke.js
```
