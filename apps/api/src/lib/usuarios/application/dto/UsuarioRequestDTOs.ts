/** DTO del body HTTP para actualizar usuario. @group DTOs */
export type ActualizarUsuarioBodyDTO = Readonly<{
  username?: string;
  nombre?: string;
  clave?: string;
  rol?: string;
}>;
