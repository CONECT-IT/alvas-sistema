import type { Usuario } from '../../domain/models/Usuario';
import type { ActualizarUsuarioInput } from '../use-cases/actualizarUsuario';
import type { CrearUsuarioInput } from '../use-cases/crearUsuario';

export interface UsuarioRepository {
	listar(): Promise<Usuario[]>;
	crear(input: CrearUsuarioInput): Promise<Usuario>;
	actualizar(input: ActualizarUsuarioInput): Promise<Usuario>;
	obtener(id: string): Promise<Usuario>;
}
