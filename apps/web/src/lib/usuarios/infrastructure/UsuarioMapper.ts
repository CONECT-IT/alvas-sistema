import type { UserRol } from '$lib/auth/domain/models/User';
import type { Usuario } from '../domain/models/Usuario';
import type { UsuarioRespuestaDTO } from './dto/UsuarioDTOs';

function mapRol(value: string): UserRol {
	return value.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'ASESOR';
}

export function mapUsuarioFromDto(dto: UsuarioRespuestaDTO): Usuario {
	return {
		id: dto.id,
		username: dto.username,
		nombre: dto.nombre,
		rol: mapRol(dto.rol),
		estado: dto.estado
	};
}
