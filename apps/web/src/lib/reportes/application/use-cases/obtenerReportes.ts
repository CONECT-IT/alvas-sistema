import type { ReporteRepository } from '../ports/ReporteRepository';

export async function obtenerReportes(repository: ReporteRepository) {
	const [estadisticas, reporte] = await Promise.all([
		repository.obtenerEstadisticasGlobales(),
		repository.obtenerReporteGeneral()
	]);

	return { estadisticas, reporte };
}
