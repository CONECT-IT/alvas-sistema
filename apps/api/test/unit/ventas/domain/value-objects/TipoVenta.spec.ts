import { describe, expect, test } from "bun:test";
import {
  TipoVenta,
  TIPOS_VENTA,
} from "../../../../../src/lib/ventas/domain/value-objects/TipoVenta";
import { ErrorDeDominio } from "../../../../../src/lib/shared/domain";

describe("ventas / domain / TipoVenta", () => {
  test("Debe crear tipos validos via factory desde(), normalizando mayusculas y espacios", () => {
    for (const valor of TIPOS_VENTA) {
      expect(TipoVenta.desde(valor.toLowerCase()).valor).toBe(valor);
      expect(TipoVenta.desde(`  ${valor}  `).valor).toBe(valor);
    }
  });

  test("Debe crear instancias con factory methods estaticos", () => {
    expect(TipoVenta.compra().valor).toBe("COMPRA");
    expect(TipoVenta.venta().valor).toBe("VENTA");
    expect(TipoVenta.compra().esCompra()).toBe(true);
    expect(TipoVenta.venta().esVenta()).toBe(true);
  });

  test("Debe lanzar ErrorDeDominio si el tipo es invalido", () => {
    expect(() => {
      TipoVenta.desde("PRESTAMO");
    }).toThrow(ErrorDeDominio);
    expect(() => {
      TipoVenta.desde(" VENTA FUTURA ");
    }).toThrow("Tipo de venta inválido:  VENTA FUTURA ");
  });

  test("Debe identificar compra y venta sin ambiguedad", () => {
    const compra = TipoVenta.compra();
    const venta = TipoVenta.venta();

    expect(compra.esCompra()).toBe(true);
    expect(compra.esVenta()).toBe(false);
    expect(venta.esCompra()).toBe(false);
    expect(venta.esVenta()).toBe(true);
  });
});
