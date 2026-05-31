<script lang="ts">
	import Badge from '$lib/shared/ui/Badge.svelte';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import FloatingTextInput from '$lib/shared/ui/FloatingTextInput.svelte';
	import Toggle from '$lib/shared/ui/Toggle.svelte';
	import { authStore } from '$lib/auth/infrastructure/authStore';
	import { HttpError } from '$lib/shared/http/httpClient';
	import type { Usuario } from '../domain/models/Usuario';
	import { presentarEstadoUsuario } from '$lib/shared/presentation';
	import { actualizarUsuario } from '../application/use-cases/actualizarUsuario';
	import { obtenerUsuario } from '../application/use-cases/obtenerUsuario';
	import { usuarioRepository } from '../infrastructure/usuarioRepository';

	let usuario = $state<Usuario | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let editUsername = $state('');
	let editClave = $state('');
	let saving = $state(false);
	let saveError = $state<string | null>(null);
	let saveSuccess = $state<string | null>(null);
	let mostrarEdicion = $state(false);

	const userId = $derived($authStore.user?.id ?? '');

	let tema = $state<'light' | 'dark'>('light');

	function cargarTema() {
		if (typeof localStorage !== 'undefined') {
			const guardado = localStorage.getItem('alvas-tema');
			if (guardado === 'dark' || guardado === 'light') {
				tema = guardado;
			}
		}
		aplicarTema();
	}

	function aplicarTema() {
		document.documentElement.setAttribute('data-tema', tema);
		localStorage.setItem('alvas-tema', tema);
	}

	function toggleTema() {
		tema = tema === 'light' ? 'dark' : 'light';
		aplicarTema();
	}

	async function cargar() {
		if (!userId) {
			usuario = null;
			loading = false;
			return;
		}

		loading = true;
		error = null;

		try {
			usuario = await obtenerUsuario(usuarioRepository, userId);
			if (!usuario) return;
			editUsername = usuario.username;
			editClave = '';
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudo cargar tu perfil.';
		} finally {
			loading = false;
		}
	}

	async function guardarCambios(event: SubmitEvent) {
		event.preventDefault();
		if (!usuario) return;

		saveError = null;
		saveSuccess = null;

		const username = editUsername.trim();
		const clave = editClave.trim();

		if (!username && !clave) {
			saveError = 'Indica al menos un dato para actualizar.';
			return;
		}

		if (clave && clave.length < 8) {
			saveError = 'La contraseña debe tener al menos 8 caracteres.';
			return;
		}

		saving = true;

		try {
			const actualizado = await actualizarUsuario(usuarioRepository, {
				idUsuario: usuario.id,
				username: username || undefined,
				clave: clave || undefined
			});
			usuario = actualizado;
			editClave = '';
			authStore.hydrate({
				id: actualizado.id,
				username: actualizado.username,
				nombre: actualizado.nombre,
				rol: actualizado.rol,
				estado: actualizado.estado
			});
			mostrarEdicion = false;
			saveSuccess = 'Perfil actualizado correctamente.';
		} catch (err) {
			saveError = err instanceof HttpError ? err.message : 'No se pudo actualizar el perfil.';
		} finally {
			saving = false;
		}
	}

	$effect(() => {
		if (!userId) return;
		cargar();
		cargarTema();
	});
</script>

{#if loading}
	<Card>
		<div class="skeleton"></div>
	</Card>
{:else if error}
	<Card class="text-center">
		<p class="font-display text-xl font-bold text-text-main">No se pudo cargar tu perfil</p>
		<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">{error}</p>
		<Button onclick={cargar}>Intentar nuevamente</Button>
	</Card>
{:else if usuario}
	<div class="flex flex-col gap-6">
		<div>
			<p class="section-label">Cuenta</p>
			<h1 class="page-heading">Mi perfil</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Actualiza tu usuario de acceso, contraseña y preferencias de la aplicación.
			</p>
		</div>

		{#if saveSuccess}
			<p class="success-alert">
				{saveSuccess}
			</p>
		{/if}

		{#if saveError && !mostrarEdicion}
			<p class="error-alert">{saveError}</p>
		{/if}

		<div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
			<div class="grid gap-6">
				<Card class="overflow-hidden">
					<div class="flex flex-col gap-5 sm:flex-row sm:items-center">
						<div
							class="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 font-display text-2xl font-bold text-white shadow-panel"
						>
							{usuario.username.substring(0, 2).toUpperCase()}
						</div>
						<div class="min-w-0">
							<h2 class="font-display text-2xl font-bold text-text-main">{usuario.nombre}</h2>
							<p class="mt-1 text-sm text-text-muted">{usuario.username}</p>
							<div class="mt-3 flex flex-wrap gap-2">
								<Badge tone="brand">{usuario.rol}</Badge>
								<Badge tone={presentarEstadoUsuario(usuario.estado).tone}>
									{presentarEstadoUsuario(usuario.estado).label}
								</Badge>
							</div>
						</div>
					</div>
				</Card>

				<Card>
					<div class="mb-4 flex flex-wrap items-start justify-between gap-4">
						<h2 class="font-display text-xl font-bold text-text-main">Datos de la cuenta</h2>
						<div class="relative">
							<Button
								variant="secondary"
								onclick={() => {
									mostrarEdicion = !mostrarEdicion;
									saveError = null;
									saveSuccess = null;
								}}
							>
								Editar
							</Button>
							{#if mostrarEdicion}
								<div
									class="fixed inset-0 z-40"
									onclick={() => (mostrarEdicion = false)}
									onkeydown={(e) => e.key === 'Escape' && (mostrarEdicion = false)}
									role="button"
									tabindex="0"
									aria-label="Cerrar edición"
								></div>
								<div
									class="absolute top-full right-0 z-50 mt-3 w-[22rem] rounded-2xl border border-border-light bg-bg-base p-5 shadow-xl"
									role="dialog"
									aria-label="Editar perfil"
								>
									<form class="grid gap-4" onsubmit={guardarCambios}>
										<FloatingTextInput label="Usuario de acceso" bind:value={editUsername} />
										<FloatingTextInput
											label="Nueva contraseña"
											type="password"
											bind:value={editClave}
										/>
										{#if saveError}
											<p class="error-alert">
												{saveError}
											</p>
										{/if}
										<div class="flex justify-end gap-3">
											<Button
												type="button"
												variant="ghost"
												onclick={() => (mostrarEdicion = false)}
											>
												Cancelar
											</Button>
											<Button type="submit" disabled={saving}>
												{saving ? 'Guardando...' : 'Guardar'}
											</Button>
										</div>
									</form>
								</div>
							{/if}
						</div>
					</div>
					<dl class="dl-grid">
						<dt class="font-semibold text-text-muted">Nombre</dt>
						<dd class="text-text-main">{usuario.nombre}</dd>
						<dt class="font-semibold text-text-muted">Usuario</dt>
						<dd class="text-text-main">{usuario.username}</dd>
						<dt class="font-semibold text-text-muted">ID</dt>
						<dd class="text-text-main">{usuario.id}</dd>
						<dt class="font-semibold text-text-muted">Rol</dt>
						<dd><Badge tone="brand">{usuario.rol}</Badge></dd>
						<dt class="font-semibold text-text-muted">Estado</dt>
						<dd>
							<Badge tone={presentarEstadoUsuario(usuario.estado).tone}>
								{presentarEstadoUsuario(usuario.estado).label}
							</Badge>
						</dd>
					</dl>
				</Card>
			</div>

			<Card>
				<h2 class="card-title">Preferencias</h2>
				<div class="flex flex-col gap-6">
					<div class="flex items-center justify-between">
						<div>
							<p class="font-semibold text-text-main">Tema</p>
							<p class="mt-1 text-sm text-text-muted">
								Alterna entre modo claro y oscuro para la interfaz.
							</p>
						</div>
						<Toggle checked={tema === 'dark'} label="" onchange={toggleTema} />
					</div>

					<div class="flex items-center justify-between">
						<div>
							<p class="font-semibold text-text-main">Ubicación del menú</p>
							<p class="mt-1 text-sm text-text-muted">
								Mueve el menú de navegación a la izquierda o arriba (escritorio).
							</p>
						</div>
						<div class="flex items-center rounded-xl bg-surface-muted p-1">
							<button
								onclick={() => authStore.setLayout('sidebar')}
								class="rounded-lg px-3 py-1 text-xs font-bold transition {$authStore.layout ===
								'sidebar'
									? 'bg-bg-card text-primary shadow-xs'
									: 'text-text-muted hover:text-text-main'}"
							>
								Lateral
							</button>
							<button
								onclick={() => authStore.setLayout('navbar')}
								class="rounded-lg px-3 py-1 text-xs font-bold transition {$authStore.layout ===
								'navbar'
									? 'bg-bg-card text-primary shadow-xs'
									: 'text-text-muted hover:text-text-main'}"
							>
								Superior
							</button>
						</div>
					</div>
				</div>
			</Card>
		</div>
	</div>
{/if}
