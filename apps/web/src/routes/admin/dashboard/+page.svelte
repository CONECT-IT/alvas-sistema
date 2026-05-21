<script lang="ts">
	import { authStore } from '$lib/auth/infrastructure/authStore';
</script>

<svelte:head>
	<title>Panel de Administración | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<!-- Encabezado de la página -->
	<div class="flex flex-col gap-1">
		<h1 class="font-display text-3xl font-bold text-text-main">
			Bienvenido, {$authStore.user?.username}
		</h1>
		<p class="text-sm text-text-muted">
			Resumen del rendimiento inmobiliario general de ALVAS-Sistema.
		</p>
	</div>

	<!-- Tarjetas de métricas -->
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-3xl border border-border-light bg-white p-6 shadow-xs">
			<span class="text-xs font-semibold tracking-wider text-text-muted uppercase">Propiedades</span
			>
			<h2 class="mt-1 font-display text-3xl font-bold text-text-main">148</h2>
			<div class="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
				<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
					/></svg
				>
				<span>+12% este mes</span>
			</div>
		</div>

		<div class="rounded-3xl border border-border-light bg-white p-6 shadow-xs">
			<span class="text-xs font-semibold tracking-wider text-text-muted uppercase"
				>Leads Totales</span
			>
			<h2 class="mt-1 font-display text-3xl font-bold text-text-main">524</h2>
			<div class="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
				<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
					/></svg
				>
				<span>+18% esta semana</span>
			</div>
		</div>

		<div class="rounded-3xl border border-border-light bg-white p-6 shadow-xs">
			<span class="text-xs font-semibold tracking-wider text-text-muted uppercase"
				>Ventas del Mes</span
			>
			<h2 class="mt-1 font-display text-3xl font-bold text-text-main">$12,450 USD</h2>
			<div class="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
				<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
					/></svg
				>
				<span>+5.4% vs mes anterior</span>
			</div>
		</div>

		<div class="rounded-3xl border border-border-light bg-white p-6 shadow-xs">
			<span class="text-xs font-semibold tracking-wider text-text-muted uppercase"
				>Asesores Activos</span
			>
			<h2 class="mt-1 font-display text-3xl font-bold text-text-main">8 / 10</h2>
			<div class="mt-2 flex items-center gap-1.5 text-xs font-semibold text-text-muted">
				<span class="h-2 w-2 rounded-full bg-emerald-500"></span>
				<span>En línea ahora</span>
			</div>
		</div>
	</div>

	<!-- Grilla principal de reportes y actividad -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Panel de propiedades recientes -->
		<div class="rounded-3xl border border-border-light bg-white p-6 shadow-xs lg:col-span-2">
			<div class="mb-6 flex items-center justify-between">
				<h3 class="font-display text-lg font-bold text-text-main">
					Últimas Propiedades Registradas
				</h3>
				<a href="/admin/propiedades" class="text-sm font-semibold text-primary hover:underline"
					>Ver todas</a
				>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full border-collapse text-left">
					<thead>
						<tr class="border-b border-border-light text-xs font-semibold text-text-muted">
							<th class="pb-3">Título</th>
							<th class="pb-3">Ubicación</th>
							<th class="pb-3">Precio</th>
							<th class="pb-3">Estado</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border-light text-sm">
						<tr>
							<td class="py-3.5 font-medium text-text-main">Penthouse en Miraflores</td>
							<td class="py-3.5 text-text-muted">Lima, Perú</td>
							<td class="py-3.5 font-semibold text-primary">$350,000</td>
							<td class="py-3.5">
								<span
									class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
									>Disponible</span
								>
							</td>
						</tr>
						<tr>
							<td class="py-3.5 font-medium text-text-main">Casa de Campo en Cieneguilla</td>
							<td class="py-3.5 text-text-muted">Lima, Perú</td>
							<td class="py-3.5 font-semibold text-primary">$180,000</td>
							<td class="py-3.5">
								<span
									class="bg-amber-55 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"
									>Reservada</span
								>
							</td>
						</tr>
						<tr>
							<td class="py-3.5 font-medium text-text-main">Apartamento en San Isidro</td>
							<td class="py-3.5 text-text-muted">Lima, Perú</td>
							<td class="py-3.5 font-semibold text-primary">$210,000</td>
							<td class="py-3.5">
								<span
									class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
									>Disponible</span
								>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<!-- Panel lateral de actividad o leads -->
		<div class="flex flex-col gap-6 rounded-3xl border border-border-light bg-white p-6 shadow-xs">
			<h3 class="font-display text-lg font-bold text-text-main">Leads en Captación (Recientes)</h3>

			<div class="flex flex-col gap-4">
				<div
					class="flex items-center gap-3 border-b border-border-light pb-3 last:border-0 last:pb-0"
				>
					<div
						class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
					>
						JS
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-semibold text-text-main">Jorge Silva</p>
						<p class="truncate text-xs text-text-muted">Interés: Penthouse Miraflores</p>
					</div>
					<span class="text-xs text-text-muted">Hace 5m</span>
				</div>

				<div
					class="flex items-center gap-3 border-b border-border-light pb-3 last:border-0 last:pb-0"
				>
					<div
						class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
					>
						AM
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-semibold text-text-main">Ana Martínez</p>
						<p class="truncate text-xs text-text-muted">Interés: Casa Cieneguilla</p>
					</div>
					<span class="text-xs text-text-muted">Hace 20m</span>
				</div>

				<div
					class="flex items-center gap-3 border-b border-border-light pb-3 last:border-0 last:pb-0"
				>
					<div
						class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
					>
						RC
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-semibold text-text-main">Roberto Castro</p>
						<p class="truncate text-xs text-text-muted">Interés: Apartamento San Isidro</p>
					</div>
					<span class="text-xs text-text-muted">Hace 1h</span>
				</div>
			</div>

			<a
				href="/admin/ventas"
				class="w-full rounded-2xl bg-bg-base py-2.5 text-center text-sm font-semibold text-text-main transition hover:bg-primary hover:text-white"
			>
				Ir al CRM de Leads
			</a>
		</div>
	</div>
</div>
