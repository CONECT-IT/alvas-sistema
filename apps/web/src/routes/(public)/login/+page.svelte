<script lang="ts">
	import Button from '$lib/shared/ui/Button.svelte';

	let { form } = $props();
</script>

<svelte:head>
	<title>Iniciar Sesión | ALVAS-Sistema</title>
	<meta
		name="description"
		content="Inicia sesión en tu cuenta de ALVAS-Sistema para gestionar tus propiedades y leads."
	/>
</svelte:head>

<div class="relative flex flex-1 items-center justify-center bg-bg-base p-6">
	<!-- Decoración en gradiente de fondo -->
	<div
		class="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 bg-radial from-primary/10 via-transparent to-transparent blur-3xl"
	></div>

	<div
		class="relative w-full max-w-md overflow-hidden rounded-3xl border border-border-light bg-bg-card p-8 shadow-xl"
	>
		<!-- Decoración superior (Línea naranja sutil) -->
		<div class="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-primary to-accent"></div>

		<div class="mb-8 text-center">
			<a
				href="/"
				class="mb-2 inline-block font-display text-3xl font-bold tracking-tight text-primary"
			>
				ALVAS<span class="text-xl font-light text-text-main">Sistema</span>
			</a>
			<p class="text-sm text-text-muted">Introduce tus credenciales para ingresar</p>
		</div>

		<form method="POST" class="flex flex-col gap-5">
			{#if form?.message}
				<div
					class="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600"
				>
					<svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/></svg
					>
					<span>{form.message}</span>
				</div>
			{/if}

			<!-- Campo de Usuario -->
			<div class="flex flex-col gap-1.5">
				<label for="username" class="text-sm font-semibold text-text-main">Usuario</label>
				<input
					type="text"
					id="username"
					name="username"
					required
					placeholder="Ej. admin, asesor1"
					class="w-full rounded-2xl border border-border-light bg-bg-card px-4 py-3 text-text-main transition focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
				/>
			</div>

			<!-- Campo de Contraseña -->
			<div class="flex flex-col gap-1.5">
				<label for="password" class="text-sm font-semibold text-text-main">Contraseña</label>
				<input
					type="password"
					id="password"
					name="clave"
					required
					placeholder="••••••••"
					class="w-full rounded-2xl border border-border-light bg-bg-card px-4 py-3 text-text-main transition focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
				/>
			</div>

			<!-- Botón de Envío -->
			<Button
				type="submit"
				class="mt-2 w-full gap-2 rounded-2xl py-3.5 font-bold shadow-md hover:shadow-lg disabled:opacity-50"
			>
				Entrar al sistema
			</Button>
		</form>

		<div class="mt-8 border-t border-border-light pt-4 text-center">
			<a href="/" class="text-sm font-medium text-text-muted transition hover:text-primary"
				>← Volver al inicio</a
			>
		</div>
	</div>
</div>
