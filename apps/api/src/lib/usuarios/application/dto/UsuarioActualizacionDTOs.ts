/** DTO de salida con datos completos del usuario. @group DTOs */
export interface UsuarioOutputDTO {
  id: string;
  username: string;
  nombre: string;
  rol: string;
  estado: string;
  creadoEn: string;
  actualizadoEn: string;
}

/** DTO de entrada para actualizar un usuario. @group DTOs */
export interface ActualizarUsuarioInputDTO {
  idUsuario: string;
  username?: string;
  nombre?: string;
  clave?: string;
  rol?: string;
  estado?: string;
}
