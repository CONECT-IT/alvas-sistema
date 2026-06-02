import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import LeadKanban from '$lib/ventas/presentation/LeadKanban.svelte';
import type { LeadPipeline } from '$lib/ventas/domain/models/LeadPipeline';

const leads: LeadPipeline[] = [
	{
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
				fechaInicio: '2026-05-23T14:00:00.000Z',
				fechaFin: '2026-05-23T15:00:00.000Z',
				estado: 'PENDIENTE'
			}
		]
	},
	{
		id: 'lead-2',
		nombre: 'Carlos Comprador',
		estado: 'CONTACTO',
		tipo: 'COMPRA',
		citasCount: 0,
		citas: []
	}
];

describe('ventas / presentation / LeadKanban', () => {
	it('agrupa leads por estado y muestra contexto comercial clave', () => {
		render(LeadKanban, { leads });

		expect(screen.getByRole('region', { name: 'Columna NUEVO' })).toBeInTheDocument();
		expect(screen.getByRole('region', { name: 'Columna CONTACTO' })).toBeInTheDocument();
		expect(screen.getByText('Ana Vendedora')).toBeInTheDocument();
		expect(screen.getByText('Carlos Comprador')).toBeInTheDocument();
		expect(screen.getByText('Asesor:')).toBeInTheDocument();
		expect(screen.getByText('Luis Asesor')).toBeInTheDocument();
		expect(screen.getByText('1 cita')).toBeInTheDocument();
	});

	it('notifica la seleccion de un lead sin perder la lista', async () => {
		const onLeadClick = vi.fn();
		render(LeadKanban, { leads, onLeadClick });

		await fireEvent.click(screen.getByText('Ana Vendedora'));

		expect(onLeadClick).toHaveBeenCalledWith(leads[0]);
		expect(screen.getByText('Carlos Comprador')).toBeInTheDocument();
	});
});
