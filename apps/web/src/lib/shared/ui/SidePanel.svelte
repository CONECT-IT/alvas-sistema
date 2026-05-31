<script lang="ts">
	import { gsap } from 'gsap';
	import { fade } from 'svelte/transition';

	interface Props {
		isOpen: boolean;
		title: string;
		children?: import('svelte').Snippet;
		onClose: () => void;
		sourceRect?: DOMRect | null;
	}

	let { isOpen, title, children, onClose, sourceRect = null }: Props = $props();
	let panelRef: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (!isOpen || !panelRef) return;

		const target = panelRef.getBoundingClientRect();
		const startX = sourceRect
			? sourceRect.left + sourceRect.width / 2 - (target.left + target.width / 2)
			: 48;
		const startY = sourceRect
			? sourceRect.top + sourceRect.height / 2 - (target.top + target.height / 2)
			: 16;
		const scaleX = sourceRect ? Math.max(sourceRect.width / target.width, 0.08) : 0.88;
		const scaleY = sourceRect ? Math.max(sourceRect.height / target.height, 0.08) : 0.88;

		gsap.fromTo(
			panelRef,
			{
				opacity: 0,
				x: startX,
				y: startY,
				scaleX,
				scaleY,
				borderRadius: sourceRect ? `${Math.max(sourceRect.height / 2, 16)}px` : '999px'
			},
			{
				opacity: 1,
				x: 0,
				y: 0,
				scale: 1,
				scaleX: 1,
				scaleY: 1,
				borderRadius: '1.5rem',
				duration: 0.52,
				ease: 'power3.out',
				clearProps: 'transform,borderRadius'
			}
		);
	});
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
			bind:this={panelRef}
			class="relative z-50 h-full w-full max-w-lg origin-center overflow-y-auto rounded-3xl border border-border-light bg-bg-card p-6 shadow-floating"
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
