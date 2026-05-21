import type { UserRol } from '$lib/auth/domain/models/User';

export type ApiSuccessResponse<T> = Readonly<{
	success: true;
	data: T;
}>;

export type UsuarioRespuestaDTO = Readonly<{
	id: string;
	username: string;
	nombre: string;
	rol: UserRol | string;
	estado: string;
}>;
