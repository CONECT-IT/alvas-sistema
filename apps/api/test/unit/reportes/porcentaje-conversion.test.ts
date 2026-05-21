import { describe, expect, test } from "bun:test";

import { PorcentajeConversion } from "../../../src/lib/reportes/domain/value-objects/PorcentajeConversion";

describe("reportes / PorcentajeConversion", () => {
  test("calcula porcentaje derivado y evita divisiones por cero", () => {
    expect(PorcentajeConversion.desdeLeadsYClientes(3, 12).valorNumerico).toBe(25);
    expect(PorcentajeConversion.desdeLeadsYClientes(2, 0).valorNumerico).toBe(200);
  });

  test("rechaza valor invalido con mensaje exacto", () => {
    expect(
      () => new (PorcentajeConversion as unknown as { new (x: number): PorcentajeConversion })(-1),
    ).toThrow("PorcentajeConversion: valor invalido.");
  });
});
