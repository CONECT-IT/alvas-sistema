<script lang="ts">
	import Button from '$lib/shared/ui/Button.svelte';
	import { authStore } from '$lib/auth/infrastructure/authStore';
	import { HttpError } from '$lib/shared/http/httpClient';
	import { registrarCaptacionVendedor } from '$lib/captaciones/application/use-cases/registrarCaptacionVendedor';
	import { captacionRepository } from '$lib/captaciones/infrastructure/captacionRepository';

	const propiedades = [
		{
			titulo: 'Residencial Alto Pocollay',
			zona: 'Pocollay',
			tipo: 'Lotes urbanos',
			precio: 'Desde S/ 72,000',
			estado: 'Disponible',
			asesor: 'Mariana Quispe',
			detalle: 'Lotes con acceso rápido a vías principales y servicios cercanos.'
		},
		{
			titulo: 'Condominio Valle Sur',
			zona: 'Calana',
			tipo: 'Terrenos familiares',
			precio: 'Desde S/ 96,500',
			estado: 'Separaciones abiertas',
			asesor: 'Diego Ramos',
			detalle: 'Espacios pensados para vivienda familiar en una zona tranquila.'
		},
		{
			titulo: 'Proyecto Mirador Tacna',
			zona: 'Gregorio Albarracín',
			tipo: 'Predios de inversión',
			precio: 'Consultar disponibilidad',
			estado: 'Últimas unidades',
			asesor: 'Lucía Vargas',
			detalle: 'Alternativas para inversión con acompañamiento comercial personalizado.'
		}
	];

	const asesores = [
		{ nombre: 'Mariana Quispe', zona: 'Pocollay', enfoque: 'Primera vivienda' },
		{ nombre: 'Diego Ramos', zona: 'Calana', enfoque: 'Terrenos familiares' },
		{ nombre: 'Lucía Vargas', zona: 'Cono Sur', enfoque: 'Inversión inmobiliaria' }
	];

	let nombreVendedor = $state('');
	let telefonoVendedor = $state('');
	let emailVendedor = $state('');
	let tituloPropiedad = $state('');
	let descripcionPropiedad = $state('');
	let precioEstimado = $state('');
	let enviandoCaptacion = $state(false);
	let captacionError = $state<string | null>(null);
	let captacionOk = $state<string | null>(null);

	function limpiarCaptacion() {
		nombreVendedor = '';
		telefonoVendedor = '';
		emailVendedor = '';
		tituloPropiedad = '';
		descripcionPropiedad = '';
		precioEstimado = '';
	}

	async function enviarCaptacionVendedor(event: SubmitEvent) {
		event.preventDefault();
		captacionError = null;
		captacionOk = null;

		if (
			!nombreVendedor.trim() ||
			!telefonoVendedor.trim() ||
			!tituloPropiedad.trim() ||
			!descripcionPropiedad.trim()
		) {
			captacionError = 'Completa tus datos de contacto y la información base de la propiedad.';
			return;
		}

		const precio = precioEstimado.trim() ? Number(precioEstimado) : undefined;

		if (precio !== undefined && (Number.isNaN(precio) || precio < 0)) {
			captacionError = 'Ingresa un precio estimado válido.';
			return;
		}

		enviandoCaptacion = true;

		try {
			await registrarCaptacionVendedor(captacionRepository, {
				nombre: nombreVendedor.trim(),
				telefono: telefonoVendedor.trim(),
				email: emailVendedor.trim() || undefined,
				tituloPropiedad: tituloPropiedad.trim(),
				descripcionPropiedad: descripcionPropiedad.trim(),
				precioEstimado: precio
			});
			captacionOk =
				'Recibimos tu propiedad. Un asesor de ALVAS la revisará antes de hacerla disponible.';
			limpiarCaptacion();
		} catch (err) {
			captacionError =
				err instanceof HttpError
					? err.message
					: 'No se pudo registrar la captación. Intenta nuevamente.';
		} finally {
			enviandoCaptacion = false;
		}
	}
</script>

<svelte:head>
	<title>ALVAS | Proyectos inmobiliarios en Tacna</title>
	<meta
		name="description"
		content="Encuentra terrenos y proyectos inmobiliarios de ALVAS con asesoría personalizada en Tacna."
	/>
</svelte:head>

<header class="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6">
	<a href="/" class="font-display text-2xl font-bold tracking-tight text-primary">
		ALVAS<span class="text-base font-light text-text-main">Inmobiliaria</span>
	</a>
	<nav class="flex items-center gap-3">
		<a
			href="#propiedades"
			class="hidden text-sm font-medium text-text-muted hover:text-primary sm:block"
		>
			Propiedades
		</a>
		<a
			href="#asesores"
			class="hidden text-sm font-medium text-text-muted hover:text-primary sm:block"
		>
			Asesores
		</a>
		<a
			href="#contacto"
			class="hidden text-sm font-medium text-text-muted hover:text-primary sm:block"
		>
			Contacto
		</a>
		{#if $authStore.isAuthenticated}
			<Button
				href={$authStore.user?.esAdmin ? '/admin/dashboard' : '/asesor/dashboard'}
				variant="secondary"
				class="px-5 py-2.5"
			>
				Panel interno
			</Button>
		{:else}
			<Button href="/login" variant="secondary" class="px-5 py-2.5">Acceso equipo</Button>
		{/if}
	</nav>
</header>

<main class="flex-1">
	<section class="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center px-6 py-10">
		<div class="max-w-3xl">
			<p class="mb-4 text-sm font-semibold tracking-[0.18em] text-primary uppercase">
				Terrenos y proyectos en Tacna
			</p>
			<h1 class="font-display text-4xl leading-tight font-bold text-text-main sm:text-6xl">
				Encuentra un terreno para construir, vivir o invertir con ALVAS.
			</h1>
			<p class="mt-6 max-w-xl text-lg leading-relaxed text-text-muted">
				Te acompañamos con proyectos disponibles, información clara y asesores que conocen cada zona
				para ayudarte a tomar una mejor decisión.
			</p>
			<div class="mt-8 flex flex-col gap-3 sm:flex-row">
				<Button href="#contacto" class="px-6">Quiero que me contacten</Button>
				<Button href="#propiedades" variant="secondary" class="px-6">Ver proyectos</Button>
			</div>
		</div>
	</section>

	<section id="propiedades" class="border-y border-border-light bg-white py-16">
		<div class="mx-auto max-w-7xl px-6">
			<div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
				<div>
					<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
						Proyectos activos
					</p>
					<h2 class="mt-2 font-display text-3xl font-bold text-text-main">
						Propiedades disponibles para visitar
					</h2>
				</div>
			</div>

			<div class="grid gap-5 md:grid-cols-3">
				{#each propiedades as propiedad (propiedad.titulo)}
					<article class="rounded-2xl border border-border-light bg-bg-base p-5">
						<div class="mb-5 h-36 rounded-xl bg-[linear-gradient(135deg,#ffedd5,#fef3c7)]"></div>
						<div class="flex items-start justify-between gap-3">
							<div>
								<h3 class="font-display text-xl font-semibold">{propiedad.titulo}</h3>
								<p class="mt-1 text-sm text-text-muted">{propiedad.zona}</p>
							</div>
							<span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary">
								{propiedad.estado}
							</span>
						</div>
						<dl class="mt-5 grid grid-cols-2 gap-3 text-sm">
							<div>
								<dt class="text-text-muted">Tipo</dt>
								<dd class="font-semibold">{propiedad.tipo}</dd>
							</div>
							<div>
								<dt class="text-text-muted">Precio</dt>
								<dd class="font-semibold">{propiedad.precio}</dd>
							</div>
						</dl>
						<p class="mt-4 text-sm leading-relaxed text-text-muted">{propiedad.detalle}</p>
						<p class="mt-5 text-sm text-text-muted">Asesor: {propiedad.asesor}</p>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<section id="asesores" class="mx-auto max-w-7xl px-6 py-16">
		<div class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
			<div>
				<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
					Asesoría personalizada
				</p>
				<h2 class="mt-2 font-display text-3xl font-bold text-text-main">
					Conversa con alguien que conoce la zona
				</h2>
				<p class="mt-4 leading-relaxed text-text-muted">
					Nuestro equipo te orienta sobre disponibilidad, precios, visitas y condiciones de
					separación según el proyecto que te interese.
				</p>
			</div>
			<div class="grid gap-4">
				{#each asesores as asesor (asesor.nombre)}
					<article class="rounded-2xl border border-border-light bg-white p-5">
						<div class="flex items-center justify-between gap-4">
							<div>
								<h3 class="font-display text-lg font-semibold">{asesor.nombre}</h3>
								<p class="text-sm text-text-muted">Zona: {asesor.zona}</p>
							</div>
							<span
								class="rounded-xl bg-primary-light px-4 py-2 text-sm font-semibold text-primary-dark"
							>
								{asesor.enfoque}
							</span>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<section id="contacto" class="border-t border-border-light bg-white py-16">
		<div class="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-[1fr_0.9fr] md:items-center">
			<div>
				<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
					Compra o venta asistida
				</p>
				<h2 class="mt-2 font-display text-3xl font-bold text-text-main">
					¿Quieres vender una propiedad con ALVAS?
				</h2>
				<p class="mt-4 max-w-2xl leading-relaxed text-text-muted">
					Registra tus datos y una descripción inicial. La propiedad entra como captación
					preliminar, no se publica ni se ofrece a compradores hasta que el equipo la valide.
				</p>
			</div>
			<div class="rounded-2xl border border-border-light bg-bg-base p-6">
				<form class="grid gap-4" onsubmit={enviarCaptacionVendedor}>
					<div class="grid gap-3 sm:grid-cols-2">
						<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
							Nombre
							<input
								bind:value={nombreVendedor}
								class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal transition outline-none focus:border-primary"
								placeholder="Tu nombre"
							/>
						</label>
						<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
							Teléfono
							<input
								bind:value={telefonoVendedor}
								class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal transition outline-none focus:border-primary"
								placeholder="Número de contacto"
							/>
						</label>
					</div>

					<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
						Correo opcional
						<input
							bind:value={emailVendedor}
							type="email"
							class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal transition outline-none focus:border-primary"
							placeholder="correo@ejemplo.com"
						/>
					</label>

					<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
						Propiedad
						<input
							bind:value={tituloPropiedad}
							class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal transition outline-none focus:border-primary"
							placeholder="Terreno, casa, local o predio"
						/>
					</label>

					<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
						Descripción inicial
						<textarea
							bind:value={descripcionPropiedad}
							rows="4"
							class="resize-none rounded-2xl border border-border-light bg-white px-4 py-3 font-normal transition outline-none focus:border-primary"
							placeholder="Zona, metraje aproximado, referencias y condiciones conocidas."
						></textarea>
					</label>

					<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
						Precio estimado opcional
						<input
							bind:value={precioEstimado}
							type="number"
							min="0"
							step="0.01"
							class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal transition outline-none focus:border-primary"
							placeholder="Monto referencial"
						/>
					</label>

					{#if captacionOk}
						<p class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
							{captacionOk}
						</p>
					{/if}

					{#if captacionError}
						<p class="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
							{captacionError}
						</p>
					{/if}

					<Button type="submit" disabled={enviandoCaptacion}>
						{enviandoCaptacion ? 'Enviando...' : 'Enviar propiedad para evaluación'}
					</Button>
				</form>
			</div>
		</div>
	</section>
</main>

<footer
	class="mx-auto flex w-full max-w-7xl flex-col items-center justify-between border-t border-border-light px-6 py-6 text-sm text-text-muted sm:flex-row"
>
	<p>ALVAS · Proyectos inmobiliarios</p>
	<p>Terrenos, visitas y asesoría comercial</p>
</footer>
