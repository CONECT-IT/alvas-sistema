import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain/errors/ErrorDeDominio";
import { ResumenAcciones } from "../../domain";
import { type IConsultaVentasParaReportes } from "../../domain/ports/IConsultaVentasParaReportes";
import { type EstadisticasGlobalesOutput } from "../dto/ReportesSalidaDTOs";
import { type IObtenerEstadisticasGlobales } from "../ports/in";

/** @group Casos de Uso */
export class ObtenerEstadisticasGlobalesUseCase
  implements
    CasoDeUso<void, Resultado<EstadisticasGlobalesOutput, ErrorDeDominio>>,
    IObtenerEstadisticasGlobales
{
  constructor(private readonly consultaVentas: IConsultaVentasParaReportes) {}

  async ejecutar(): Promise<Resultado<EstadisticasGlobalesOutput, ErrorDeDominio>> {
    try {
      const acciones = await this.consultaVentas.contarAccionesPorTipo();
      const totalAcciones = acciones.reduce((acc, a) => acc + a.total, 0);
      const resumen = new ResumenAcciones(acciones, totalAcciones);

      return resultadoExitoso({
        acciones: resumen.acciones,
        totalAcciones: resumen.totalAcciones,
      });
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}
