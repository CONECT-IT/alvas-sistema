import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain/errors/ErrorDeDominio";
import { ReporteGeneral, ResumenAcciones } from "../../domain";
import { type IConsultaVentasParaReportes } from "../../domain/ports/IConsultaVentasParaReportes";
import { type ReporteGeneralOutput } from "../dto/ReportesSalidaDTOs";
import { type IObtenerReporteGeneral } from "../ports/in";

/** @group Casos de Uso */
export class ObtenerReporteGeneralUseCase
  implements
    CasoDeUso<void, Resultado<ReporteGeneralOutput, ErrorDeDominio>>,
    IObtenerReporteGeneral
{
  constructor(private readonly consultaVentas: IConsultaVentasParaReportes) {}

  async ejecutar(): Promise<Resultado<ReporteGeneralOutput, ErrorDeDominio>> {
    try {
      const [acciones, actividadReciente] = await Promise.all([
        this.consultaVentas.contarAccionesPorTipo(),
        this.consultaVentas.obtenerActividadReciente(10),
      ]);

      const totalAcciones = acciones.reduce((acc, a) => acc + a.total, 0);
      const resumen = new ResumenAcciones(acciones, totalAcciones);

      const reporte = new ReporteGeneral(new Date(), resumen, actividadReciente);

      return resultadoExitoso({
        fechaGeneracion: reporte.fechaGeneracion,
        resumenAcciones: {
          acciones: reporte.resumenAcciones.acciones,
          totalAcciones: reporte.resumenAcciones.totalAcciones,
        },
        actividadReciente: reporte.actividadReciente,
      });
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}
