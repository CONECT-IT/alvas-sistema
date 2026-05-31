/**
 * Svelte actions for micro-interactions — native, no GSAP.
 *
 * Estrategia:
 *   • Svelte nativo (transition:, animate:, y estos actions)  → micro-interacciones por click, hover, toggle
 *   • GSAP (gsap.ts, gsapPageTransition.ts)                    → scroll reveals, page transitions, stagger complejos
 */

/** Subtle press-down effect on click (buttons, cards). */
export function pressEffect(node: HTMLElement) {
	const handleDown = () => {
		node.style.transform = 'scale(0.97)';
		node.style.transition = 'transform 0.1s ease';
	};
	const handleUp = () => {
		node.style.transform = 'scale(1)';
		node.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
	};

	node.addEventListener('pointerdown', handleDown);
	node.addEventListener('pointerup', handleUp);
	node.addEventListener('pointerleave', handleUp);

	return {
		destroy() {
			node.removeEventListener('pointerdown', handleDown);
			node.removeEventListener('pointerup', handleUp);
			node.removeEventListener('pointerleave', handleUp);
		}
	};
}

/** Ripple effect on click — material-style expanding circle. */
export function ripple(node: HTMLElement) {
	node.style.position = 'relative';
	node.style.overflow = 'hidden';

	function handleClick(e: PointerEvent) {
		const rect = node.getBoundingClientRect();
		const size = Math.max(rect.width, rect.height) * 2;
		const x = e.clientX - rect.left - size / 2;
		const y = e.clientY - rect.top - size / 2;

		const circle = document.createElement('span');
		circle.style.cssText = `
			position:absolute; left:${x}px; top:${y}px;
			width:${size}px; height:${size}px;
			border-radius:50%; pointer-events:none;
			background:currentColor; opacity:0.12;
			transform:scale(0);
			animation: ripple-expand 0.5s ease-out forwards;
		`;
		node.appendChild(circle);
		circle.addEventListener('animationend', () => circle.remove());
	}

	node.addEventListener('pointerdown', handleClick);
	return {
		destroy() {
			node.removeEventListener('pointerdown', handleClick);
		}
	};
}

/** Smooth number counter — counts from 0 to target value. */
export function countUp(
	node: HTMLElement,
	params: { target: number; duration?: number } = { target: 0 }
) {
	const duration = params.duration ?? 800;
	const target = params.target;
	const start = performance.now();

	function tick(now: number) {
		const elapsed = now - start;
		const progress = Math.min(elapsed / duration, 1);
		// easeOutCubic
		const eased = 1 - Math.pow(1 - progress, 3);
		node.textContent = Math.round(eased * target).toLocaleString();
		if (progress < 1) requestAnimationFrame(tick);
	}
	requestAnimationFrame(tick);

	return {
		update(newParams: { target: number; duration?: number }) {
			// Re-run on param change
			const newStart = performance.now();
			const newDuration = newParams.duration ?? 800;
			const current = parseInt(node.textContent?.replace(/,/g, '') ?? '0');
			const newTarget = newParams.target;
			function newTick(now: number) {
				const elapsed = now - newStart;
				const progress = Math.min(elapsed / newDuration, 1);
				const eased = 1 - Math.pow(1 - progress, 3);
				node.textContent = Math.round(current + (newTarget - current) * eased).toLocaleString();
				if (progress < 1) requestAnimationFrame(newTick);
			}
			requestAnimationFrame(newTick);
		}
	};
}

/** Typewriter effect — types out text character by character. */
export function typewriter(node: HTMLElement, params: { speed?: number } = {}) {
	const text = node.textContent ?? '';
	const speed = params.speed ?? 30;
	node.textContent = '';
	let i = 0;

	const interval = setInterval(() => {
		node.textContent = text.slice(0, ++i);
		if (i >= text.length) clearInterval(interval);
	}, speed);

	return {
		destroy() {
			clearInterval(interval);
		}
	};
}

/** Hover tilt effect for cards — subtle 3D perspective. */
export function tiltOnHover(node: HTMLElement, params?: { max?: number; enabled?: boolean }) {
	const maxTilt = params?.max ?? 4;
	const enabled = params?.enabled ?? true;

	if (!enabled) return;

	node.style.transition = 'transform 0.3s ease';
	node.style.cursor = 'default';

	function handleMove(e: MouseEvent) {
		const rect = node.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width - 0.5;
		const y = (e.clientY - rect.top) / rect.height - 0.5;
		node.style.transform = `perspective(600px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt}deg)`;
	}

	function handleLeave() {
		node.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg)';
	}

	node.addEventListener('mousemove', handleMove);
	node.addEventListener('mouseleave', handleLeave);

	return {
		destroy() {
			node.removeEventListener('mousemove', handleMove);
			node.removeEventListener('mouseleave', handleLeave);
		}
	};
}
