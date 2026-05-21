import { writable } from 'svelte/store';
import { User, type UserRol } from '../domain/models/User';
import { HttpAuthRepository } from './HttpAuthRepository';

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	loading: boolean;
	error: string | null;
}

// Inicializar el repositorio
const apiUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8787';
const authRepository = new HttpAuthRepository(apiUrl);

function createAuthStore() {
	// Estado inicial por defecto para SSR
	const defaultState: AuthState = {
		user: null,
		isAuthenticated: false,
		loading: false,
		error: null
	};

	const { subscribe, set, update } = writable<AuthState>(defaultState);

	// Intentar cargar la sesión guardada desde localStorage en el navegador
	const init = () => {
		if (typeof window === 'undefined') return;

		try {
			const token = localStorage.getItem('alvas_token');
			const userDataRaw = localStorage.getItem('alvas_user');

			if (token && userDataRaw) {
				const data = JSON.parse(userDataRaw);
				const user = new User(
					data.id,
					data.username,
					data.nombre,
					data.rol as UserRol,
					data.estado
				);
				set({
					user,
					isAuthenticated: true,
					loading: false,
					error: null
				});
			}
		} catch (e) {
			console.error('Error al inicializar sesión desde localStorage:', e);
			clearLocalStorage();
		}
	};

	const clearLocalStorage = () => {
		if (typeof window === 'undefined') return;
		localStorage.removeItem('alvas_token');
		localStorage.removeItem('alvas_user');
	};

	return {
		subscribe,
		init,
		login: async (username: string, clave: string) => {
			update((s) => ({ ...s, loading: true, error: null }));
			try {
				const response = await authRepository.login(username, clave);

				// Guardar en localStorage
				if (typeof window !== 'undefined') {
					localStorage.setItem('alvas_token', response.authToken);
					localStorage.setItem(
						'alvas_user',
						JSON.stringify({
							id: response.usuario.id,
							username: response.usuario.username,
							nombre: response.usuario.username, // el login no devuelve 'nombre' en el DTO de la API actual, usamos username
							rol: response.usuario.rol,
							estado: 'ACTIVO'
						})
					);
				}

				const user = new User(
					response.usuario.id,
					response.usuario.username,
					response.usuario.username,
					response.usuario.rol,
					'ACTIVO'
				);

				set({
					user,
					isAuthenticated: true,
					loading: false,
					error: null
				});

				return user;
			} catch (err: any) {
				const errMsg = err.message || 'Error de credenciales.';
				update((s) => ({ ...s, loading: false, error: errMsg }));
				clearLocalStorage();
				throw err;
			}
		},
		logout: async () => {
			update((s) => ({ ...s, loading: true }));
			try {
				await authRepository.logout();
			} catch (e) {
				console.error('Error en repositorio de logout:', e);
			} finally {
				clearLocalStorage();
				set(defaultState);
				if (typeof window !== 'undefined') {
					window.location.href = '/login';
				}
			}
		}
	};
}

export const authStore = createAuthStore();
// Inicializar la sesión local
authStore.init();
