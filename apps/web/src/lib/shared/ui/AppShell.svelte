<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { Snippet } from 'svelte';
	import { authStore } from '$lib/auth/infrastructure/authStore';

	interface Props {
		children: Snippet;
	}

	type SidebarItem = {
		label: string;
		href: string;
		icon:
			| 'grid'
			| 'users'
			| 'home'
			| 'trending-up'
			| 'bar-chart'
			| 'calendar'
			| 'briefcase'
			| 'file-text';
	};

	let { children }: Props = $props();
	let showMobileSidebar = $state(false);
	const shellUser = $derived($authStore.user);

	const sidebarItems = $derived.by<SidebarItem[]>(() => {
		if (!shellUser) return [];
		if (shellUser.esAdmin) {
			return [
				{ label: 'Dashboard', href: '/admin/dashboard', icon: 'grid' },
				{ label: 'Usuarios', href: '/admin/usuarios', icon: 'users' },
				{ label: 'Leads', href: '/admin/leads', icon: 'trending-up' },
				{ label: 'Clientes', href: '/admin/clientes', icon: 'briefcase' },
				{ label: 'Citas', href: '/admin/citas', icon: 'calendar' },
				{ label: 'Contratos', href: '/admin/contratos', icon: 'file-text' },
				{ label: 'Propiedades', href: '/admin/propiedades', icon: 'home' },
				{ label: 'Reportes', href: '/admin/reportes', icon: 'bar-chart' }
			];
		}

		return [
			{ label: 'Dashboard', href: '/asesor/dashboard', icon: 'grid' },
			{ label: 'Mis Leads', href: '/asesor/leads', icon: 'users' },
			{ label: 'Agenda Citas', href: '/asesor/citas', icon: 'calendar' },
			{ label: 'Contratos', href: '/asesor/contratos', icon: 'file-text' },
			{ label: 'Clientes', href: '/asesor/clientes', icon: 'briefcase' },
			{ label: 'Propiedades', href: '/asesor/propiedades', icon: 'home' }
		];
	});

	$effect(() => {
		const path = $page.url.pathname;

		if (!$authStore.loading && !$authStore.isAuthenticated) {
			goto('/login');
			return;
		}

		if ($authStore.isAuthenticated) {
			if (path.startsWith('/admin') && !$authStore.user?.esAdmin) {
				goto('/asesor/dashboard');
			} else if (path.startsWith('/asesor') && !$authStore.user?.esAsesor) {
				goto('/admin/dashboard');
			}
		}
	});

	function toggleMobileSidebar() {
		showMobileSidebar = !showMobileSidebar;
	}
</script>

{#snippet NavigationIcon(icon: SidebarItem['icon'])}
	{#if icon === 'grid'}
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
			/>
		</svg>
	{:else if icon === 'users'}
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
			/>
		</svg>
	{:else if icon === 'home'}
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
			/>
		</svg>
	{:else if icon === 'trending-up'}
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
			/>
		</svg>
	{:else if icon === 'bar-chart'}
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
			/>
		</svg>
	{:else if icon === 'briefcase'}
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10 6h4a2 2 0 012 2v1h3a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1h3V8a2 2 0 012-2zm0 3h4V8h-4v1zm-6 4h16"
			/>
		</svg>
	{:else if icon === 'file-text'}
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
			/>
		</svg>
	{/if}
{/snippet}

{#snippet SidebarNavigation(closeOnSelect = false)}
	<nav class="flex flex-col gap-2">
		{#each sidebarItems as item (item.href)}
			<a
				href={item.href}
				onclick={closeOnSelect ? toggleMobileSidebar : undefined}
				class="flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition duration-200 {$page
					.url.pathname === item.href
					? 'border-l-4 border-primary bg-primary-light text-primary-dark'
					: 'text-text-muted hover:bg-bg-base hover:text-text-main'}"
			>
				{@render NavigationIcon(item.icon)}
				<span>{item.label}</span>
			</a>
		{/each}
	</nav>
{/snippet}

{#if shellUser}
	<div class="flex min-h-screen flex-col bg-bg-base font-sans text-text-main">
		<header
			class="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border-light bg-white px-6"
		>
			<div class="flex items-center gap-3">
				<button
					class="p-2 text-text-muted transition hover:text-primary md:hidden"
					onclick={toggleMobileSidebar}
					aria-label="Abrir menú principal"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>
				<span
					class="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-primary"
				>
					<span class="h-3 w-3 animate-pulse rounded-full bg-accent"></span>
					ALVAS<span class="text-sm font-light text-text-main">Sistema</span>
				</span>
			</div>

			<div class="flex items-center gap-4">
				<div class="hidden text-right sm:block">
					<p class="text-sm leading-none font-semibold">{shellUser.nombre}</p>
					<p class="text-xs text-text-muted">{shellUser.rol}</p>
				</div>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary-light font-display font-bold text-primary-dark"
				>
					{shellUser.username.substring(0, 2).toUpperCase()}
				</div>
				<button
					onclick={() => authStore.logout()}
					class="cursor-pointer text-sm font-medium text-text-muted transition hover:text-accent"
				>
					Salir
				</button>
			</div>
		</header>

		<div class="relative flex flex-1">
			<aside
				class="fixed top-20 bottom-6 left-6 hidden w-64 flex-col justify-between rounded-3xl border border-border-light bg-white p-5 shadow-[0_10px_30px_rgba(120,113,108,0.03)] md:flex"
			>
				{@render SidebarNavigation()}
				<div class="border-t border-border-light pt-4 text-center text-xs text-text-muted">
					Operación comercial ALVAS
				</div>
			</aside>

			{#if showMobileSidebar}
				<button
					class="fixed inset-0 z-40 cursor-default border-none bg-black/30 p-0 backdrop-blur-xs md:hidden"
					onclick={toggleMobileSidebar}
					aria-label="Cerrar menú"
				></button>
				<aside
					class="fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col justify-between bg-white p-5 shadow-2xl md:hidden"
				>
					<div class="flex flex-col gap-6">
						<span class="block text-center font-display text-xl font-bold text-primary">ALVAS</span>
						{@render SidebarNavigation(true)}
					</div>
					<button
						onclick={() => {
							toggleMobileSidebar();
							authStore.logout();
						}}
						class="w-full rounded-2xl bg-accent/10 py-3 font-semibold text-accent transition hover:bg-accent hover:text-white"
					>
						Cerrar sesión
					</button>
				</aside>
			{/if}

			<main class="min-w-0 flex-1 p-6 md:pl-[20.5rem]">
				{@render children()}
			</main>
		</div>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center bg-bg-base p-6 font-sans">
		<div
			class="flex w-full max-w-md flex-col gap-4 rounded-3xl border border-border-light bg-white p-8 text-center shadow-lg"
		>
			<div
				class="mx-auto h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-primary"
			></div>
			<p class="font-medium text-text-muted">Cargando sesión segura...</p>
		</div>
	</div>
{/if}
