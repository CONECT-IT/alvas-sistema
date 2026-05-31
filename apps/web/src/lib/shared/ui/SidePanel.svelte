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
	<div class="fixed inset-0 z-50 flex justify-end p-3 sm:p-5" transition:fade={{ duration: 200 }}>
		<!-- Backdrop -->
		<div
			class="absolute inset-0 bg-black/25"
			onclick={onClose}
			onkeydown={(e) => e.key === 'Escape' && onClose()}
			role="button"
			tabindex="0"
			aria-label="Cerrar panel"
		></div>

		<!-- Panel -->
		<div
			class="relative z-50 h-full w-full max-w-lg overflow-y-auto rounded-3xl border border-border-light bg-bg-card p-6 shadow-floating"
		>
			<div class="mb-6 flex items-center justify-between border-b border-border-light pb-4">
				<h2 class="font-display text-xl font-bold text-text-main">{title}</h2>
				<button
					class="rounded-full border border-border-light bg-bg-base p-2 text-text-muted transition hover:border-primary/40 hover:text-primary"
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
