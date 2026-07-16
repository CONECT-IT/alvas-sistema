import { describe, expect, test } from "bun:test";

describe("obtenerDb", () => {
  test("retorna instancia de drizzle", async () => {
    const { obtenerDb } =
      await import("../../../src/lib/shared/infrastructure/persistence/drizzle");

    const instancia = obtenerDb();

    expect(instancia).toBeDefined();
  });

  test("retorna la misma instancia en llamadas consecutivas", async () => {
    const { obtenerDb } =
      await import("../../../src/lib/shared/infrastructure/persistence/drizzle");

    const instancia1 = obtenerDb();
    const instancia2 = obtenerDb();

    expect(instancia1).toBe(instancia2);
  });
});
