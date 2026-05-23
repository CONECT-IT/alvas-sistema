import { describe, expect, it, vi } from 'vitest';
import { obtenerReportes } from './obtenerReportes';
import type { ReporteRepository } from '../ports/ReporteRepository';

describe('reportes / application use cases', () => {
	it('consulta estadisticas y reporte general en paralelo desde el puerto', async () => {
		const repository: ReporteRepository = {
			obtenerEstadisticasGlobales: vi.fn().mockResolvedValue({
				totalLeads: 10,
				totalClientes: 4,
				leadsPorEstado: { NUEVO: 3 },
				asesoresActivos: 2
			}),
			obtenerReporteGeneral: vi.fn().mockResolvedValue({
				fechaGeneracion: '2026-05-23T00:00:00.000Z',
				metricas: {
					conversionRate: 40,
					leadsNuevosHoy: 2,
					citasPendientes: 1
				},
				actividadReciente: []
			})
		};

		await expect(obtenerReportes(repository)).resolves.toEqual({
			estadisticas: expect.objectContaining({ totalLeads: 10 }),
			reporte: expect.objectContaining({
				metricas: expect.objectContaining({ conversionRate: 40 })
			})
		});

		expect(repository.obtenerEstadisticasGlobales).toHaveBeenCalledOnce();
		expect(repository.obtenerReporteGeneral).toHaveBeenCalledOnce();
	});
});
