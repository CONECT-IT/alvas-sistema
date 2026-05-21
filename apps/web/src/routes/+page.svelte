<script lang="ts">
	import { authStore } from '$lib/auth/infrastructure/authStore';

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
			<a
				href={$authStore.user?.esAdmin ? '/admin/dashboard' : '/asesor/dashboard'}
				class="rounded-xl border border-border-light bg-white px-5 py-2.5 font-display font-semibold text-text-main transition hover:border-primary/30 hover:text-primary"
			>
				Panel interno
			</a>
		{:else}
			<a
				href="/login"
				class="rounded-xl border border-border-light bg-white px-5 py-2.5 font-display font-semibold text-text-main transition hover:border-primary/30 hover:text-primary"
			>
				Acceso equipo
			</a>
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
				<a
					href="#contacto"
					class="rounded-xl bg-primary px-6 py-3 text-center font-display font-semibold text-white shadow-sm transition hover:bg-primary-dark"
				>
					Quiero que me contacten
				</a>
				<a
					href="#propiedades"
					class="rounded-xl border border-border-light bg-white px-6 py-3 text-center font-display font-semibold text-text-main transition hover:border-primary/30 hover:text-primary"
				>
					Ver proyectos
				</a>
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
					Agenda una visita
				</p>
				<h2 class="mt-2 font-display text-3xl font-bold text-text-main">
					Elige un proyecto y recibe orientación de un asesor.
				</h2>
				<p class="mt-4 max-w-2xl leading-relaxed text-text-muted">
					Deja tus datos por el canal oficial de ALVAS para revisar disponibilidad, resolver dudas y
					coordinar una visita al terreno.
				</p>
			</div>
			<div class="rounded-2xl border border-border-light bg-bg-base p-6">
				<p class="text-sm font-semibold text-text-main">Atención comercial</p>
				<p class="mt-2 text-sm leading-relaxed text-text-muted">
					Pronto conectaremos este espacio al formulario de captación. Por ahora funciona como
					bloque público para validar contenido, diseño y jerarquía.
				</p>
				<a
					href="tel:+51000000000"
					class="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 font-display font-semibold text-white transition hover:bg-primary-dark"
				>
					Llamar a ALVAS
				</a>
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
