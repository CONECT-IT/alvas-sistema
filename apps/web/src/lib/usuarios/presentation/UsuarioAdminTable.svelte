<script lang="ts">
	import Badge from '$lib/shared/ui/Badge.svelte';
	import type { Usuario } from '../domain/models/Usuario';

	interface Props {
		usuarios: Usuario[];
	}

	let { usuarios }: Props = $props();
</script>

<div class="overflow-x-auto">
	<table class="w-full min-w-[720px] border-collapse text-left">
		<thead>
			<tr class="border-b border-border-light text-xs font-semibold text-text-muted uppercase">
				<th class="pb-3">Usuario</th>
				<th class="pb-3">Nombre</th>
				<th class="pb-3">Rol</th>
				<th class="pb-3">Estado</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-border-light text-sm">
			{#each usuarios as usuario (usuario.id)}
				<tr>
					<td class="py-4 pr-6 font-semibold text-text-main">{usuario.username}</td>
					<td class="py-4 pr-6 text-text-muted">{usuario.nombre}</td>
					<td class="py-4 pr-6">
						<Badge tone={usuario.rol === 'ADMIN' ? 'brand' : 'neutral'}>{usuario.rol}</Badge>
					</td>
					<td class="py-4">
						<Badge tone={usuario.estado.toUpperCase() === 'ACTIVO' ? 'success' : 'neutral'}>
							{usuario.estado}
						</Badge>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
