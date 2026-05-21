<script lang="ts">
	import type { Snippet } from 'svelte';

	type BadgeTone = 'brand' | 'success' | 'neutral';

	interface Props {
		tone?: BadgeTone;
		class?: string;
		children: Snippet;
	}

	let { tone = 'brand', class: className = '', children }: Props = $props();

	const tones: Record<BadgeTone, string> = {
		brand: 'bg-primary-light text-primary-dark',
		success: 'bg-emerald-50 text-emerald-700',
		neutral: 'bg-surface-muted text-text-muted'
	};
</script>

<span
	class={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]} ${className}`}
>
	{@render children()}
</span>
