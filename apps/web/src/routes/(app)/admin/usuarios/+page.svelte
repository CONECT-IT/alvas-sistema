<script lang="ts">
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
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
	let formSuccess = $state<string | null>(null);
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

	function cargarUsuarioParaEditar() {
		const usuario = usuarios.find((item) => item.id === editIdUsuario);

		if (!usuario) {
			editUsername = '';
			editNombre = '';
			editRol = '';
			return;
		}

		editUsername = usuario.username;
		editNombre = usuario.nombre;
		editRol = usuario.rol;
	}

	async function registrarUsuario(event: SubmitEvent) {
		event.preventDefault();
		formError = null;
		formSuccess = null;

		if (!username.trim() || !nombre.trim() || !clave.trim()) {
			formError = 'Completa usuario de acceso, nombre y clave temporal.';
			return;
		}

		saving = true;

		try {
			const usuario = await crearUsuario(usuarioRepository, {
				idUsuario: username.trim().toLowerCase(),
				username: username.trim(),
				nombre: nombre.trim(),
				clave,
				rol
			});
			formSuccess = `Usuario creado: ${usuario.nombre}`;
			limpiarCrear();
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
		formSuccess = null;

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
			const usuario = await actualizarUsuario(usuarioRepository, {
				idUsuario: editIdUsuario.trim(),
				username: editUsername.trim() || undefined,
				nombre: editNombre.trim() || undefined,
				rol: editRol || undefined
			});
			formSuccess = `Usuario actualizado: ${usuario.nombre}`;
			limpiarEditar();
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

		<Button variant="secondary" onclick={cargarUsuarios}>Actualizar usuarios</Button>
	</div>

	<Card>
		<div class="mb-5">
			<h2 class="font-display text-xl font-bold text-text-main">Equipo comercial</h2>
			<p class="mt-1 text-sm leading-relaxed text-text-muted">
				Crea cuentas para asesores y mantén actualizados sus datos de acceso.
			</p>
		</div>

		{#if formSuccess}
			<p class="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
				{formSuccess}
			</p>
		{/if}

		{#if formError}
			<p class="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
				{formError}
			</p>
		{/if}

		<div class="grid gap-6 xl:grid-cols-2">
			<form class="grid gap-4 md:grid-cols-2" onsubmit={registrarUsuario}>
				<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
					Usuario de acceso
					<input
						bind:value={username}
						class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
						placeholder="asesor.surco"
					/>
				</label>

				<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
					Nombre
					<input
						bind:value={nombre}
						class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
						placeholder="Nombre completo"
					/>
				</label>

				<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
					Rol
					<select
						bind:value={rol}
						class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
					>
						<option value="ASESOR">Asesor</option>
						<option value="ADMIN">Administrador</option>
					</select>
				</label>

				<label class="flex flex-col gap-2 text-sm font-semibold text-text-main md:col-span-2">
					Clave temporal
					<input
						bind:value={clave}
						type="password"
						class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
						placeholder="Se entrega al asesor para su primer ingreso"
					/>
				</label>

				<div class="flex flex-col gap-3 md:col-span-2 md:flex-row md:justify-end">
					<Button type="button" variant="ghost" onclick={limpiarCrear}>Limpiar</Button>
					<Button type="submit" disabled={saving}>
						{saving ? 'Guardando...' : 'Crear cuenta'}
					</Button>
				</div>
			</form>

			<form class="grid gap-4 md:grid-cols-2" onsubmit={guardarCambiosUsuario}>
				<label class="flex flex-col gap-2 text-sm font-semibold text-text-main md:col-span-2">
					Seleccionar cuenta
					<select
						bind:value={editIdUsuario}
						onchange={cargarUsuarioParaEditar}
						class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
					>
						<option value="">Elige un asesor o administrador</option>
						{#each usuarios as usuario (usuario.id)}
							<option value={usuario.id}>{usuario.nombre} - {usuario.rol}</option>
						{/each}
					</select>
				</label>

				<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
					Usuario de acceso
					<input
						bind:value={editUsername}
						class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
						placeholder="Usuario de acceso"
					/>
				</label>

				<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
					Nombre visible
					<input
						bind:value={editNombre}
						class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
						placeholder="Nombre completo"
					/>
				</label>

				<label class="flex flex-col gap-2 text-sm font-semibold text-text-main md:col-span-2">
					Rol
					<select
						bind:value={editRol}
						class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
					>
						<option value="">Sin cambio</option>
						<option value="ASESOR">Asesor</option>
						<option value="ADMIN">Administrador</option>
					</select>
				</label>

				<div class="flex flex-col gap-3 md:col-span-2 md:flex-row md:justify-end">
					<Button type="button" variant="ghost" onclick={limpiarEditar}>Limpiar</Button>
					<Button type="submit" disabled={saving}>
						{saving ? 'Guardando...' : 'Guardar cambios'}
					</Button>
				</div>
			</form>
		</div>
	</Card>

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
					<p class="mt-1 text-sm text-text-muted">
						Cuentas habilitadas para administrar y atender la cartera comercial.
					</p>
				</div>
				<p class="text-sm font-semibold text-primary">{usuarios.length} registros</p>
			</div>

			<UsuarioAdminTable {usuarios} />
		</Card>
	{/if}
</div>
