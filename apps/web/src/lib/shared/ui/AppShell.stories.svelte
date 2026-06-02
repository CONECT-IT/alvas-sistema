<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import AlvasLogo from './AlvasLogo.svelte';

	const items = ['Panel', 'Ventas', 'Clientes', 'Propiedades'];
</script>

<Meta title="UI/AppShell" />

<Story name="SidebarLayout">
	<div class="min-h-[38rem] bg-bg-base p-8">
		<div
			class="mx-auto flex max-w-6xl overflow-hidden rounded-3xl border border-border-light bg-bg-card shadow-panel"
		>
			<aside class="flex h-[34rem] w-28 flex-col items-center border-r border-border-light py-6">
				<AlvasLogo variant="isotype" size="lg" />
				<nav class="mt-8 flex flex-1 flex-col items-center justify-center gap-2">
					{#each items as item, index (item)}
						<a
							href="/"
							class="flex h-16 w-24 flex-col items-center justify-center rounded-xl text-xs font-semibold transition {index ===
							0
								? 'bg-primary-light text-primary shadow-sm'
								: 'text-text-muted hover:bg-surface-muted hover:text-text-main'}"
						>
							<span class="h-2 w-2 rounded-full bg-current"
								><span class="sr-only">{item}</span></span
							>
							<span class="mt-1">{item}</span>
						</a>
					{/each}
				</nav>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white"
				>
					AD
				</div>
			</aside>
			<main class="min-w-0 flex-1 p-8">
				<p class="section-label">Panel</p>
				<h1 class="page-heading">Layout con sidebar</h1>
				<p class="mt-2 text-sm text-text-muted">
					Sidebar fijo con 28 iconos de ancho, navegación vertical centrada.
				</p>
				<div class="mt-8 grid gap-5 md:grid-cols-3">
					<div class="rounded-3xl border border-border-light p-6">
						<p class="stat-label">Leads</p>
						<p class="mt-2 font-display text-2xl font-bold text-text-main">24</p>
					</div>
					<div class="rounded-3xl border border-border-light p-6">
						<p class="stat-label">Citas</p>
						<p class="mt-2 font-display text-2xl font-bold text-primary">7</p>
					</div>
					<div class="rounded-3xl border border-border-light p-6">
						<p class="stat-label">Propiedades</p>
						<p class="mt-2 font-display text-2xl font-bold text-text-main">12</p>
					</div>
				</div>
			</main>
		</div>
	</div>
</Story>

<Story name="NavbarLayout">
	<div class="min-h-[28rem] bg-bg-base p-8">
		<div
			class="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border-light bg-bg-card shadow-panel"
		>
			<header
				class="relative flex h-16 items-center justify-between border-b border-border-light px-6"
			>
				<AlvasLogo variant="full" size="sm" />
				<nav class="absolute left-1/2 flex -translate-x-1/2 gap-1">
					{#each items as item, index (item)}
						<a
							href="/"
							class="rounded-lg px-3 py-2 text-sm font-semibold transition {index === 0
								? 'bg-primary-light text-primary'
								: 'text-text-muted hover:bg-surface-muted hover:text-text-main'}"
						>
							{item}
						</a>
					{/each}
				</nav>
				<div
					class="flex items-center gap-2 rounded-full border border-border-light bg-bg-card py-1 pr-3 pl-1"
				>
					<div
						class="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-bold text-white"
					>
						AD
					</div>
					<span class="text-xs font-semibold text-text-main">Admin</span>
				</div>
			</header>
			<main class="p-8">
				<p class="section-label">Ventas</p>
				<h1 class="page-heading">Layout con navbar superior</h1>
				<p class="mt-2 text-sm text-text-muted">
					Navbar horizontal centrado con avatar de usuario.
				</p>
			</main>
		</div>
	</div>
</Story>
