import { writable } from 'svelte/store';
import { User } from '../domain/models/User';
import type { SessionUser } from '../server/session';

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	loading: boolean;
	error: string | null;
}

const defaultState: AuthState = {
	user: null,
	isAuthenticated: false,
	loading: false,
	error: null
};

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(defaultState);

	return {
		subscribe,
		hydrate: (sessionUser: SessionUser | null) => {
			if (!sessionUser) {
				set(defaultState);
				return;
			}

			const user = new User(
				sessionUser.id,
				sessionUser.username,
				sessionUser.nombre,
				sessionUser.rol,
				sessionUser.estado
			);

			set({
				user,
				isAuthenticated: true,
				loading: false,
				error: null
			});
		},
		logout: async () => {
			update((state) => ({ ...state, loading: true }));

			try {
				await fetch('/auth/logout', { method: 'POST' });
			} catch (error) {
				console.error('Error al cerrar sesión:', error);
			} finally {
				set(defaultState);

				if (typeof window !== 'undefined') {
					window.location.href = '/login';
				}
			}
		}
	};
}

export const authStore = createAuthStore();
