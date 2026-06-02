<script lang="ts">
	import Badge from '$lib/shared/ui/Badge.svelte';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import FloatingTextInput from '$lib/shared/ui/FloatingTextInput.svelte';
	import SidePanel from '$lib/shared/ui/SidePanel.svelte';
	import { HttpError } from '$lib/shared/http/httpClient';
	import type { UserRol } from '$lib/auth/domain/models/User';
	import type { Usuario } from '../domain/models/Usuario';
	import { presentarEstadoUsuario } from '$lib/shared/presentation';
	import { actualizarUsuario } from '../application/use-cases/actualizarUsuario';
	import { obtenerUsuario } from '../application/use-cases/obtenerUsuario';
	import { usuarioRepository } from '../infrastructure/usuarioRepository';

	interface Props {
		idUsuario: string;
	}

	let { idUsuario }: Props = $props();

	let usuario = $state<Usuario | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	let editando = $state(false);
	let editUsername = $state('');
	let editNombre = $state('');
	let editClave = $state('');
	let editRol = $state<UserRol | ''>('');
	let saving = $state(false);
	let saveError = $state<string | null>(null);
	let saveSuccess = $state<string | null>(null);
	let disabling = $state(false);

	async function cargar() {
		if (!idUsuario.trim()) {
			usuario = null;
			loading = false;
			return;
		}

		loading = true;
		error = null;

		try {
			usuario = await obtenerUsuario(usuarioRepository, idUsuario.trim());
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudo cargar el usuario.';
		} finally {
			loading = false;
		}
	}

	function iniciarEdicion() {
		if (!usuario) return;
		editUsername = usuario.username;
		editNombre = usuario.nombre;
		editClave = '';
		editRol = usuario.rol;
		saveError = null;
		saveSuccess = null;
		editando = true;
	}

	function cancelarEdicion() {
		editando = false;
		saveError = null;
	}

	async function guardarCambios(event: SubmitEvent) {
		event.preventDefault();
		if (!usuario) return;

		saveError = null;
		saveSuccess = null;

		if (!editUsername.trim() && !editNombre.trim() && !editRol) {
			saveError = 'Indica al menos un dato para actualizar.';
			return;
		}

		saving = true;

		try {
			const actualizado = await actualizarUsuario(usuarioRepository, {
				idUsuario: usuario.id,
				username: editUsername.trim() || undefined,
				nombre: editNombre.trim() || undefined,
				clave: editClave.trim() || undefined,
				rol: editRol || undefined
			});
			usuario = actualizado;
			editando = false;
			saveSuccess = 'Usuario actualizado correctamente.';
		} catch (err) {
			saveError = err instanceof HttpError ? err.message : 'No se pudo actualizar el usuario.';
		} finally {
			saving = false;
		}
	}

	async function conmutarEstado() {
		if (!usuario) return;

		const nuevoEstado = usuario.estado.toUpperCase() === 'ACTIVO' ? 'DESHABILITADO' : 'ACTIVO';
		const confirmacion = confirm(
			`¿Estás seguro de que deseas ${nuevoEstado === 'ACTIVO' ? 'activar' : 'deshabilitar'} a este usuario?`
		);

		if (!confirmacion) return;

		disabling = true;
		saveError = null;
		saveSuccess = null;

		try {
			const actualizado = await actualizarUsuario(usuarioRepository, {
				idUsuario: usuario.id,
				estado: nuevoEstado
			});
			usuario = actualizado;
			saveSuccess = `Usuario ${nuevoEstado === 'ACTIVO' ? 'activado' : 'deshabilitado'} correctamente.`;
		} catch (err) {
			saveError =
				err instanceof HttpError ? err.message : 'No se pudo cambiar el estado del usuario.';
		} finally {
			disabling = false;
		}
	}

	$effect(() => {
		cargar();
	});
</script>

{#if loading}
	<Card>
		<div class="skeleton"></div>
	</Card>
{:else if error}
	<Card class="text-center">
		<p class="font-display text-xl font-bold text-text-main">No se pudo cargar el usuario</p>
		<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">{error}</p>
		<Button onclick={cargar}>Intentar nuevamente</Button>
	</Card>
{:else if usuario}
	<div class="flex flex-col gap-6">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<div class="flex flex-wrap items-center gap-3">
					<h1 class="font-display text-3xl font-bold text-text-main">{usuario.nombre}</h1>
					<Badge tone={usuario.rol === 'ADMIN' ? 'brand' : 'neutral'}>{usuario.rol}</Badge>
					<Badge tone={presentarEstadoUsuario(usuario.estado).tone}>
						{presentarEstadoUsuario(usuario.estado).label}
					</Badge>
				</div>
				<p class="mt-2 text-sm text-text-muted">Usuario de acceso: {usuario.username}</p>
			</div>
			<div class="flex gap-3">
				<Button variant="secondary" disabled={disabling} onclick={conmutarEstado}>
					{usuario.estado.toUpperCase() === 'ACTIVO' ? 'Deshabilitar' : 'Activar'}
				</Button>
				<Button variant="secondary" onclick={iniciarEdicion}>Editar</Button>
				<Button variant="ghost" onclick={() => window.history.back()}>Volver</Button>
			</div>
		</div>

		{#if saveSuccess}
			<p class="success-alert">
				{saveSuccess}
			</p>
		{/if}

		<SidePanel isOpen={editando} title="Editar usuario" onClose={cancelarEdicion}>
			<form class="grid gap-4" onsubmit={guardarCambios}>
				<FloatingTextInput label="Usuario de acceso" bind:value={editUsername} />
				<FloatingTextInput label="Nombre visible" bind:value={editNombre} />
				<FloatingTextInput label="Clave temporal" type="password" bind:value={editClave} />
				<label class="label-field">
					Rol
					<select bind:value={editRol} class="input-field">
						<option value="">Sin cambio</option>
						<option value="ASESOR">Asesor</option>
						<option value="ADMIN">Administrador</option>
					</select>
				</label>
				{#if saveError}
					<p class="error-alert">
						{saveError}
					</p>
				{/if}
				<div class="flex justify-end gap-3">
					<Button type="button" variant="ghost" onclick={cancelarEdicion}>Cancelar</Button>
					<Button type="submit" disabled={saving}>
						{saving ? 'Guardando...' : 'Guardar cambios'}
					</Button>
				</div>
			</form>
		</SidePanel>

		<div class="grid gap-5 lg:grid-cols-3">
			<Card tilt>
				<p class="stat-label">Rol</p>
				<p class="mt-3 font-display text-2xl font-bold text-text-main">{usuario.rol}</p>
				<p class="mt-1 text-sm text-text-muted">Permisos activos para navegación y API.</p>
			</Card>
			<Card tilt>
				<p class="stat-label">Estado</p>
				<p class="mt-3 font-display text-2xl font-bold text-text-main">
					{presentarEstadoUsuario(usuario.estado).label}
				</p>
				<p class="mt-1 text-sm text-text-muted">Controla si puede iniciar sesión.</p>
			</Card>
			<Card tilt>
				<p class="stat-label">Acceso</p>
				<p class="mt-3 font-display text-2xl font-bold text-text-main">@{usuario.username}</p>
				<p class="mt-1 text-sm text-text-muted">Identificador de acceso.</p>
			</Card>
		</div>

		<div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
			<Card>
				<h2 class="card-title">Información</h2>
				<dl class="dl-grid">
					<dt class="font-semibold text-text-muted">Usuario</dt>
					<dd class="text-text-main">{usuario.username}</dd>
					<dt class="font-semibold text-text-muted">Nombre</dt>
					<dd class="text-text-main">{usuario.nombre}</dd>
					<dt class="font-semibold text-text-muted">Rol</dt>
					<dd><Badge tone={usuario.rol === 'ADMIN' ? 'brand' : 'neutral'}>{usuario.rol}</Badge></dd>
					<dt class="font-semibold text-text-muted">Estado</dt>
					<dd>
						<Badge tone={presentarEstadoUsuario(usuario.estado).tone}>
							{presentarEstadoUsuario(usuario.estado).label}
						</Badge>
					</dd>
				</dl>
			</Card>

			<Card>
				<h2 class="card-title">Seguridad</h2>
				<div class="grid gap-3 text-sm">
					<div class="rounded-xl bg-surface-muted p-4">
						<p class="font-semibold text-text-main">Contraseña</p>
						<p class="mt-1 text-text-muted">
							No se muestra por seguridad. Desde el botón "Editar" puedes asignar una nueva clave
							temporal si es necesario.
						</p>
					</div>
				</div>
			</Card>
		</div>
	</div>
{/if}
