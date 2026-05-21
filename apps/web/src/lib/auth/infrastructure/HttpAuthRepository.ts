import type { IAuthRepository } from '../domain/ports/IAuthRepository';
import type { LoginResponseDTO } from './dto/LoginDTOs';
import { httpClient } from '../../shared/http/httpClient';

export class HttpAuthRepository implements IAuthRepository {
	constructor(private readonly apiBaseUrl: string) {}

	async login(username: string, clave: string): Promise<LoginResponseDTO> {
		return httpClient.post<LoginResponseDTO>(`${this.apiBaseUrl}/auth/login`, {
			body: { username, clave }
		});
	}

	async logout(): Promise<void> {
		// En este caso, el logout se maneja limpiando el token localmente,
		// pero si la API requiere alguna llamada, se haría aquí.
		return Promise.resolve();
	}
}
