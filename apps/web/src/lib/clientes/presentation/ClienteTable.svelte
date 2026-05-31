<script lang="ts">
	import type { Cliente } from '../domain/models/Cliente';

	interface Props {
		clientes: Cliente[];
		onClienteClick?: (cliente: Cliente) => void;
	}

	let { clientes, onClienteClick }: Props = $props();

	function formatearFecha(fechaIso: string): string {
		return new Intl.DateTimeFormat('es-PE', {
			dateStyle: 'medium'
		}).format(new Date(fechaIso));
	}

	function etiquetaAsesor(cliente: Cliente): string {
		if (cliente.nombreAsesor) return `Asesor: ${cliente.nombreAsesor}`;
		if (cliente.idAsesor) return 'Asesor asignado';
		return 'Sin asesor asignado';
	}
</script>

<div class="overflow-x-auto">
	<table class="w-full min-w-[760px] border-collapse text-left">
		<thead>
			<tr class="border-b border-border-light text-xs font-semibold text-text-muted uppercase">
				<th class="pb-3">Cliente</th>
				<th class="pb-3">Contacto</th>
				<th class="pb-3">Origen</th>
				<th class="pb-3">Alta</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-border-light text-sm">
			{#each clientes as cliente (cliente.id)}
				<tr
					class={onClienteClick ? 'cursor-pointer transition hover:bg-bg-base' : ''}
					onclick={() => onClienteClick?.(cliente)}
					role={onClienteClick ? 'button' : undefined}
					tabindex={onClienteClick ? 0 : undefined}
					onkeydown={(e) => {
						if (e.key === 'Enter' && onClienteClick) onClienteClick(cliente);
					}}
				>
					<td class="py-4 pr-6">
						<p class="font-semibold text-text-main">{cliente.nombre}</p>
						<p class="mt-1 text-xs text-text-muted">{etiquetaAsesor(cliente)}</p>
					</td>
					<td class="py-4 pr-6">
						<p class="text-text-main">{cliente.telefono}</p>
						<p class="mt-1 text-xs text-text-muted">{cliente.email}</p>
					</td>
					<td class="py-4 pr-6 text-text-muted">
						{cliente.nombreLead ??
							(cliente.idLeadOrigen ? 'Prospecto convertido' : 'Registro directo')}
					</td>
					<td class="py-4 text-text-muted">{formatearFecha(cliente.creadoEn)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
