<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	type Variant = 'confirm' | 'danger' | 'info';

	interface Props {
		isOpen: boolean;
		title: string;
		message: string;
		variant?: Variant;
		confirmLabel?: string;
		cancelLabel?: string;
		onConfirm: () => void;
		onCancel: () => void;
		loading?: boolean;
	}

	let {
		isOpen,
		title,
		message,
		variant = 'confirm',
		confirmLabel = 'Aceptar',
		cancelLabel = 'Cancelar',
		onConfirm,
		onCancel,
		loading = false
	}: Props = $props();

	const iconVariant = $derived(variant);
	const iconBg = $derived(
		{ confirm: 'bg-primary-light', danger: 'bg-danger-light', info: 'bg-sky-100' }[variant]
	);
	const iconColor = $derived(
		{ confirm: 'text-primary-dark', danger: 'text-danger', info: 'text-sky-600' }[variant]
	);
	const confirmClass = $derived(
		{
			confirm: 'bg-primary text-white hover:bg-primary-dark focus-visible:outline-primary',
			danger: 'bg-danger text-white hover:bg-danger-dark focus-visible:outline-danger',
			info: 'bg-primary text-white hover:bg-primary-dark focus-visible:outline-primary'
		}[variant]
	);

	function handleBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget && !loading) onCancel();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && !loading) onCancel();
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
			class="w-full max-w-sm rounded-3xl border border-border-light bg-bg-card px-6 pt-10 pb-6 shadow-floating"
			transition:scale={{ start: 0.92, duration: 200 }}
			role="alertdialog"
			aria-modal="true"
			aria-label={title}
		>
			<div class="flex flex-col items-center text-center">
				<div
					class="{iconBg} {iconColor} mb-5 flex h-14 w-14 items-center justify-center rounded-full"
				>
					{#if iconVariant === 'confirm'}
						<svg
							class="h-7 w-7"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M20 6L9 17l-5-5" />
						</svg>
					{:else if iconVariant === 'danger'}
						<svg
							class="h-7 w-7"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					{:else}
						<svg
							class="h-7 w-7"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					{/if}
				</div>

				<h2 class="font-display text-lg font-bold text-text-main">{title}</h2>

				<p class="mt-2 text-sm leading-relaxed text-text-muted">{message}</p>
			</div>

			<div class="mt-7 flex flex-col gap-2 sm:flex-row sm:gap-3">
				<button
					type="button"
					disabled={loading}
					onclick={onCancel}
					class="w-full rounded-xl border border-border-light bg-bg-card px-5 py-3 font-display font-semibold text-text-muted transition hover:bg-surface-muted hover:text-text-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 sm:order-1"
				>
					{cancelLabel}
				</button>
				<button
					type="button"
					disabled={loading}
					onclick={onConfirm}
					class="{confirmClass} w-full rounded-xl px-5 py-3 font-display font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
				>
					{loading ? 'Procesando…' : confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}
