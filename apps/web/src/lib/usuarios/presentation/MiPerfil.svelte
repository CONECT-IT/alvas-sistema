<script lang="ts">
	import Badge from '$lib/shared/ui/Badge.svelte';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import { authStore } from '$lib/auth/infrastructure/authStore';
	import { HttpError } from '$lib/shared/http/httpClient';
	import type { Usuario } from '../domain/models/Usuario';
	import { actualizarUsuario } from '../application/use-cases/actualizarUsuario';
	import { obtenerUsuario } from '../application/use-cases/obtenerUsuario';
	import { usuarioRepository } from '../infrastructure/usuarioRepository';

	let usuario = $state<Usuario | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let editUsername = $state('');
	let editNombre = $state('');
	let saving = $state(false);
	let saveError = $state<string | null>(null);
	let saveSuccess = $state<string | null>(null);

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
			editNombre = usuario.nombre;
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

		if (!editUsername.trim() && !editNombre.trim()) {
			saveError = 'Indica al menos un dato para actualizar.';
			return;
		}

		saving = true;

		try {
			const actualizado = await actualizarUsuario(usuarioRepository, {
				idUsuario: usuario.id,
				username: editUsername.trim() || undefined,
				nombre: editNombre.trim() || undefined
			});
			usuario = actualizado;
			authStore.hydrate({
				id: actualizado.id,
				username: actualizado.username,
				nombre: actualizado.nombre,
				rol: actualizado.rol,
				estado: actualizado.estado
			});
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
		<div class="h-64 animate-pulse rounded-2xl bg-surface-muted"></div>
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
			<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Cuenta</p>
			<h1 class="mt-2 font-display text-3xl font-bold text-text-main">Mi perfil</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Actualiza tu información personal y preferencias de la aplicación.
			</p>
		</div>

		{#if saveSuccess}
			<p class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
				{saveSuccess}
			</p>
		{/if}

		{#if saveError}
			<p class="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{saveError}</p>
		{/if}

		<div class="grid gap-6 xl:grid-cols-2">
			<Card>
				<h2 class="mb-4 font-display text-xl font-bold text-text-main">Datos de la cuenta</h2>
				<dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
					<dt class="font-semibold text-text-muted">ID</dt>
					<dd class="text-text-main">{usuario.id}</dd>
					<dt class="font-semibold text-text-muted">Rol</dt>
					<dd><Badge tone="brand">{usuario.rol}</Badge></dd>
					<dt class="font-semibold text-text-muted">Estado</dt>
					<dd>
						<Badge tone={usuario.estado === 'ACTIVO' ? 'success' : 'neutral'}>
							{usuario.estado}
						</Badge>
					</dd>
				</dl>
			</Card>

			<Card>
				<h2 class="mb-4 font-display text-xl font-bold text-text-main">Editar perfil</h2>
				<form class="grid gap-4" onsubmit={guardarCambios}>
					<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
						Nombre visible
						<input
							bind:value={editNombre}
							class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
						/>
					</label>
					<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
						Usuario de acceso
						<input
							bind:value={editUsername}
							class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
						/>
					</label>
					<div class="flex justify-end">
						<Button type="submit" disabled={saving}>
							{saving ? 'Guardando...' : 'Guardar cambios'}
						</Button>
					</div>
				</form>
			</Card>
		</div>

		<Card>
			<h2 class="mb-4 font-display text-xl font-bold text-text-main">Preferencias</h2>
			<div class="flex items-center justify-between">
				<div>
					<p class="font-semibold text-text-main">Tema</p>
					<p class="mt-1 text-sm text-text-muted">
						Alterna entre modo claro y oscuro para la interfaz.
					</p>
				</div>
				<button
					onclick={toggleTema}
					class="relative flex h-8 w-14 cursor-pointer items-center rounded-full bg-surface-muted p-1 transition-colors"
					aria-label="Cambiar tema"
				>
					<span
						class="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow-md transition-transform {tema ===
						'dark'
							? 'translate-x-6'
							: ''}"
					>
						{tema === 'light' ? '☀️' : '🌙'}
					</span>
				</button>
			</div>
		</Card>
	</div>
{/if}
