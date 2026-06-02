<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import FormField from './FormField.svelte';
	import TextInput from './TextInput.svelte';
	import Select from './Select.svelte';
</script>

<Meta title="UI/FormField" component={FormField} />

<Story name="WithLabel">
	<div class="flex min-h-[18rem] items-center justify-center bg-bg-base p-10">
		<div class="w-full max-w-sm">
			<FormField label="Nombre completo">
				<TextInput placeholder="Ingresa tu nombre" />
			</FormField>
		</div>
	</div>
</Story>

<Story name="WithHelp">
	<div class="flex min-h-[18rem] items-center justify-center bg-bg-base p-10">
		<div class="grid w-full max-w-sm gap-4">
			<FormField label="Correo" help="Usaremos este correo para enviar notificaciones.">
				<TextInput type="email" placeholder="correo@ejemplo.com" />
			</FormField>
		</div>
	</div>
</Story>

<Story name="WithError">
	<div class="flex min-h-[18rem] items-center justify-center bg-bg-base p-10">
		<div class="grid w-full max-w-sm gap-4">
			<FormField label="Correo" error="El correo ingresado no es válido.">
				<TextInput type="email" value="invalido" error />
			</FormField>
			<FormField label="País" error="Selecciona un país.">
				<Select error>
					<option value="" disabled>Selecciona país</option>
					<option value="pe">Perú</option>
				</Select>
			</FormField>
		</div>
	</div>
</Story>

<Story name="WithSelect">
	<div class="flex min-h-[18rem] items-center justify-center bg-bg-base p-10">
		<div class="w-full max-w-sm">
			<FormField label="Tipo de documento">
				<Select>
					<option value="" disabled>Selecciona tipo</option>
					<option value="dni">DNI</option>
					<option value="ce">Carné de extranjería</option>
				</Select>
			</FormField>
		</div>
	</div>
</Story>
