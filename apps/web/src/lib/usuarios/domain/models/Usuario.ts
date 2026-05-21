import type { UserRol } from '$lib/auth/domain/models/User';

export type UsuarioEstado = 'ACTIVO' | 'INACTIVO' | string;

export type Usuario = Readonly<{
	id: string;
	username: string;
	nombre: string;
	rol: UserRol;
	estado: UsuarioEstado;
}>;
