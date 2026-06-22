import { describe, expect, test } from "bun:test";

import { UuidGeneradorId } from "../../../src/lib/shared/infrastructure/security/UuidGeneradorId";

describe("UuidGeneradorId", () => {
  test("genera un UUID válido v4", () => {
    const generador = new UuidGeneradorId();
    const id = generador.generar();

    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  test("genera UUIDs únicos", () => {
    const generador = new UuidGeneradorId();
    const ids = new Set(Array.from({ length: 100 }, () => generador.generar()));

    expect(ids.size).toBe(100);
  });

  test("genera UUIDs con longitud correcta", () => {
    const generador = new UuidGeneradorId();
    const id = generador.generar();

    expect(id).toHaveLength(36);
  });
});
