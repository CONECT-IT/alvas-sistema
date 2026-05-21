<script lang="ts">
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import { HttpError } from '$lib/shared/http/httpClient';
	import type { Usuario } from '$lib/usuarios/domain/models/Usuario';
	import { listarUsuarios } from '$lib/usuarios/application/use-cases/listarUsuarios';
	import { usuarioRepository } from '$lib/usuarios/infrastructure/usuarioRepository';
	import UsuarioAdminTable from '$lib/usuarios/presentation/UsuarioAdminTable.svelte';
	import UsuarioStats from '$lib/usuarios/presentation/UsuarioStats.svelte';

	let usuarios = $state<Usuario[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	async function cargarUsuarios() {
		loading = true;
		error = null;

		try {
			usuarios = await listarUsuarios(usuarioRepository);
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudo cargar la lista de usuarios.';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		cargarUsuarios();
	});
</script>

<svelte:head>
	<title>Gestión de Usuarios | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Equipo</p>
			<h1 class="mt-2 font-display text-3xl font-bold text-text-main">Usuarios y asesores</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Consulta las cuentas del sistema, valida roles activos y controla qué asesores pueden operar
				la cartera comercial.
			</p>
		</div>

		<Button variant="secondary" onclick={cargarUsuarios}>Actualizar usuarios</Button>
	</div>

	{#if loading}
		<Card>
			<div class="h-64 animate-pulse rounded-2xl bg-surface-muted"></div>
		</Card>
	{:else if error}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">No se pudo cargar usuarios</p>
			<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">{error}</p>
			<Button class="mt-5" onclick={cargarUsuarios}>Intentar nuevamente</Button>
		</Card>
	{:else}
		<UsuarioStats {usuarios} />
		<Card>
			<div class="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
				<div>
					<h2 class="font-display text-xl font-bold text-text-main">Directorio operativo</h2>
					<p class="mt-1 text-sm text-text-muted">Datos cargados desde la API de usuarios.</p>
				</div>
				<p class="text-sm font-semibold text-primary">{usuarios.length} registros</p>
			</div>

			<UsuarioAdminTable {usuarios} />
		</Card>
	{/if}
</div>
