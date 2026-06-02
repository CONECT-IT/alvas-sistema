import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type EstadisticasGlobalesOutput } from "../../dto/ReportesSalidaDTOs";

/** @group Puertos de Entrada */
export interface IObtenerEstadisticasGlobales {
  ejecutar(): Promise<Resultado<EstadisticasGlobalesOutput, ErrorDeDominio>>;
}
