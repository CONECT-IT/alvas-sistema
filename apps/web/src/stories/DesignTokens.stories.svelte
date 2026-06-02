<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';

	const colors = [
		['--color-primary', '#d97706'],
		['--color-primary-dark', '#b45309'],
		['--color-primary-light', '#fef3c7'],
		['--color-accent', '#f97316'],
		['--color-danger', '#dc2626'],
		['--color-bg-base', '#fafaf7'],
		['--color-bg-card', '#ffffff'],
		['--color-text-main', '#292524'],
		['--color-text-muted', '#78716c'],
		['--color-border-light', '#e7e5e4']
	];
</script>

<Meta title="Design System/Tokens de diseno" />

<Story name="Overview">
	<section class="max-w-4xl space-y-8 rounded-2xl bg-bg-card p-8 text-text-main shadow-panel">
		<header>
			<p class="section-label">Design System</p>
			<h1 class="page-heading">Tokens de diseno</h1>
			<p class="mt-3 text-sm text-text-muted">
				ALVAS usa Tailwind v4 con variables CSS declaradas en tokens.css.
			</p>
		</header>

		<div>
			<h2 class="text-lg font-bold">Colores</h2>
			<div class="mt-4 grid gap-3 sm:grid-cols-2">
				{#each colors as [name, value] (name)}
					<div class="flex items-center gap-3 rounded-xl border border-border-light p-3">
						<span
							class="h-10 w-10 rounded-lg border border-border-light"
							style={`background:${value}`}
						>
							<span class="sr-only">{name}</span>
						</span>
						<div>
							<p class="font-mono text-xs font-semibold">{name}</p>
							<p class="font-mono text-xs text-text-muted">{value}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<div class="grid gap-4 md:grid-cols-3">
			<div class="rounded-xl border border-border-light p-4">
				<h2 class="text-sm font-bold">Tipografia</h2>
				<p class="mt-2 text-sm text-text-muted">Inter para texto general y Outfit para titulos.</p>
			</div>
			<div class="rounded-xl border border-border-light p-4">
				<h2 class="text-sm font-bold">Radios</h2>
				<p class="mt-2 text-sm text-text-muted">Control 12px, panel 24px y shell 32px.</p>
			</div>
			<div class="rounded-xl border border-border-light p-4">
				<h2 class="text-sm font-bold">Sombras</h2>
				<p class="mt-2 text-sm text-text-muted">Panel y floating para superficies elevadas.</p>
			</div>
		</div>
	</section>
</Story>
