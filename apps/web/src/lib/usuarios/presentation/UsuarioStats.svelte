<script lang="ts">
	import Card from '$lib/shared/ui/Card.svelte';
	import type { Usuario } from '../domain/models/Usuario';

	interface Props {
		usuarios: Usuario[];
	}

	let { usuarios }: Props = $props();

	const asesores = $derived(usuarios.filter((usuario) => usuario.rol === 'ASESOR').length);
	const admins = $derived(usuarios.filter((usuario) => usuario.rol === 'ADMIN').length);
	const activos = $derived(
		usuarios.filter((usuario) => usuario.estado.toUpperCase() === 'ACTIVO').length
	);
</script>

<div class="grid gap-4 md:grid-cols-3">
	<Card>
		<p class="text-sm font-medium text-text-muted">Usuarios activos</p>
		<p class="mt-3 font-display text-3xl font-bold text-text-main">{activos}</p>
		<p class="mt-1 text-xs text-text-muted">Cuentas habilitadas para operar.</p>
	</Card>
	<Card>
		<p class="text-sm font-medium text-text-muted">Asesores</p>
		<p class="mt-3 font-display text-3xl font-bold text-primary">{asesores}</p>
		<p class="mt-1 text-xs text-text-muted">Equipo comercial registrado.</p>
	</Card>
	<Card>
		<p class="text-sm font-medium text-text-muted">Administradores</p>
		<p class="mt-3 font-display text-3xl font-bold text-text-main">{admins}</p>
		<p class="mt-1 text-xs text-text-muted">Usuarios con acceso total.</p>
	</Card>
</div>
