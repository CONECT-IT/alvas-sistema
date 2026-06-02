import { type SessionClaims } from "../../../shared/domain/types/SessionClaims";

/** Puerto para generar y validar tokens de autenticacion. @group Puertos */
export interface ITokenProvider {
  generarAuthToken(payload: SessionClaims): Promise<string> | string;
  generarRefreshToken(payload: SessionClaims): Promise<string> | string;
  validarAuthToken(token: string): Promise<SessionClaims> | SessionClaims;
  validarRefreshToken(token: string): Promise<SessionClaims> | SessionClaims;
}
