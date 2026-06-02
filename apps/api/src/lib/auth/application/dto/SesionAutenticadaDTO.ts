import { type ValorRolAcceso } from "../../domain/value-objects/RolAcceso";

/** DTO de salida con datos de la sesion autenticada. @group DTOs */
export type SesionAutenticadaDTO = {
  authToken: string;
  refreshToken: string;
  usuario: {
    id: string;
    username: string;
    rol: ValorRolAcceso;
  };
};
