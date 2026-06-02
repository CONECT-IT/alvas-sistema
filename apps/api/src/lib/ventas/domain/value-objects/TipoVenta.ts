import { ErrorDeValidacion } from "../../../shared/domain";

export const TIPOS_VENTA = ["COMPRA", "VENTA"] as const;
export type ValorTipoVenta = (typeof TIPOS_VENTA)[number];

/** @group Value Objects */
export class TipoVenta {
  private readonly valorInterno: ValorTipoVenta;

  private constructor(valor: ValorTipoVenta) {
    this.valorInterno = valor;
  }

  static compra(): TipoVenta {
    return new TipoVenta("COMPRA");
  }

  static venta(): TipoVenta {
    return new TipoVenta("VENTA");
  }

  static desde(valor: string): TipoVenta {
    const valorNormalizado = valor.trim().toUpperCase();
    if (!TIPOS_VENTA.includes(valorNormalizado as ValorTipoVenta)) {
      throw new ErrorDeValidacion(`Tipo de venta inválido: ${valor}`);
    }
    return new TipoVenta(valorNormalizado as ValorTipoVenta);
  }

  get valor(): ValorTipoVenta {
    return this.valorInterno;
  }

  esCompra(): boolean {
    return this.valorInterno === "COMPRA";
  }

  esVenta(): boolean {
    return this.valorInterno === "VENTA";
  }
}
