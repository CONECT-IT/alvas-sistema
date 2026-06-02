import { describe, expect, it } from 'vitest';
import { User } from '$lib/auth/domain/models/User';

describe('auth / domain / User', () => {
	it('identifica usuarios admin y asesores con lenguaje ubicuo', () => {
		const admin = new User('usuario-1', 'admin', 'Admin ALVAS', 'ADMIN', 'ACTIVO');
		const asesor = new User('usuario-2', 'asesor', 'Asesor ALVAS', 'ASESOR', 'ACTIVO');

		expect(admin.esAdmin).toBe(true);
		expect(admin.esAsesor).toBe(false);
		expect(asesor.esAdmin).toBe(false);
		expect(asesor.esAsesor).toBe(true);
	});
});
