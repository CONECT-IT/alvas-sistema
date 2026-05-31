<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import AlvasLogo from './AlvasLogo.svelte';

	const items = ['Panel', 'Ventas', 'Clientes', 'Propiedades', 'Usuarios'];
</script>

<Meta title="UI/NavigationShell" />

<Story name="SidebarCentered">
	<div class="min-h-[38rem] bg-bg-base p-8">
		<div
			class="mx-auto flex max-w-5xl overflow-hidden rounded-3xl border border-border-light bg-bg-card shadow-panel"
		>
			<aside class="flex h-[34rem] w-28 flex-col items-center border-r border-border-light py-6">
				<AlvasLogo variant="isotype" size="lg" />
				<nav class="mt-8 flex flex-1 flex-col items-center justify-center gap-2">
					{#each items as item, index (item)}
						<a
							href="/"
							class="flex h-16 w-24 flex-col items-center justify-center rounded-xl text-xs font-semibold transition {index ===
							1
								? 'bg-primary-light text-primary shadow-sm'
								: 'text-text-muted hover:bg-surface-muted hover:text-text-main'}"
						>
							<span class="h-2 w-2 rounded-full bg-current"></span>
							<span class="mt-1">{item}</span>
						</a>
					{/each}
				</nav>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
				>
					AD
				</div>
			</aside>
			<main class="min-w-0 flex-1 p-8">
				<p class="section-label">Ventas</p>
				<h1 class="page-heading">Layout con navegación centrada</h1>
				<div class="mt-8 grid gap-5 md:grid-cols-3">
					<div class="rounded-3xl border border-border-light p-6">Stats</div>
					<div class="rounded-3xl border border-border-light p-6">Calendario</div>
					<div class="rounded-3xl border border-border-light p-6">Citas</div>
				</div>
			</main>
		</div>
	</div>
</Story>

<Story name="NavbarCentered">
	<div class="min-h-[28rem] bg-bg-base p-8">
		<div
			class="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border-light bg-bg-card shadow-panel"
		>
			<header
				class="relative flex h-16 items-center justify-between border-b border-border-light px-6"
			>
				<AlvasLogo variant="full" size="sm" />
				<nav class="absolute left-1/2 flex -translate-x-1/2 gap-1">
					{#each items.slice(0, 4) as item, index (item)}
						<a
							href="/"
							class="rounded-lg px-3 py-2 text-sm font-semibold transition {index === 1
								? 'bg-primary-light text-primary'
								: 'text-text-muted hover:bg-surface-muted hover:text-text-main'}"
						>
							{item}
						</a>
					{/each}
				</nav>
				<div class="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">AD</div>
			</header>
			<main class="p-8">
				<p class="section-label">Panel</p>
				<h1 class="page-heading">Navbar centrado</h1>
			</main>
		</div>
	</div>
</Story>
