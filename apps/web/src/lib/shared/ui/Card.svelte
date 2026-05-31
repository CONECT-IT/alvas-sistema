<script lang="ts">
	import type { Snippet } from 'svelte';
	import { tiltOnHover } from '$lib/shared/actions/microInteractions';

	interface Props {
		tilt?: boolean;
		class?: string;
		children: Snippet;
	}

	let { tilt = false, class: className = '', children }: Props = $props();
</script>

<section
	class="rounded-3xl border border-border-light bg-bg-card p-6 shadow-xs {className}"
	use:tiltOnHover={{ enabled: tilt }}
>
	{@render children()}
</section>
