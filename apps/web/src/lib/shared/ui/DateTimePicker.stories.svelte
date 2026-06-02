<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import DateTimePicker from './DateTimePicker.svelte';
</script>

<Meta title="UI/DateTimePicker" component={DateTimePicker} />

<Story name="Default">
	<div class="flex min-h-[22rem] items-center justify-center bg-bg-base p-10">
		<div class="w-full max-w-md rounded-3xl border border-border-light bg-bg-card p-8 shadow-panel">
			<DateTimePicker />
		</div>
	</div>
</Story>

<Story name="CustomLabel">
	<div class="flex min-h-[22rem] items-center justify-center bg-bg-base p-10">
		<div class="w-full max-w-md rounded-3xl border border-border-light bg-bg-card p-8 shadow-panel">
			<DateTimePicker label="Fecha de visita" />
		</div>
	</div>
</Story>
