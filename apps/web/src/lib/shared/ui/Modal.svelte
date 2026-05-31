<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	interface Props {
		isOpen: boolean;
		title?: string;
		class?: string;
		onclose?: () => void;
		children: Snippet;
		actions?: Snippet;
	}

	let { isOpen, title = '', class: className = '', onclose, children, actions }: Props = $props();

	function handleBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose?.();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose?.();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
		role="presentation"
		onclick={handleBackdrop}
	>
		<div
			class="w-full max-w-lg rounded-2xl border border-border-light bg-bg-card shadow-floating {className}"
			transition:scale={{ start: 0.92, duration: 200 }}
			role="dialog"
			aria-modal="true"
			aria-label={title || 'Modal'}
		>
			{#if title}
				<div class="flex items-center justify-between border-b border-border-light px-6 py-4">
					<h2 class="font-display text-lg font-bold text-text-main">{title}</h2>
					<button
						onclick={onclose}
						class="rounded-lg p-1.5 text-text-muted transition hover:bg-surface-muted hover:text-text-main"
						aria-label="Cerrar"
					>
						<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path
								d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
							/>
						</svg>
					</button>
				</div>
			{/if}

			<div class="px-6 py-5">
				{@render children()}
			</div>

			{#if actions}
				<div class="flex justify-end gap-3 border-t border-border-light px-6 py-4">
					{@render actions()}
				</div>
			{/if}
		</div>
	</div>
{/if}
