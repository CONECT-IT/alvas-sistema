<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import Card from '$lib/shared/ui/Card.svelte';
	import Button from '$lib/shared/ui/Button.svelte';

	let container: HTMLElement;
	let title: HTMLHeadingElement;
	let cards: HTMLElement[] = [];

	onMount(() => {
		// Initial entrance animation
		const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

		tl.from(title, {
			y: -50,
			opacity: 0,
			duration: 1
		}).from(
			cards,
			{
				y: 100,
				opacity: 0,
				stagger: 0.2,
				duration: 0.8
			},
			'-=0.5'
		);
	});

	function animateOut() {
		gsap.to(cards, {
			scale: 0.8,
			opacity: 0,
			stagger: 0.1,
			duration: 0.5,
			onComplete: () => {
				gsap.to(cards, { scale: 1, opacity: 1, stagger: 0.1, duration: 0.5, delay: 0.2 });
			}
		});
	}
</script>

<div bind:this={container} class="p-8">
	<h1 bind:this={title} class="page-heading mb-8 text-center">GSAP Animation Demo</h1>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		{#each Array.from({ length: 3 }, (_, i) => i) as i (i)}
			<div bind:this={cards[i]}>
				<Card class="flex h-64 flex-col items-center justify-center">
					<div
						class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary font-bold text-white"
					>
						{i + 1}
					</div>
					<h2 class="card-title">Animated Card</h2>
					<p class="text-center text-sm text-text-muted">
						This card was animated into view using GSAP staggers.
					</p>
				</Card>
			</div>
		{/each}
	</div>

	<div class="mt-12 flex justify-center">
		<Button onclick={animateOut}>Trigger Re-animation</Button>
	</div>
</div>
