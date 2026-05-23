<script lang="ts">
	import { fade } from 'svelte/transition';

	interface Props {
		isOpen: boolean;
		title: string;
		children?: import('svelte').Snippet;
		onClose: () => void;
	}

	let { isOpen, title, children, onClose }: Props = $props();
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex justify-end" transition:fade={{ duration: 200 }}>
		<!-- Backdrop -->
		<div
			class="absolute inset-0 bg-black/30 backdrop-blur-sm"
			onclick={onClose}
			onkeydown={(e) => e.key === 'Escape' && onClose()}
			role="button"
			tabindex="0"
			aria-label="Cerrar panel"
		></div>

		<!-- Panel -->
		<div class="relative z-50 h-full w-full max-w-lg overflow-y-auto bg-bg-base p-6 shadow-xl">
			<div class="mb-6 flex items-center justify-between">
				<h2 class="text-xl font-bold text-text-main">{title}</h2>
				<button
					class="rounded-full p-2 transition hover:bg-surface-muted"
					onclick={onClose}
					aria-label="Cerrar"
				>
					✕
				</button>
			</div>
			{@render children?.()}
		</div>
	</div>
{/if}
