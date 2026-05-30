export interface RequestOptions {
	headers?: Record<string, string>;
	body?: unknown;
}

export class HttpError extends Error {
	constructor(
		public readonly status: number,
		public readonly code: string,
		message: string
	) {
		super(message);
		this.name = 'HttpError';
	}
}

class HttpClient {
	private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			...customHeaders
		};

		return headers;
	}

	private async handleResponse<T>(response: Response): Promise<T> {
		if (!response.ok) {
			let errorData: { message?: string; code?: string } = {};
			try {
				errorData = await response.json();
			} catch {
				console.warn('httpClient: Respuesta no es JSON válido');
			}

			const message = errorData.message || 'Error en la petición.';
			const code = errorData.code || 'UNKNOWN_ERROR';

			// Si es 401 y estamos en el navegador, podemos redirigir a login
			if (response.status === 401 && typeof window !== 'undefined') {
				if (!window.location.pathname.startsWith('/login')) {
					window.location.href = '/login';
				}
			}

			throw new HttpError(response.status, code, message);
		}

		// Si no tiene contenido, retornar vacío
		if (response.status === 204) {
			return undefined as unknown as T;
		}

		return response.json();
	}

	async get<T>(url: string, options?: RequestOptions): Promise<T> {
		const response = await fetch(url, {
			method: 'GET',
			headers: this.getHeaders(options?.headers),
			credentials: 'same-origin'
		});
		return this.handleResponse<T>(response);
	}

	async post<T>(url: string, options?: RequestOptions): Promise<T> {
		const response = await fetch(url, {
			method: 'POST',
			headers: this.getHeaders(options?.headers),
			body: options?.body ? JSON.stringify(options.body) : undefined,
			credentials: 'same-origin'
		});
		return this.handleResponse<T>(response);
	}

	async put<T>(url: string, options?: RequestOptions): Promise<T> {
		const response = await fetch(url, {
			method: 'PUT',
			headers: this.getHeaders(options?.headers),
			body: options?.body ? JSON.stringify(options.body) : undefined,
			credentials: 'same-origin'
		});
		return this.handleResponse<T>(response);
	}

	async delete<T>(url: string, options?: RequestOptions): Promise<T> {
		const response = await fetch(url, {
			method: 'DELETE',
			headers: this.getHeaders(options?.headers),
			credentials: 'same-origin'
		});
		return this.handleResponse<T>(response);
	}
}

export const httpClient = new HttpClient();
