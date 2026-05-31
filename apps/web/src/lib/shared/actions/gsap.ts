import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

export function fadeUpOnScroll(node: HTMLElement, options: gsap.TweenVars = {}) {
	if (typeof window === 'undefined') return;

	const animation = gsap.from(node, {
		y: options.y ?? 50,
		opacity: options.opacity ?? 0,
		duration: options.duration ?? 0.8,
		ease: options.ease ?? 'power3.out',
		delay: options.delay ?? 0,
		scrollTrigger: {
			trigger: node,
			start: 'top 85%',
			toggleActions: 'play none none reverse',
			...(options.scrollTrigger as any)
		}
	});

	return {
		destroy() {
			animation.kill();
			ScrollTrigger.getById(node.id)?.kill();
		}
	};
}

export function staggerFadeUp(node: HTMLElement, options: gsap.TweenVars = {}) {
	if (typeof window === 'undefined') return;

	const children = Array.from(node.children);

	const animation = gsap.from(children, {
		y: options.y ?? 30,
		opacity: options.opacity ?? 0,
		duration: options.duration ?? 0.6,
		stagger: options.stagger ?? 0.1,
		ease: options.ease ?? 'power2.out',
		scrollTrigger: {
			trigger: node,
			start: 'top 85%',
			toggleActions: 'play none none reverse',
			...(options.scrollTrigger as any)
		}
	});

	return {
		destroy() {
			animation.kill();
		}
	};
}
