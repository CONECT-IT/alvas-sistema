<script lang="ts">
	import Badge from '$lib/shared/ui/Badge.svelte';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import SidePanel from '$lib/shared/ui/SidePanel.svelte';
	import { HttpError } from '$lib/shared/http/httpClient';
	import type { Cliente } from '../domain/models/Cliente';
	import { obtenerCliente } from '../application/use-cases/obtenerCliente';
	import { presentarEstadoContrato } from '$lib/shared/presentation';
	import { actualizarCliente } from '../application/use-cases/actualizarCliente';
	import { clienteRepository } from '../infrastructure/clienteRepository';
	import { listarContratos } from '$lib/ventas/application/use-cases/listarContratos';
	import { obtenerLead } from '$lib/ventas/application/use-cases/obtenerLead';
	import { ventasRepository } from '$lib/ventas/infrastructure/ventasRepository';
	import type { ContratoDTO } from '$lib/ventas/infrastructure/dto/VentasDTOs';
	import type { LeadDetalle } from '$lib/ventas/domain/models/LeadDetalle';
	import { onMount } from 'svelte';

	interface Props {
		clienteId: string;
	}

	let { clienteId }: Props = $props();

	let cliente = $state<Cliente | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let editando = $state(false);
	let editNombre = $state('');
	let editEmail = $state('');
	let editTelefono = $state('');
	let saving = $state(false);
	let saveError = $state<string | null>(null);
	let saveSuccess = $state<string | null>(null);

	let leadOrigen = $state<LeadDetalle | null>(null);
	let contratos = $state<ContratoDTO[]>([]);
	let cargandoHistorial = $state(true);

	async function cargar() {
		if (!clienteId.trim()) {
			cliente = null;
			loading = false;
			return;
		}
		loading = true;
		error = null;
		try {
			cliente = await obtenerCliente(clienteRepository, clienteId.trim());
			if (cliente) {
				await cargarHistorial(cliente);
			}
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudo cargar el cliente.';
		} finally {
			loading = false;
		}
	}

	async function cargarHistorial(cli: Cliente) {
		cargandoHistorial = true;
		try {
			if (cli.idLeadOrigen) {
				try {
					leadOrigen = await obtenerLead(ventasRepository, cli.idLeadOrigen);
				} catch {
					/* ignorar */
				}
			}
			const todos = await listarContratos(ventasRepository);
			contratos = todos.filter((c) => c.idCliente === cli.id);
		} finally {
			cargandoHistorial = false;
		}
	}

	function iniciarEdicion() {
		if (!cliente) return;
		editNombre = cliente.nombre;
		editEmail = cliente.email;
		editTelefono = cliente.telefono;
		editando = true;
		saveError = null;
		saveSuccess = null;
	}

	async function guardarCambios(event?: SubmitEvent) {
		event?.preventDefault();
		if (!cliente) return;
		saving = true;
		saveError = null;
		saveSuccess = null;

		try {
			const actualizado = await actualizarCliente(clienteRepository, {
				idCliente: cliente.id,
				nombre: editNombre.trim() || undefined,
				email: editEmail.trim() || undefined,
				telefono: editTelefono.trim() || undefined
			});
			cliente = actualizado;
			editando = false;
			saveSuccess = 'Cliente actualizado correctamente.';
		} catch (err) {
			saveError = err instanceof HttpError ? err.message : 'No se pudo actualizar el cliente.';
		} finally {
			saving = false;
		}
	}

	function cancelarEdicion() {
		editando = false;
	}

	function formatearFecha(iso: string): string {
		return new Date(iso).toLocaleDateString('es-PE', {
			day: '2-digit',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	onMount(() => {
		cargar();
	});
</script>

{#if loading}
	<Card>
		<div class="skeleton"></div>
	</Card>
{:else if error}
	<Card class="text-center">
		<p class="font-display text-xl font-bold text-text-main">No se pudo cargar el cliente</p>
		<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">{error}</p>
		<Button onclick={cargar}>Intentar nuevamente</Button>
	</Card>
{:else if cliente}
	<div class="flex flex-col gap-6">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<div class="flex flex-wrap items-center gap-3">
					<h1 class="font-display text-3xl font-bold text-text-main">{cliente.nombre}</h1>
					<Badge tone="success">Cliente</Badge>
				</div>
				<p class="mt-2 text-sm text-text-muted">
					Asesor: {cliente.nombreAsesor ?? 'Sin asignar'}
				</p>
			</div>
			<div class="flex gap-3">
				{#if !editando}
					<Button variant="secondary" onclick={iniciarEdicion}>Editar</Button>
				{/if}
				<Button variant="ghost" onclick={() => window.history.back()}>Volver</Button>
			</div>
		</div>

		<SidePanel isOpen={editando} title="Editar cliente" onClose={cancelarEdicion}>
			<form class="grid gap-4" onsubmit={guardarCambios}>
				<label class="label-field">
					Nombre
					<input bind:value={editNombre} class="input-field" />
				</label>
				<label class="label-field">
					Email
					<input bind:value={editEmail} type="email" class="input-field" />
				</label>
				<label class="label-field">
					Teléfono
					<input bind:value={editTelefono} class="input-field" />
				</label>
				{#if saveError}
					<p class="error-alert">
						{saveError}
					</p>
				{/if}
				<div class="flex items-center justify-end gap-3">
					<Button type="button" variant="ghost" onclick={cancelarEdicion}>Cancelar</Button>
					<Button type="submit" disabled={saving}>
						{saving ? 'Guardando...' : 'Guardar cambios'}
					</Button>
				</div>
			</form>
		</SidePanel>

		{#if saveSuccess}
			<p class="success-alert">
				{saveSuccess}
			</p>
		{/if}

		{#if leadOrigen}
			<Card>
				<div class="mb-4 flex items-center gap-3">
					<h2 class="font-display text-xl font-bold text-text-main">Historial como lead</h2>
					<Badge tone="brand">Lead</Badge>
				</div>
				<dl class="dl-grid">
					<dt class="font-semibold text-text-muted">Nombre</dt>
					<dd class="text-text-main">{leadOrigen.nombre}</dd>
					<dt class="font-semibold text-text-muted">Tipo</dt>
					<dd class="text-text-main">{leadOrigen.tipo}</dd>
					<dt class="font-semibold text-text-muted">Estado del lead</dt>
					<dd><Badge>{leadOrigen.estado}</Badge></dd>
					<dt class="font-semibold text-text-muted">Asesor asignado</dt>
					<dd class="text-text-main">{leadOrigen.nombreAsesor ?? 'Sin asignar'}</dd>
					{#if leadOrigen.citas.length > 0}
						<dt class="font-semibold text-text-muted">Citas realizadas</dt>
						<dd class="text-text-main">{leadOrigen.citas.length}</dd>
					{/if}
				</dl>
			</Card>
		{/if}

		<div class="grid gap-6 xl:grid-cols-2">
			<Card>
				<h2 class="card-title">Información de contacto</h2>
				<dl class="dl-grid">
					<dt class="font-semibold text-text-muted">Email</dt>
					<dd class="text-text-main">{cliente.email}</dd>
					<dt class="font-semibold text-text-muted">Teléfono</dt>
					<dd class="text-text-main">{cliente.telefono}</dd>
					<dt class="font-semibold text-text-muted">Asesor asignado</dt>
					<dd class="text-text-main">{cliente.nombreAsesor ?? 'Sin asignar'}</dd>
					{#if cliente.idLeadOrigen}
						<dt class="font-semibold text-text-muted">Lead de origen</dt>
						<dd class="text-text-main">{cliente.nombreLead ?? 'Prospecto convertido'}</dd>
					{/if}
				</dl>
			</Card>

			<Card>
				<h2 class="card-title">Fechas</h2>
				<dl class="dl-grid">
					<dt class="font-semibold text-text-muted">Creado</dt>
					<dd class="text-text-main">{formatearFecha(cliente.creadoEn)}</dd>
					<dt class="font-semibold text-text-muted">Actualizado</dt>
					<dd class="text-text-main">{formatearFecha(cliente.actualizadoEn)}</dd>
				</dl>
			</Card>
		</div>

		{#if contratos.length > 0}
			<Card>
				<div class="mb-5">
					<h2 class="font-display text-xl font-bold text-text-main">Contratos</h2>
					<p class="mt-1 text-sm text-text-muted">Contratos asociados a este cliente.</p>
				</div>
				<div class="grid gap-3">
					{#each contratos as ctr (ctr.id)}
						<div class="rounded-2xl border border-border-light bg-bg-base px-4 py-3">
							<div class="flex flex-wrap items-center justify-between gap-3">
								<div>
									<p class="font-semibold text-text-main">
										{ctr.nombrePropiedad ?? 'Propiedad registrada'}
									</p>
									<p class="mt-0.5 text-xs text-text-muted">
										{ctr.nombreLead ?? 'Prospecto asociado'} &middot; {formatearFecha(
											ctr.fechaInicio
										)}
									</p>
								</div>
								<Badge tone={presentarEstadoContrato(ctr.estado).tone}>
									{presentarEstadoContrato(ctr.estado).label}
								</Badge>
							</div>
						</div>
					{/each}
				</div>
			</Card>
		{/if}

		{#if cargandoHistorial}
			<Card>
				<div class="h-16 animate-pulse rounded-2xl bg-surface-muted"></div>
			</Card>
		{/if}
	</div>
{/if}
