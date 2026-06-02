<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';
</script>

<Meta title="Design System/Empezar" />

<Story name="Overview">
	<section class="max-w-3xl space-y-6 rounded-2xl bg-bg-card p-8 text-text-main shadow-panel">
		<header>
			<p class="section-label">Design System</p>
			<h1 class="page-heading">Empezar</h1>
			<p class="mt-3 text-sm text-text-muted">
				El sistema de diseno de ALVAS esta construido con Svelte 5 y Tailwind v4.
			</p>
		</header>

		<div class="rounded-xl border border-border-light p-5">
			<h2 class="text-sm font-bold">Importacion</h2>
			<pre class="mt-3 overflow-auto rounded-xl border border-border-light bg-bg-base p-4 text-xs"><code>{`import Button from '$lib/shared/ui/Button.svelte';
import TextInput from '$lib/shared/ui/TextInput.svelte';`}</code></pre>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="rounded-xl border border-border-light p-5">
				<h2 class="text-sm font-bold">Convenciones</h2>
				<ul class="mt-3 space-y-2 text-sm text-text-muted">
					<li>Componentes con $props() de Svelte 5.</li>
					<li>Eventos como props, por ejemplo onclick.</li>
					<li>Estilos con Tailwind y tokens CSS.</li>
				</ul>
			</div>
			<div class="rounded-xl border border-border-light p-5">
				<h2 class="text-sm font-bold">Dark mode</h2>
				<p class="mt-3 text-sm text-text-muted">
					Se activa con data-tema="dark" en el elemento html.
				</p>
			</div>
		</div>
	</section>
</Story>
