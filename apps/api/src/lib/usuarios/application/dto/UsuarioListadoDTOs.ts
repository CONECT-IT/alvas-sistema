/** DTO de salida para listado de usuarios. @group DTOs */
export interface UsuarioListadoOutputDTO {
  id: string;
  username: string;
  nombre: string;
  rol: string;
  estado: string;
  creadoEn: string;
  actualizadoEn: string;
}
