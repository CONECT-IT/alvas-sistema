<script lang="ts">
	import Button from '$lib/shared/ui/Button.svelte';

	let { form } = $props();
	let mostrarClave = $state(false);
</script>

<svelte:head>
	<title>Iniciar Sesión | ALVAS-Sistema</title>
	<meta
		name="description"
		content="Inicia sesión en tu cuenta de ALVAS-Sistema para gestionar tus propiedades y leads."
	/>
</svelte:head>

<div class="flex min-h-screen bg-bg-base">
	<section
		class="relative hidden w-[44%] overflow-hidden border-r border-border-light bg-bg-card px-10 py-12 lg:block"
	>
		<div
			class="absolute inset-0 bg-[linear-gradient(145deg,rgba(217,119,6,0.24),rgba(249,115,22,0.12)_36%,rgba(28,25,23,0.02)_68%),radial-gradient(circle_at_30%_22%,rgba(254,243,199,0.55),transparent_34%),radial-gradient(circle_at_74%_70%,rgba(217,119,6,0.28),transparent_32%),repeating-linear-gradient(135deg,rgba(217,119,6,0.16)_0_1px,transparent_1px_22px)]"
		></div>
		<div
			class="absolute inset-8 rounded-[2rem] border border-border-light/70 bg-bg-card/15 backdrop-blur-[1px]"
		></div>
		<div class="absolute right-12 bottom-12 left-12 grid grid-cols-3 gap-3 opacity-80">
			<div
				class="h-36 rounded-2xl border border-border-light/70 bg-bg-card/40 backdrop-blur-sm"
			></div>
			<div class="h-36 rounded-2xl border border-primary/40 bg-primary/15 backdrop-blur-sm"></div>
			<div
				class="h-36 rounded-2xl border border-border-light/70 bg-bg-card/40 backdrop-blur-sm"
			></div>
		</div>

		<a href="/" class="relative z-10 flex items-center gap-3">
			<span
				class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary font-display text-lg font-bold text-white shadow-sm"
			>
				A
			</span>
			<span class="font-display text-2xl font-bold tracking-tight text-text-main">ALVAS</span>
		</a>
	</section>

	<div class="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
		<div class="w-full max-w-md">
			<div class="mb-8 lg:hidden">
				<a href="/" class="flex items-center gap-3">
					<span
						class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary font-display text-lg font-bold text-white shadow-sm"
					>
						A
					</span>
					<span class="font-display text-2xl font-bold tracking-tight text-text-main">ALVAS</span>
				</a>
			</div>

			<div class="rounded-3xl border border-border-light bg-bg-card p-6 shadow-panel sm:p-8">
				<div class="mb-8">
					<p class="section-label">Inicio de sesión</p>
					<h2 class="mt-3 font-display text-3xl font-bold tracking-tight text-text-main">
						Ingresa al sistema
					</h2>
					<p class="mt-2 text-sm leading-6 text-text-muted">
						Usa tu usuario interno para continuar con la gestión comercial.
					</p>
				</div>

				<form method="POST" class="flex flex-col gap-5">
					{#if form?.message}
						<div class="error-alert">{form.message}</div>
					{/if}

					<div class="flex flex-col gap-1.5">
						<label for="username" class="text-sm font-semibold text-text-main">Usuario</label>
						<input
							type="text"
							id="username"
							name="username"
							required
							autocomplete="username"
							placeholder="admin o asesor"
							class="w-full rounded-2xl border border-border-light bg-bg-card px-4 py-3 text-text-main transition focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
						/>
					</div>

					<div class="flex flex-col gap-1.5">
						<label for="password" class="text-sm font-semibold text-text-main">Contraseña</label>
						<div class="relative">
							<input
								type={mostrarClave ? 'text' : 'password'}
								id="password"
								name="clave"
								required
								autocomplete="current-password"
								placeholder="Ingresa tu contraseña"
								class="w-full rounded-2xl border border-border-light bg-bg-card py-3 pr-12 pl-4 text-text-main transition focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
							/>
							<button
								type="button"
								class="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-text-muted transition hover:bg-surface-muted hover:text-text-main focus:ring-2 focus:ring-primary/20 focus:outline-none"
								aria-label={mostrarClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
								aria-pressed={mostrarClave}
								onclick={() => (mostrarClave = !mostrarClave)}
							>
								{#if mostrarClave}
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M3 3l18 18M10.7 5.1A10.7 10.7 0 0121 12c-.5 1.2-1.3 2.4-2.2 3.4M6.5 6.5A11.5 11.5 0 003 12c1.8 4.1 5.1 6.5 9 6.5 1.2 0 2.3-.2 3.3-.7M9.9 9.9a3 3 0 004.2 4.2"
										/>
									</svg>
								{:else}
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 15a3 3 0 100-6 3 3 0 000 6z"
										/>
									</svg>
								{/if}
							</button>
						</div>
					</div>

					<Button
						type="submit"
						class="mt-2 w-full gap-2 rounded-2xl py-3.5 font-bold shadow-md hover:shadow-lg disabled:opacity-50"
					>
						Entrar al sistema
					</Button>
				</form>

				<div class="mt-8 border-t border-border-light pt-4 text-center">
					<a href="/" class="text-sm font-medium text-text-muted transition hover:text-primary">
						Volver al inicio
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
