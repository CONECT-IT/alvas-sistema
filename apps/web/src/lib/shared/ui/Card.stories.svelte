<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import Card from './Card.svelte';
</script>

<Meta title="UI/Card" component={Card} />

<Story name="Default">
	<div class="flex min-h-[26rem] items-center justify-center bg-bg-base p-10">
		<Card class="w-full max-w-md">
			<h3 class="font-display text-xl font-bold text-text-main">Ficha comercial</h3>
			<p class="mt-2 text-sm leading-relaxed text-text-muted">
				Resumen compacto para módulos CRM: estado, responsable y próximas acciones.
			</p>
		</Card>
	</div>
</Story>

<Story name="WithTilt">
	<div class="flex min-h-[26rem] items-center justify-center bg-bg-base p-10">
		<Card tilt class="w-full max-w-md">
			<p class="stat-label">Microinteracción</p>
			<h3 class="mt-3 font-display text-2xl font-bold text-text-main">Hover tilt</h3>
			<p class="mt-2 text-sm text-text-muted">
				Mueve el cursor sobre la tarjeta para validar profundidad y respuesta.
			</p>
		</Card>
	</div>
</Story>

<Story name="DashboardGrid">
	<div class="min-h-[32rem] bg-bg-base p-10">
		<div class="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
			<Card tilt>
				<p class="stat-label">Leads</p>
				<p class="mt-3 font-display text-3xl font-bold text-text-main">24</p>
				<p class="mt-1 text-sm text-text-muted">Prospectos activos.</p>
			</Card>
			<Card tilt>
				<p class="stat-label">Citas</p>
				<p class="mt-3 font-display text-3xl font-bold text-primary">7</p>
				<p class="mt-1 text-sm text-text-muted">Seguimientos programados.</p>
			</Card>
			<Card tilt>
				<p class="stat-label">Propiedades</p>
				<p class="mt-3 font-display text-3xl font-bold text-text-main">12</p>
				<p class="mt-1 text-sm text-text-muted">Inventario comercial.</p>
			</Card>
		</div>
	</div>
</Story>
