<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import SidePanel from '$lib/shared/ui/SidePanel.svelte';
	import { HttpError } from '$lib/shared/http/httpClient';
	import type { UserRol } from '$lib/auth/domain/models/User';
	import type { Usuario } from '$lib/usuarios/domain/models/Usuario';
	import { actualizarUsuario } from '$lib/usuarios/application/use-cases/actualizarUsuario';
	import { crearUsuario } from '$lib/usuarios/application/use-cases/crearUsuario';
	import { listarUsuarios } from '$lib/usuarios/application/use-cases/listarUsuarios';
	import { usuarioRepository } from '$lib/usuarios/infrastructure/usuarioRepository';
	import UsuarioAdminTable from '$lib/usuarios/presentation/UsuarioAdminTable.svelte';
	import UsuarioStats from '$lib/usuarios/presentation/UsuarioStats.svelte';

	let usuarios = $state<Usuario[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let saving = $state(false);
	let formError = $state<string | null>(null);

	let mostrarPanelCrear = $state(false);
	let mostrarPanelEditar = $state(false);

	let username = $state('');
	let nombre = $state('');
	let clave = $state('');
	let rol = $state<UserRol>('ASESOR');

	let editIdUsuario = $state('');
	let editUsername = $state('');
	let editNombre = $state('');
	let editRol = $state<UserRol | ''>('');

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

	function limpiarCrear() {
		username = '';
		nombre = '';
		clave = '';
		rol = 'ASESOR';
	}

	function limpiarEditar() {
		editIdUsuario = '';
		editUsername = '';
		editNombre = '';
		editRol = '';
	}

	function abrirEditar(usuario: Usuario) {
		editIdUsuario = usuario.id;
		editUsername = usuario.username;
		editNombre = usuario.nombre;
		editRol = usuario.rol;
		formError = null;
		mostrarPanelEditar = true;
	}

	function verDetalle(usuario: Usuario) {
		goto(`/admin/usuarios/${usuario.id}`);
	}

	async function registrarUsuario(event: SubmitEvent) {
		event.preventDefault();
		formError = null;

		if (!username.trim() || !nombre.trim() || !clave.trim()) {
			formError = 'Completa usuario de acceso, nombre y clave temporal.';
			return;
		}

		saving = true;

		try {
			await crearUsuario(usuarioRepository, {
				idUsuario: username.trim().toLowerCase(),
				username: username.trim(),
				nombre: nombre.trim(),
				clave,
				rol
			});
			limpiarCrear();
			mostrarPanelCrear = false;
			await cargarUsuarios();
		} catch (err) {
			formError = err instanceof HttpError ? err.message : 'No se pudo crear el usuario.';
		} finally {
			saving = false;
		}
	}

	async function guardarCambiosUsuario(event: SubmitEvent) {
		event.preventDefault();
		formError = null;

		if (!editIdUsuario.trim()) {
			formError = 'Selecciona el usuario que vas a actualizar.';
			return;
		}

		if (!editUsername.trim() && !editNombre.trim() && !editRol) {
			formError = 'Indica al menos un dato para actualizar.';
			return;
		}

		saving = true;

		try {
			await actualizarUsuario(usuarioRepository, {
				idUsuario: editIdUsuario.trim(),
				username: editUsername.trim() || undefined,
				nombre: editNombre.trim() || undefined,
				rol: editRol || undefined
			});
			limpiarEditar();
			mostrarPanelEditar = false;
			await cargarUsuarios();
		} catch (err) {
			formError = err instanceof HttpError ? err.message : 'No se pudo actualizar el usuario.';
		} finally {
			saving = false;
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

		<Button variant="secondary" onclick={() => (mostrarPanelCrear = true)}>Nuevo usuario</Button>
	</div>

	<SidePanel
		isOpen={mostrarPanelCrear}
		title="Nuevo usuario"
		onClose={() => (mostrarPanelCrear = false)}
	>
		<form class="grid gap-4" onsubmit={registrarUsuario}>
			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Usuario de acceso
				<input
					bind:value={username}
					class="rounded-2xl border border-border-light bg-bg-card px-4 py-3 font-normal text-text-main outline-none focus:border-primary"
					placeholder="asesor.surco"
				/>
			</label>

			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Nombre
				<input
					bind:value={nombre}
					class="rounded-2xl border border-border-light bg-bg-card px-4 py-3 font-normal text-text-main outline-none focus:border-primary"
					placeholder="Nombre completo"
				/>
			</label>

			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Rol
				<select
					bind:value={rol}
					class="rounded-2xl border border-border-light bg-bg-card px-4 py-3 font-normal text-text-main outline-none focus:border-primary"
				>
					<option value="ASESOR">Asesor</option>
					<option value="ADMIN">Administrador</option>
				</select>
			</label>

			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Clave temporal
				<input
					bind:value={clave}
					type="password"
					class="rounded-2xl border border-border-light bg-bg-card px-4 py-3 font-normal text-text-main outline-none focus:border-primary"
					placeholder="Se entrega al asesor para su primer ingreso"
				/>
			</label>

			{#if formError}
				<p class="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
					{formError}
				</p>
			{/if}

			<Button type="submit" disabled={saving}>
				{saving ? 'Guardando...' : 'Crear cuenta'}
			</Button>
		</form>
	</SidePanel>

	<SidePanel
		isOpen={mostrarPanelEditar}
		title="Editar usuario"
		onClose={() => (mostrarPanelEditar = false)}
	>
		<form class="grid gap-4" onsubmit={guardarCambiosUsuario}>
			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Usuario de acceso
				<input
					bind:value={editUsername}
					class="rounded-2xl border border-border-light bg-bg-card px-4 py-3 font-normal text-text-main outline-none focus:border-primary"
					placeholder="Usuario de acceso"
				/>
			</label>

			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Nombre visible
				<input
					bind:value={editNombre}
					class="rounded-2xl border border-border-light bg-bg-card px-4 py-3 font-normal text-text-main outline-none focus:border-primary"
					placeholder="Nombre completo"
				/>
			</label>

			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Rol
				<select
					bind:value={editRol}
					class="rounded-2xl border border-border-light bg-bg-card px-4 py-3 font-normal text-text-main outline-none focus:border-primary"
				>
					<option value="">Sin cambio</option>
					<option value="ASESOR">Asesor</option>
					<option value="ADMIN">Administrador</option>
				</select>
			</label>

			{#if formError}
				<p class="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
					{formError}
				</p>
			{/if}

			<Button type="submit" disabled={saving}>
				{saving ? 'Guardando...' : 'Guardar cambios'}
			</Button>
		</form>
	</SidePanel>

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
			<UsuarioAdminTable {usuarios} onEditClick={abrirEditar} onRowClick={verDetalle} />
		</Card>
	{/if}
</div>
