<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Badge from '$lib/shared/ui/Badge.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import Button from '$lib/shared/ui/Button.svelte';
	import { presentarEstadoContrato } from '$lib/shared/presentation';
	import { HttpError } from '$lib/shared/http/httpClient';
	import { firmarContrato } from '$lib/ventas/application/use-cases/firmarContrato';
	import { cancelarContrato } from '$lib/ventas/application/use-cases/cancelarContrato';
	import { ventasRepository } from '$lib/ventas/infrastructure/ventasRepository';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let contratos = $derived((data?.contratos as unknown as ContratoDto[]) ?? []);

	type ContratoDto = {
		id: string;
		idLead?: string;
		nombreLead?: string;
		idCliente?: string;
		nombreCliente?: string;
		idPropiedad: string;
		nombrePropiedad?: string;
		idAsesor?: string;
		nombreAsesor?: string;
		fechaInicio: string;
		fechaFin: string;
		estado: string;
		creadoEn: string;
		actualizadoEn: string;
	};
	let loading = $state(false);
	let error = $state<string | null>(null);
	let firmando = $state<string | null>(null);
	let cancelando = $state<string | null>(null);

	async function cargar() {
		loading = true;
		error = null;
		try {
			await invalidateAll();
		} catch {
			error = 'No se pudieron actualizar los contratos.';
		} finally {
			loading = false;
		}
	}

	async function firmar(idContrato: string) {
		firmando = idContrato;
		try {
			await firmarContrato(ventasRepository, idContrato);
			await cargar();
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudo firmar el contrato.';
		} finally {
			firmando = null;
		}
	}

	async function cancelar(idContrato: string) {
		cancelando = idContrato;
		try {
			await cancelarContrato(ventasRepository, idContrato);
			await cargar();
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudo cancelar el contrato.';
		} finally {
			cancelando = null;
		}
	}

	function tituloContrato(contrato: ContratoDto): string {
		return contrato.nombrePropiedad
			? `Contrato - ${contrato.nombrePropiedad}`
			: 'Contrato comercial';
	}
</script>

<svelte:head>
	<title>Mis Contratos | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="section-label">Gestión</p>
			<h1 class="page-heading">Mis contratos</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Contratos creados a partir de tus leads. Fírmalos para convertirlos en clientes.
			</p>
		</div>
		<Button variant="secondary" onclick={cargar}>Actualizar</Button>
	</div>

	{#if loading}
		<Card>
			<div class="skeleton"></div>
		</Card>
	{:else if error}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">Error al cargar</p>
			<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">{error}</p>
			<Button class="mt-5" onclick={cargar}>Intentar nuevamente</Button>
		</Card>
	{:else if contratos.length === 0}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">Sin contratos</p>
			<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">
				Aún no tienes contratos registrados. Crea uno desde la sección de leads.
			</p>
		</Card>
	{:else}
		<div class="grid gap-4">
			{#each contratos as contrato (contrato.id)}
				<Card>
					<div class="flex flex-col gap-4">
						<div class="flex items-start justify-between gap-4">
							<div>
								<h3 class="font-display text-lg font-bold text-text-main">
									{tituloContrato(contrato)}
								</h3>
								<p class="mt-1 text-sm text-text-muted">
									Propiedad: {contrato.nombrePropiedad ?? 'Propiedad registrada'}
								</p>
							</div>
							<Badge tone={presentarEstadoContrato(contrato.estado).tone} class="uppercase">
								{presentarEstadoContrato(contrato.estado).label}
							</Badge>
						</div>

						<div class="grid gap-2 text-sm sm:grid-cols-2">
							<div>
								<span class="font-semibold text-text-main">Lead:</span>
								<span class="ml-1 text-text-muted"
									>{contrato.nombreLead ?? 'Prospecto asociado'}</span
								>
							</div>
							<div>
								<span class="font-semibold text-text-main">Cliente:</span>
								<span class="ml-1 text-text-muted"
									>{contrato.nombreCliente ?? 'Pendiente de firma'}</span
								>
							</div>
							<div>
								<span class="font-semibold text-text-main">Inicio:</span>
								<span class="ml-1 text-text-muted"
									>{new Date(contrato.fechaInicio).toLocaleDateString('es-PE')}</span
								>
							</div>
							<div>
								<span class="font-semibold text-text-main">Fin:</span>
								<span class="ml-1 text-text-muted"
									>{new Date(contrato.fechaFin).toLocaleDateString('es-PE')}</span
								>
							</div>
						</div>

						{#if contrato.estado === 'BORRADOR'}
							<div class="flex gap-3">
								<Button onclick={() => firmar(contrato.id)} disabled={firmando === contrato.id}>
									{firmando === contrato.id ? 'Firmando...' : 'Firmar contrato'}
								</Button>
								<Button
									variant="ghost"
									onclick={() => cancelar(contrato.id)}
									disabled={cancelando === contrato.id}
								>
									{cancelando === contrato.id ? 'Cancelando...' : 'Cancelar'}
								</Button>
							</div>
						{:else if contrato.estado === 'VIGENTE'}
							<div class="flex gap-3">
								<Button
									variant="ghost"
									onclick={() => cancelar(contrato.id)}
									disabled={cancelando === contrato.id}
								>
									{cancelando === contrato.id ? 'Cancelando...' : 'Cancelar contrato'}
								</Button>
							</div>
						{/if}
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>
