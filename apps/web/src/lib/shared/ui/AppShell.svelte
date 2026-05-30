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
		icon: string;
		color: string;
	};

	let { children }: Props = $props();
	let showMobileSidebar = $state(false);
	const shellUser = $derived($authStore.user);

	const sidebarItems = $derived.by<SidebarItem[]>(() => {
		if (!shellUser) return [];
		if (shellUser.esAdmin) {
			return [
				{
					label: 'Dashboard',
					href: '/admin/dashboard',
					icon: 'grid',
					color: 'from-amber-400 to-orange-500'
				},
				{
					label: 'Usuarios',
					href: '/admin/usuarios',
					icon: 'users',
					color: 'from-blue-400 to-indigo-500'
				},
				{
					label: 'Leads',
					href: '/admin/leads',
					icon: 'trending-up',
					color: 'from-emerald-400 to-teal-500'
				},
				{
					label: 'Captaciones',
					href: '/admin/captaciones',
					icon: 'inbox',
					color: 'from-lime-400 to-emerald-500'
				},
				{
					label: 'Clientes',
					href: '/admin/clientes',
					icon: 'briefcase',
					color: 'from-violet-400 to-purple-500'
				},
				{
					label: 'Citas',
					href: '/admin/citas',
					icon: 'calendar',
					color: 'from-pink-400 to-rose-500'
				},
				{
					label: 'Contratos',
					href: '/admin/contratos',
					icon: 'file-text',
					color: 'from-cyan-400 to-sky-500'
				},
				{
					label: 'Propiedades',
					href: '/admin/propiedades',
					icon: 'home',
					color: 'from-amber-300 to-yellow-500'
				},
				{
					label: 'Reportes',
					href: '/admin/reportes',
					icon: 'bar-chart',
					color: 'from-red-400 to-rose-500'
				}
			];
		}

		return [
			{
				label: 'Dashboard',
				href: '/asesor/dashboard',
				icon: 'grid',
				color: 'from-amber-400 to-orange-500'
			},
			{
				label: 'Mis Leads',
				href: '/asesor/leads',
				icon: 'trending-up',
				color: 'from-emerald-400 to-teal-500'
			},
			{
				label: 'Captaciones',
				href: '/asesor/captaciones',
				icon: 'inbox',
				color: 'from-lime-400 to-emerald-500'
			},
			{
				label: 'Agenda',
				href: '/asesor/citas',
				icon: 'calendar',
				color: 'from-pink-400 to-rose-500'
			},
			{
				label: 'Contratos',
				href: '/asesor/contratos',
				icon: 'file-text',
				color: 'from-cyan-400 to-sky-500'
			},
			{
				label: 'Clientes',
				href: '/asesor/clientes',
				icon: 'briefcase',
				color: 'from-violet-400 to-purple-500'
			},
			{
				label: 'Propiedades',
				href: '/asesor/propiedades',
				icon: 'home',
				color: 'from-amber-300 to-yellow-500'
			}
		];
	});

	function isActive(href: string): boolean {
		const path = $page.url.pathname;
		return path === href || path.startsWith(href + '/');
	}

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
</script>

{#snippet NavIcon(icon: string)}
	{#if icon === 'grid'}
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
			/></svg
		>
	{:else if icon === 'users'}
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
			/></svg
		>
	{:else if icon === 'home'}
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
			/></svg
		>
	{:else if icon === 'trending-up'}
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
			/></svg
		>
	{:else if icon === 'bar-chart'}
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
			/></svg
		>
	{:else if icon === 'briefcase'}
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10 6h4a2 2 0 012 2v1h3a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1h3V8a2 2 0 012-2zm0 3h4V8h-4v1zm-6 4h16"
			/></svg
		>
	{:else if icon === 'file-text'}
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
			/></svg
		>
	{:else if icon === 'calendar'}
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
			/></svg
		>
	{:else if icon === 'inbox'}
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0l-2.293 2.293A1 1 0 0117 15h-3a2 2 0 01-4 0H7a1 1 0 01-.707-.293L4 13m16 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4"
			/></svg
		>
	{/if}
{/snippet}

{#if shellUser}
	<div
		class="flex min-h-screen flex-col bg-bg-base font-sans text-text-main {$authStore.layout ===
		'sidebar'
			? 'md:flex-row'
			: ''}"
	>
		<!-- Sidebar - Desktop (Only if layout is 'sidebar') -->
		{#if $authStore.layout === 'sidebar'}
			<aside
				class="fixed top-0 left-0 z-50 hidden h-screen w-28 flex-col items-center gap-2 border-r border-border-light/50 bg-bg-base/80 py-6 backdrop-blur-xl md:flex"
			>
				<!-- Logo -->
				<a
					href={shellUser.esAdmin ? '/admin/dashboard' : '/asesor/dashboard'}
					class="mb-6 flex h-10 w-10 items-center justify-center"
				>
					<span
						class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white shadow-lg shadow-amber-500/20"
						>A</span
					>
				</a>

				<!-- Navigation items with blur balls -->
				<nav class="no-scrollbar flex flex-1 flex-col items-center gap-1 overflow-y-auto">
					{#each sidebarItems as item (item.href)}
						<a
							href={item.href}
							class="group relative flex h-16 w-24 flex-col items-center justify-center gap-0.5 rounded-xl transition-all duration-300"
							title={item.label}
						>
							<!-- Blur ball background on hover/active -->
							<div
								class="absolute inset-0 rounded-full bg-gradient-to-br opacity-0 blur-xl transition-all duration-500 group-hover:opacity-60 {isActive(
									item.href
								)
									? 'scale-110 opacity-80'
									: 'group-hover:scale-105'} {item.color}"
							></div>
							<!-- Subtle background -->
							<div
								class="absolute inset-0 rounded-xl transition-all duration-300 group-hover:bg-bg-card/10 {isActive(
									item.href
								)
									? 'bg-bg-card/20'
									: ''}"
							></div>

							<!-- Icon + Label -->
							<span
								class="relative z-10 flex flex-col items-center gap-0.5 transition-all duration-300 {isActive(
									item.href
								)
									? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
									: 'text-text-muted group-hover:text-text-main group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]'}"
							>
								{@render NavIcon(item.icon)}
								<span class="text-[10px] leading-tight font-semibold tracking-tight">
									{item.label}
								</span>
							</span>
						</a>
					{/each}
				</nav>

				<!-- User section at bottom -->
				<div class="mt-auto flex flex-col items-center gap-3 pt-4">
					<a
						href={shellUser.esAdmin ? '/admin/perfil' : '/asesor/perfil'}
						class="group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300"
						title={shellUser.nombre}
					>
						<div
							class="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 opacity-0 blur-lg transition-all duration-300 group-hover:opacity-60"
						></div>
						<div
							class="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white shadow-md"
						>
							{shellUser.username.substring(0, 2).toUpperCase()}
						</div>
					</a>

					<button
						onclick={() => authStore.logout()}
						class="group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300"
						title="Cerrar sesión"
					>
						<div
							class="absolute inset-0 rounded-xl bg-gradient-to-br from-red-400/20 to-rose-500/20 opacity-0 blur-lg transition-all duration-300 group-hover:opacity-60"
						></div>
						<svg
							class="relative z-10 h-5 w-5 text-text-muted transition-all duration-300 group-hover:text-red-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
							/>
						</svg>
					</button>
				</div>
			</aside>
		{:else}
			<!-- Navbar - Desktop (Only if layout is 'navbar') -->
			<header
				class="sticky top-0 z-50 hidden h-16 w-full items-center justify-between border-b border-border-light/50 bg-bg-base/80 px-8 backdrop-blur-xl md:flex"
			>
				<div class="flex items-center gap-8">
					<a
						href={shellUser.esAdmin ? '/admin/dashboard' : '/asesor/dashboard'}
						class="flex items-center gap-2"
					>
						<span
							class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white shadow-md shadow-amber-500/10"
							>A</span
						>
						<span class="font-display text-lg font-bold tracking-tight">ALVAS</span>
					</a>

					<nav class="flex items-center gap-1">
						{#each sidebarItems as item (item.href)}
							<a
								href={item.href}
								class="group relative flex h-10 items-center gap-2 rounded-lg px-3 transition-all duration-200 {isActive(
									item.href
								)
									? 'bg-primary-light/10 text-primary'
									: 'text-text-muted hover:bg-surface-muted hover:text-text-main'}"
							>
								{@render NavIcon(item.icon)}
								<span class="text-sm font-semibold tracking-tight">{item.label}</span>
								{#if isActive(item.href)}
									<div
										class="absolute right-2 -bottom-[17px] left-2 h-0.5 rounded-full bg-primary"
									></div>
								{/if}
							</a>
						{/each}
					</nav>
				</div>

				<div class="flex items-center gap-4">
					<a
						href={shellUser.esAdmin ? '/admin/perfil' : '/asesor/perfil'}
						class="flex items-center gap-2 rounded-full border border-border-light bg-bg-card py-1.5 pr-4 pl-1.5 transition hover:border-primary/30"
					>
						<div
							class="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-bold text-white"
						>
							{shellUser.username.substring(0, 2).toUpperCase()}
						</div>
						<span class="text-xs font-semibold text-text-main">{shellUser.nombre}</span>
					</a>
					<button
						onclick={() => authStore.logout()}
						class="rounded-lg p-2 text-text-muted transition hover:bg-red-50 hover:text-red-500"
						title="Cerrar sesión"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
							/>
						</svg>
					</button>
				</div>
			</header>
		{/if}

		<!-- Mobile header -->
		<header
			class="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border-light bg-bg-card/80 px-4 backdrop-blur-md md:hidden"
		>
			<button
				onclick={() => (showMobileSidebar = !showMobileSidebar)}
				class="p-2 text-text-muted"
				aria-label="Menú"
			>
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/></svg
				>
			</button>
			<span class="flex items-center gap-2 font-display text-lg font-bold">
				<span
					class="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white"
					>A</span
				>
				ALVAS
			</span>
			<div
				class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white"
			>
				{shellUser.username.substring(0, 2).toUpperCase()}
			</div>
		</header>

		<!-- Mobile sidebar overlay -->
		{#if showMobileSidebar}
			<div
				class="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm md:hidden"
				role="button"
				tabindex="-1"
				onclick={() => (showMobileSidebar = false)}
				onkeydown={() => (showMobileSidebar = false)}
			></div>
			<aside
				class="fixed top-0 left-0 z-50 flex h-full w-64 flex-col gap-2 bg-bg-card p-6 shadow-2xl md:hidden"
			>
				<div class="mb-6 flex items-center gap-3">
					<span
						class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white"
						>A</span
					>
					<span class="font-display text-lg font-bold">ALVAS</span>
				</div>
				<nav class="flex flex-1 flex-col gap-1">
					{#each sidebarItems as item (item.href)}
						<a
							href={item.href}
							onclick={() => (showMobileSidebar = false)}
							class="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all duration-200 {isActive(
								item.href
							)
								? 'bg-primary-light/20 text-primary'
								: 'text-text-muted hover:bg-surface-muted hover:text-text-main'}"
						>
							{@render NavIcon(item.icon)}
							{item.label}
						</a>
					{/each}
				</nav>
				<div class="border-t border-border-light pt-4">
					<p class="text-xs text-text-muted">{shellUser.nombre} · {shellUser.rol}</p>
					<button
						onclick={() => {
							showMobileSidebar = false;
							authStore.logout();
						}}
						class="mt-3 w-full rounded-xl bg-red-50 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
					>
						Cerrar sesión
					</button>
				</div>
			</aside>
		{/if}

		<!-- Main content -->
		<main
			class="min-h-screen w-full min-w-0 flex-1 {$authStore.layout === 'sidebar' ? 'md:ml-28' : ''}"
		>
			<div class="mx-auto max-w-7xl p-4 md:p-8">
				{@render children()}
			</div>
		</main>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center bg-bg-base p-6 font-sans">
		<div
			class="flex max-w-md flex-col items-center gap-4 rounded-3xl border border-border-light bg-bg-card p-8 text-center shadow-lg"
		>
			<div class="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-amber-500"></div>
			<p class="font-medium text-text-muted">Cargando sesión segura...</p>
		</div>
	</div>
{/if}

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
