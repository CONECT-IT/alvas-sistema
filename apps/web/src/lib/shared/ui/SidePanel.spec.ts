import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import SidePanel from './SidePanel.svelte';

describe('shared / ui / SidePanel', () => {
	it('no renderiza el panel cuando esta cerrado', () => {
		render(SidePanel, {
			isOpen: false,
			title: 'Crear lead',
			onClose: vi.fn()
		});

		expect(screen.queryByText('Crear lead')).not.toBeInTheDocument();
	});

	it('renderiza el titulo y ejecuta cierre desde el boton', async () => {
		const onClose = vi.fn();
		render(SidePanel, {
			isOpen: true,
			title: 'Crear lead',
			onClose
		});

		expect(screen.getByText('Crear lead')).toBeInTheDocument();

		await fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));

		expect(onClose).toHaveBeenCalledOnce();
	});
});
