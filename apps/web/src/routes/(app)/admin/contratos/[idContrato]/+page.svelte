<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import { httpClient, HttpError } from '$lib/shared/http/httpClient';
	import { firmarContrato } from '$lib/ventas/application/use-cases/firmarContrato';
	import { cancelarContrato } from '$lib/ventas/application/use-cases/cancelarContrato';
	import { ventasRepository } from '$lib/ventas/infrastructure/ventasRepository';

	type ContratoDetalle = {
		id: string;
		idLead?: string;
		idCliente?: string;
		idPropiedad: string;
		fechaInicio: string;
		fechaFin: string;
		estado: string;
		creadoEn: string;
		actualizadoEn: string;
	};

	let contrato = $state<ContratoDetalle | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let accionando = $state(false);
	let accionError = $state<string | null>(null);

	const idContrato = $derived($page.params.idContrato);

	async function cargar() {
		loading = true;
		error = null;

		try {
			const res = await httpClient.get<{
				success: boolean;
				data: { contratos: ContratoDetalle[] };
			}>('/api/ventas/contratos');
			const encontrado = res.data.contratos.find((c) => c.id === idContrato);
			if (!encontrado) {
				error = 'Contrato no encontrado.';
			}
			contrato = encontrado ?? null;
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudo cargar el contrato.';
		} finally {
			loading = false;
		}
	}

	async function firmar() {
		if (!contrato) return;
		accionando = true;
		accionError = null;

		try {
			await firmarContrato(ventasRepository, contrato.id);
			await cargar();
		} catch (err) {
			accionError = err instanceof HttpError ? err.message : 'Error al firmar.';
		} finally {
			accionando = false;
		}
	}

	async function cancelar() {
		if (!contrato) return;
		accionando = true;
		accionError = null;

		try {
			await cancelarContrato(ventasRepository, contrato.id);
			await cargar();
		} catch (err) {
			accionError = err instanceof HttpError ? err.message : 'Error al cancelar.';
		} finally {
			accionando = false;
		}
	}

	function formatearFecha(fechaIso: string): string {
		return new Intl.DateTimeFormat('es-PE', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(fechaIso));
	}

	function estadoBadge(estado: string): string {
		const map: Record<string, string> = {
			BORRADOR: 'bg-amber-50 text-amber-700',
			VIGENTE: 'bg-emerald-50 text-emerald-700',
			CANCELADO: 'bg-red-50 text-red-700',
			FIRMADO: 'bg-blue-50 text-blue-700'
		};
		return map[estado] ?? 'bg-gray-50 text-gray-700';
	}

	function puedeFirmar(): boolean {
		return contrato?.estado === 'BORRADOR';
	}

	function puedeCancelar(): boolean {
		return contrato?.estado === 'BORRADOR' || contrato?.estado === 'VIGENTE';
	}

	$effect(() => {
		if (idContrato) cargar();
	});
</script>

<svelte:head>
	<title>Contrato {idContrato} | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Contratos</p>
			<h1 class="mt-2 font-display text-3xl font-bold text-text-main">Detalle del contrato</h1>
		</div>

		<Button variant="ghost" onclick={() => goto('/admin/contratos')}>Volver a contratos</Button>
	</div>

	{#if loading}
		<Card>
			<div class="h-64 animate-pulse rounded-2xl bg-surface-muted"></div>
		</Card>
	{:else if error}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">{error}</p>
			<Button class="mt-5" onclick={cargar}>Intentar nuevamente</Button>
		</Card>
	{:else if contrato}
		{#if accionError}
			<p class="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{accionError}</p>
		{/if}

		<Card>
			<div class="mb-6 flex items-center justify-between">
				<div>
					<h2 class="font-display text-xl font-bold text-text-main">{contrato.id}</h2>
					<p
						class="mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold {estadoBadge(
							contrato.estado
						)}"
					>
						{contrato.estado}
					</p>
				</div>

				<div class="flex gap-3">
					{#if puedeFirmar()}
						<Button disabled={accionando} onclick={firmar}>
							{accionando ? 'Firmando...' : 'Firmar contrato'}
						</Button>
					{/if}
					{#if puedeCancelar()}
						<Button variant="ghost" disabled={accionando} onclick={cancelar}>
							{accionando ? 'Cancelando...' : 'Cancelar contrato'}
						</Button>
					{/if}
				</div>
			</div>

			<div class="grid gap-6 md:grid-cols-2">
				<div>
					<p class="text-xs font-semibold tracking-wider text-text-muted uppercase">Propiedad</p>
					<p class="mt-1 font-medium text-text-main">{contrato.idPropiedad}</p>
				</div>

				<div>
					<p class="text-xs font-semibold tracking-wider text-text-muted uppercase">Lead origen</p>
					<p class="mt-1 font-medium text-text-main">{contrato.idLead ?? 'Sin lead asociado'}</p>
				</div>

				<div>
					<p class="text-xs font-semibold tracking-wider text-text-muted uppercase">Cliente</p>
					<p class="mt-1 font-medium text-text-main">
						{contrato.idCliente ?? 'Por asignar en firma'}
					</p>
				</div>

				<div>
					<p class="text-xs font-semibold tracking-wider text-text-muted uppercase">Inicio</p>
					<p class="mt-1 font-medium text-text-main">{formatearFecha(contrato.fechaInicio)}</p>
				</div>

				<div>
					<p class="text-xs font-semibold tracking-wider text-text-muted uppercase">Fin</p>
					<p class="mt-1 font-medium text-text-main">{formatearFecha(contrato.fechaFin)}</p>
				</div>

				<div>
					<p class="text-xs font-semibold tracking-wider text-text-muted uppercase">Creado</p>
					<p class="mt-1 font-medium text-text-main">{formatearFecha(contrato.creadoEn)}</p>
				</div>

				<div>
					<p class="text-xs font-semibold tracking-wider text-text-muted uppercase">Actualizado</p>
					<p class="mt-1 font-medium text-text-main">{formatearFecha(contrato.actualizadoEn)}</p>
				</div>
			</div>
		</Card>
	{/if}
</div>
