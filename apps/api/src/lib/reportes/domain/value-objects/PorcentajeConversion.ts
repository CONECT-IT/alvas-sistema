import { ErrorDeValidacion } from "../../../shared/domain";

/** @group Value Objects */
export class PorcentajeConversion {
  private constructor(public readonly valorNumerico: number) {
    if (Number.isNaN(valorNumerico) || valorNumerico < 0) {
      throw new ErrorDeValidacion("PorcentajeConversion: valor invalido.");
    }
  }

  static desdeLeadsYClientes(totalClientes: number, totalLeads: number): PorcentajeConversion {
    const divisor = totalLeads <= 0 ? 1 : totalLeads;
    const bruto = (totalClientes / divisor) * 100;
    const redondeado = Math.round(bruto * 100) / 100;
    return new PorcentajeConversion(redondeado);
  }
}
