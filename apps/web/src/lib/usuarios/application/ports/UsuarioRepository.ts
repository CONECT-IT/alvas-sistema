import type { Usuario } from '../../domain/models/Usuario';

export interface UsuarioRepository {
	listar(): Promise<Usuario[]>;
}
