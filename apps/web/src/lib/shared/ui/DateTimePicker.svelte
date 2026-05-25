<script lang="ts">
	interface Props {
		label?: string;
		fecha?: string;
		hora?: string;
		required?: boolean;
	}

	let {
		label = 'Fecha y hora',
		fecha = $bindable(''),
		hora = $bindable(''),
		required = false
	}: Props = $props();

	const horas = Array.from({ length: 24 * 2 }, (_, index) => {
		const totalMinutos = index * 30;
		const hh = String(Math.floor(totalMinutos / 60)).padStart(2, '0');
		const mm = String(totalMinutos % 60).padStart(2, '0');
		return `${hh}:${mm}`;
	});

	function fechaLocal(offsetDias = 0): string {
		const date = new Date();
		const target = new Date(date.getTime() + offsetDias * 24 * 60 * 60 * 1000);

		const year = target.getFullYear();
		const month = String(target.getMonth() + 1).padStart(2, '0');
		const day = String(target.getDate()).padStart(2, '0');

		return `${year}-${month}-${day}`;
	}
</script>

<div class="grid gap-3">
	<div class="flex items-center justify-between gap-3">
		<span class="label-field">{label}</span>
		<div class="flex rounded-xl bg-surface-muted p-1">
			<button
				type="button"
				class="rounded-lg px-3 py-1 text-xs font-bold text-text-muted transition hover:bg-bg-card hover:text-primary"
				onclick={() => (fecha = fechaLocal())}
			>
				Hoy
			</button>
			<button
				type="button"
				class="rounded-lg px-3 py-1 text-xs font-bold text-text-muted transition hover:bg-bg-card hover:text-primary"
				onclick={() => (fecha = fechaLocal(1))}
			>
				Mañana
			</button>
		</div>
	</div>

	<div class="grid gap-3 sm:grid-cols-[1fr_0.75fr]">
		<label class="grid gap-1 text-xs font-semibold text-text-muted">
			Fecha
			<input bind:value={fecha} type="date" class="input-field" {required} />
		</label>
		<label class="grid gap-1 text-xs font-semibold text-text-muted">
			Hora
			<select bind:value={hora} class="input-field" {required}>
				<option value="">Selecciona hora</option>
				{#each horas as opcion (opcion)}
					<option value={opcion}>{opcion}</option>
				{/each}
			</select>
		</label>
	</div>
</div>
