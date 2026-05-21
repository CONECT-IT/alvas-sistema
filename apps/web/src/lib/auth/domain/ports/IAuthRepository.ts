import type { LoginResponseDTO } from '../../infrastructure/dto/LoginDTOs';

export interface IAuthRepository {
	login(username: string, clave: string): Promise<LoginResponseDTO>;
	logout(): Promise<void>;
}
