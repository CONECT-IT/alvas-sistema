<script lang="ts">
	import { authStore } from '$lib/auth/infrastructure/authStore';
</script>

<svelte:head>
	<title>Panel de Asesor | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<!-- Encabezado de la página -->
	<div class="flex flex-col gap-1">
		<h1 class="font-display text-3xl font-bold text-text-main">
			Hola, {$authStore.user?.username}
		</h1>
		<p class="text-sm text-text-muted">
			Organiza tu agenda comercial y haz seguimiento a tus leads asignados.
		</p>
	</div>

	<!-- Tarjetas de métricas personales -->
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-3xl border border-border-light bg-white p-6 shadow-xs">
			<span class="text-xs font-semibold tracking-wider text-text-muted uppercase"
				>Mis Leads Activos</span
			>
			<h2 class="mt-1 font-display text-3xl font-bold text-text-main">18</h2>
			<div class="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
				<span>+3 asignados hoy</span>
			</div>
		</div>

		<div class="rounded-3xl border border-border-light bg-white p-6 shadow-xs">
			<span class="text-xs font-semibold tracking-wider text-text-muted uppercase"
				>Citas Pendientes</span
			>
			<h2 class="mt-1 font-display text-3xl font-bold text-text-main">4</h2>
			<div class="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary">
				<span>Siguiente cita: 3:00 PM</span>
			</div>
		</div>

		<div class="rounded-3xl border border-border-light bg-white p-6 shadow-xs">
			<span class="text-xs font-semibold tracking-wider text-text-muted uppercase"
				>Cierres del Mes</span
			>
			<h2 class="mt-1 font-display text-3xl font-bold text-text-main">2</h2>
			<div class="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
				<span>Meta: 3 cierres</span>
			</div>
		</div>

		<div class="rounded-3xl border border-border-light bg-white p-6 shadow-xs">
			<span class="text-xs font-semibold tracking-wider text-text-muted uppercase"
				>Propiedades en Cartera</span
			>
			<h2 class="mt-1 font-display text-3xl font-bold text-text-main">15</h2>
			<div class="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
				<span>3 de alta visibilidad</span>
			</div>
		</div>
	</div>

	<!-- Grilla de Actividad e Itinerario -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Agenda de Citas del Día -->
		<div class="rounded-3xl border border-border-light bg-white p-6 shadow-xs lg:col-span-2">
			<div class="mb-6 flex items-center justify-between">
				<h3 class="font-display text-lg font-bold text-text-main">Agenda de Citas (Hoy)</h3>
				<a href="/asesor/citas" class="text-sm font-semibold text-primary hover:underline"
					>Ver calendario</a
				>
			</div>

			<div class="flex flex-col gap-4">
				<div class="flex items-start gap-4 rounded-2xl border border-border-light bg-bg-base p-4">
					<span
						class="shrink-0 rounded-xl bg-primary-light px-3 py-1.5 text-sm font-bold text-primary"
						>11:00 AM</span
					>
					<div class="min-w-0 flex-1">
						<h4 class="font-display text-sm font-bold text-text-main">
							Visita Física - Penthouse Miraflores
						</h4>
						<p class="mt-0.5 text-xs text-text-muted">
							Cliente: Jorge Silva • Tel: +51 987 654 321
						</p>
					</div>
					<span
						class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
						>Confirmado</span
					>
				</div>

				<div class="flex items-start gap-4 rounded-2xl border border-border-light bg-bg-base p-4">
					<span
						class="shrink-0 rounded-xl bg-primary-light px-3 py-1.5 text-sm font-bold text-primary"
						>03:00 PM</span
					>
					<div class="min-w-0 flex-1">
						<h4 class="font-display text-sm font-bold text-text-main">Llamada de Calificación</h4>
						<p class="mt-0.5 text-xs text-text-muted">
							Cliente: Carlos Rivas • Interés: Casa en Cieneguilla
						</p>
					</div>
					<span class="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"
						>Pendiente</span
					>
				</div>

				<div class="flex items-start gap-4 rounded-2xl border border-border-light bg-bg-base p-4">
					<span
						class="shrink-0 rounded-xl bg-primary-light px-3 py-1.5 text-sm font-bold text-primary"
						>05:30 PM</span
					>
					<div class="min-w-0 flex-1">
						<h4 class="font-display text-sm font-bold text-text-main">Firma de Reserva</h4>
						<p class="mt-0.5 text-xs text-text-muted">Cliente: María Fe • Oficina San Isidro</p>
					</div>
					<span
						class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
						>Confirmado</span
					>
				</div>
			</div>
		</div>

		<!-- Panel lateral de Mis Leads -->
		<div class="flex flex-col gap-6 rounded-3xl border border-border-light bg-white p-6 shadow-xs">
			<h3 class="font-display text-lg font-bold text-text-main">Acciones Rápidas</h3>

			<div class="flex flex-col gap-3">
				<button
					class="w-full cursor-pointer rounded-2xl bg-primary py-3 font-display text-sm font-semibold text-white shadow-xs transition hover:bg-primary-dark"
				>
					+ Registrar Nuevo Lead
				</button>
				<button
					class="w-full cursor-pointer rounded-2xl border border-border-light bg-white py-3 font-display text-sm font-semibold text-text-main transition hover:bg-bg-base"
				>
					Crear Cita de Visita
				</button>
				<a
					href="/asesor/leads"
					class="w-full rounded-2xl bg-bg-base py-3 text-center font-display text-sm font-semibold text-text-main transition hover:bg-primary hover:text-white"
				>
					Ver Todos Mis Leads
				</a>
			</div>
		</div>
	</div>
</div>
