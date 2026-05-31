import { gsap } from 'gsap';

export function pageTransition(node: HTMLElement) {
	if (typeof window === 'undefined') return;

	const animation = gsap.from(node, {
		y: 20,
		opacity: 0,
		duration: 0.4,
		ease: 'power2.out',
		clearProps: 'all'
	});

	return {
		destroy() {
			animation.kill();
		}
	};
}
