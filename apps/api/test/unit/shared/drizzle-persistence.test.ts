import { describe, expect, test } from "bun:test";

import { type D1DatabaseLike } from "../../../src/lib/shared/infrastructure";

function crearDbMock(): D1DatabaseLike {
  return {
    prepare: () => ({
      bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }),
      first: async () => null,
      run: async () => ({ success: true }),
      all: async () => ({ results: [] }),
    }),
    exec: async () => undefined,
  };
}

describe("obtenerDb", () => {
  test("retorna instancia de drizzle", async () => {
    const db = crearDbMock();
    const { obtenerDb } = await import("../../../src/lib/shared/infrastructure/persistence/drizzle");

    const instancia = obtenerDb(db);

    expect(instancia).toBeDefined();
  });

  test("retorna la misma instancia en llamadas consecutivas", async () => {
    const db = crearDbMock();
    const { obtenerDb } = await import("../../../src/lib/shared/infrastructure/persistence/drizzle");

    const instancia1 = obtenerDb(db);
    const instancia2 = obtenerDb(db);

    expect(instancia1).toBe(instancia2);
  });
});
