import type { EstadisticasGlobales, ReporteGeneral } from '../../domain/models/ReporteGeneral';

export interface ReporteRepository {
	obtenerEstadisticasGlobales(): Promise<EstadisticasGlobales>;
	obtenerReporteGeneral(): Promise<ReporteGeneral>;
}
