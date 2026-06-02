import { describe, expect, it, vi } from 'vitest';
import { actualizarCita } from '$lib/ventas/application/use-cases/actualizarCita';
import { actualizarLead } from '$lib/ventas/application/use-cases/actualizarLead';
import { agendarCita } from '$lib/ventas/application/use-cases/agendarCita';
import { cancelarContrato } from '$lib/ventas/application/use-cases/cancelarContrato';
import { convertirLead } from '$lib/ventas/application/use-cases/convertirLead';
import { crearContrato } from '$lib/ventas/application/use-cases/crearContrato';
import { firmarContrato } from '$lib/ventas/application/use-cases/firmarContrato';
import { listarActividadLead } from '$lib/ventas/application/use-cases/listarActividadLead';
import { listarContratos } from '$lib/ventas/application/use-cases/listarContratos';
import { listarPipeline } from '$lib/ventas/application/use-cases/listarPipeline';
import { listarPropiedadesPorCliente } from '$lib/ventas/application/use-cases/listarPropiedadesPorCliente';
import { obtenerLead } from '$lib/ventas/application/use-cases/obtenerLead';
import { registrarLead } from '$lib/ventas/application/use-cases/registrarLead';
import type { VentasRepository } from '$lib/ventas/application/ports/VentasRepository';

function crearVentasRepositoryFake(): VentasRepository {
	return {
		listarPipeline: vi.fn().mockResolvedValue([
			{
				id: 'lead-1',
				nombre: 'Ana Vendedora',
				estado: 'NUEVO',
				tipo: 'VENTA',
				citasCount: 0,
				citas: []
			}
		]),
		obtenerLead: vi.fn().mockResolvedValue({
			id: 'lead-1',
			nombre: 'Ana Vendedora',
			email: 'ana@example.com',
			telefono: '3001234567',
			tipo: 'VENTA',
			estado: 'NUEVO',
			idAsesor: 'asesor-1',
			idCliente: null,
			idPropiedadInteres: null,
			citas: [],
			creadoEn: '2026-05-23T00:00:00.000Z',
			actualizadoEn: '2026-05-23T00:00:00.000Z'
		}),
		registrarLead: vi.fn().mockResolvedValue('lead-1'),
		actualizarLead: vi.fn().mockResolvedValue(undefined),
		convertirLead: vi.fn().mockResolvedValue('cliente-1'),
		agendarCita: vi.fn().mockResolvedValue(undefined),
		actualizarCita: vi.fn().mockResolvedValue(undefined),
		listarActividadLead: vi.fn().mockResolvedValue([]),
		crearContrato: vi.fn().mockResolvedValue({
			id: 'contrato-1',
			idLead: 'lead-1',
			idPropiedad: 'propiedad-1',
			fechaInicio: '2026-05-23T00:00:00.000Z',
			fechaFin: '2026-06-23T00:00:00.000Z',
			estado: 'BORRADOR',
			creadoEn: '2026-05-23T00:00:00.000Z',
			actualizadoEn: '2026-05-23T00:00:00.000Z'
		}),
		firmarContrato: vi.fn().mockResolvedValue(undefined),
		cancelarContrato: vi.fn().mockResolvedValue(undefined),
		listarContratos: vi.fn().mockResolvedValue([]),
		listarPropiedadesPorCliente: vi.fn().mockResolvedValue(['propiedad-1'])
	};
}

describe('ventas / application use cases', () => {
	it('lista el pipeline a traves del puerto de ventas', async () => {
		const repository = crearVentasRepositoryFake();

		const leads = await listarPipeline(repository);

		expect(repository.listarPipeline).toHaveBeenCalledOnce();
		expect(leads).toEqual([
			expect.objectContaining({
				id: 'lead-1',
				nombre: 'Ana Vendedora',
				tipo: 'VENTA'
			})
		]);
	});

	it('actualiza un lead delegando el cambio al repository', async () => {
		const repository = crearVentasRepositoryFake();

		await actualizarLead(repository, {
			idLead: 'lead-1',
			estado: 'CONTACTO'
		});

		expect(repository.actualizarLead).toHaveBeenCalledWith({
			idLead: 'lead-1',
			estado: 'CONTACTO'
		});
	});

	it('delega los comandos principales de ventas al puerto', async () => {
		const repository = crearVentasRepositoryFake();

		await expect(
			registrarLead(repository, {
				nombre: 'Ana Vendedora',
				email: 'ana@example.com',
				telefono: '3001234567',
				tipo: 'VENTA'
			})
		).resolves.toBe('lead-1');
		await agendarCita(repository, {
			idLead: 'lead-1',
			fechaInicio: '2026-05-23T14:00:00.000Z',
			duracionMinutos: 60
		});
		await actualizarCita(repository, {
			idLead: 'lead-1',
			idCita: 'cita-1',
			estado: 'REALIZADA'
		});
		await expect(convertirLead(repository, { idLead: 'lead-1' })).resolves.toBe('cliente-1');

		expect(repository.registrarLead).toHaveBeenCalledOnce();
		expect(repository.agendarCita).toHaveBeenCalledOnce();
		expect(repository.actualizarCita).toHaveBeenCalledOnce();
		expect(repository.convertirLead).toHaveBeenCalledOnce();
	});

	it('delega consultas y acciones de contratos al puerto', async () => {
		const repository = crearVentasRepositoryFake();

		await expect(obtenerLead(repository, 'lead-1')).resolves.toEqual(
			expect.objectContaining({ id: 'lead-1' })
		);
		await expect(listarActividadLead(repository, 'lead-1')).resolves.toEqual([]);
		await expect(
			crearContrato(repository, {
				idLead: 'lead-1',
				idPropiedad: 'propiedad-1',
				fechaInicio: '2026-05-23T00:00:00.000Z',
				fechaFin: '2026-06-23T00:00:00.000Z'
			})
		).resolves.toEqual(expect.objectContaining({ id: 'contrato-1' }));
		await firmarContrato(repository, 'contrato-1');
		await cancelarContrato(repository, 'contrato-1');
		await expect(listarContratos(repository)).resolves.toEqual([]);
		await expect(listarPropiedadesPorCliente(repository, 'lead-1')).resolves.toEqual([
			'propiedad-1'
		]);

		expect(repository.obtenerLead).toHaveBeenCalledWith('lead-1');
		expect(repository.listarActividadLead).toHaveBeenCalledWith('lead-1');
		expect(repository.crearContrato).toHaveBeenCalledOnce();
		expect(repository.firmarContrato).toHaveBeenCalledWith('contrato-1');
		expect(repository.cancelarContrato).toHaveBeenCalledWith('contrato-1');
		expect(repository.listarContratos).toHaveBeenCalledOnce();
		expect(repository.listarPropiedadesPorCliente).toHaveBeenCalledWith('lead-1');
	});
});
