import { type ValorRol } from "./Roles";

export type SessionClaims = {
  idUsuario: string;
  rol: ValorRol;
};
