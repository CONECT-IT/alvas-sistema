<script lang="ts">
	import { goto } from '$app/navigation';
	import Badge from '$lib/shared/ui/Badge.svelte';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import { presentarEstadoContrato } from '$lib/shared/presentation';
	import { httpClient, HttpError } from '$lib/shared/http/httpClient';
	import type { ContratoDTO } from '$lib/ventas/infrastructure/dto/VentasDTOs';
	import { firmarContrato } from '$lib/ventas/application/use-cases/firmarContrato';
	import { cancelarContrato } from '$lib/ventas/application/use-cases/cancelarContrato';
	import { ventasRepository } from '$lib/ventas/infrastructure/ventasRepository';

	let contratos = $state<ContratoDTO[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let firmando = $state<string | null>(null);
	let cancelando = $state<string | null>(null);

	async function cargar() {
		loading = true;
		error = null;
		try {
			const res = await httpClient.get<{ success: boolean; data: ContratoDTO[] }>(
				'/api/ventas/contratos'
			);
			contratos = res.data;
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudieron cargar los contratos.';
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

	$effect(() => {
		cargar();
	});
</script>

<svelte:head>
	<title>Contratos | ALVAS Admin</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="section-label">Gestión</p>
			<h1 class="page-heading">Contratos</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Todos los contratos del sistema. Fírmalos o cancélalos según corresponda.
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
				Aún no hay contratos registrados en el sistema.
			</p>
		</Card>
	{:else}
		<div class="grid gap-4">
			{#each contratos as contrato (contrato.id)}
				<Card>
					<div class="flex flex-col gap-4">
						<div class="flex items-start justify-between gap-4">
							<div>
								<button
									onclick={() => goto(`/admin/contratos/${contrato.id}`)}
									class="cursor-pointer text-left"
								>
									<h3
										class="font-display text-lg font-bold text-text-main transition-colors hover:text-primary"
									>
										Contrato {contrato.id.slice(0, 8)}...
									</h3>
								</button>
								<p class="mt-1 text-sm text-text-muted">
									Propiedad: {contrato.nombrePropiedad || contrato.idPropiedad}
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
									>{contrato.nombreLead || contrato.idLead || '—'}</span
								>
							</div>
							<div>
								<span class="font-semibold text-text-main">Asesor:</span>
								<span class="ml-1 text-text-muted"
									>{contrato.nombreAsesor || contrato.idAsesor || '—'}</span
								>
							</div>
							<div>
								<span class="font-semibold text-text-main">Cliente:</span>
								<span class="ml-1 text-text-muted">{contrato.idCliente ?? '—'}</span>
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
