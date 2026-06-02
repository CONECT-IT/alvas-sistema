import { describe, expect, it } from 'vitest';
import { mapLeadPipelineFromDto } from '$lib/ventas/infrastructure/VentasMapper';

describe('ventas / infrastructure / VentasMapper', () => {
	it('mapea un lead de pipeline desde el DTO de la API hacia el modelo de la web', () => {
		const lead = mapLeadPipelineFromDto({
			id: 'lead-1',
			nombre: 'Ana Vendedora',
			estado: 'NUEVO',
			tipo: 'VENTA',
			idAsesor: 'asesor-1',
			nombreAsesor: 'Luis Asesor',
			citasCount: 1,
			citas: [
				{
					id: 'cita-1',
					idLead: 'lead-1',
					idPropiedad: 'propiedad-1',
					fechaInicio: '2026-05-23T14:00:00.000Z',
					fechaFin: '2026-05-23T15:00:00.000Z',
					estado: 'PENDIENTE',
					observacion: 'Visita inicial'
				}
			]
		});

		expect(lead).toEqual({
			id: 'lead-1',
			nombre: 'Ana Vendedora',
			estado: 'NUEVO',
			tipo: 'VENTA',
			idAsesor: 'asesor-1',
			nombreAsesor: 'Luis Asesor',
			citasCount: 1,
			citas: [
				{
					id: 'cita-1',
					idLead: 'lead-1',
					idPropiedad: 'propiedad-1',
					fechaInicio: '2026-05-23T14:00:00.000Z',
					fechaFin: '2026-05-23T15:00:00.000Z',
					estado: 'PENDIENTE',
					observacion: 'Visita inicial'
				}
			]
		});
	});

	it('normaliza citas ausentes como una lista vacia para proteger los componentes', () => {
		const lead = mapLeadPipelineFromDto({
			id: 'lead-2',
			nombre: 'Carlos Comprador',
			estado: 'CONTACTO',
			tipo: 'COMPRA',
			citasCount: 0
		});

		expect(lead.citas).toEqual([]);
	});
});
