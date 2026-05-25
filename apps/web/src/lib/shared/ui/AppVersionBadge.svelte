<script lang="ts">
	import { PUBLIC_APP_COMMIT, PUBLIC_APP_ENV, PUBLIC_APP_VERSION } from '$env/static/public';

	const entorno = PUBLIC_APP_ENV || 'local';
	const version = PUBLIC_APP_VERSION || 'dev';
	const commit = PUBLIC_APP_COMMIT || '';
	const esProduccion = entorno === 'production';
</script>

<div
	class="fixed right-3 bottom-3 z-[9998] max-w-[calc(100vw-1.5rem)] rounded-full border border-border-light bg-bg-card/85 px-3 py-1 text-[10px] font-semibold text-text-muted shadow-sm backdrop-blur"
	aria-label={`Version ${version}`}
>
	<span class={esProduccion ? 'text-text-main' : 'text-primary'}>{entorno}</span>
	<span class="mx-1 text-border-light">/</span>
	<span>{version}</span>
	{#if commit}
		<span class="ml-1 opacity-70">{commit}</span>
	{/if}
</div>
