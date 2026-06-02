/** DTO de entrada para crear un usuario. @group DTOs */
export interface CrearUsuarioDTO {
  username: string;
  nombre: string;
  clave: string;
  rol: string;
}

/** DTO de respuesta con datos basicos del usuario. @group DTOs */
export interface UsuarioRespuestaDTO {
  id: string;
  username: string;
  nombre: string;
  rol: string;
  estado: string;
}
