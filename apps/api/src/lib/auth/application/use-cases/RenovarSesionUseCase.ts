import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { CredencialesInvalidasError, Sesion } from "../../domain";
import { type SesionAutenticadaDTO } from "../dto";
import { type IRenovarSesion } from "../ports/in";
import { type IConsultaCredencialesUsuario, type ITokenProvider } from "../../domain/ports";

/** @param refreshToken - Token de refresco valido. */
export type RenovarSesionInput = {
  refreshToken: string;
};

/** Caso de uso: renovar sesion usando refresh token. @group Casos de Uso */
export class RenovarSesionUseCase
  implements
    CasoDeUso<RenovarSesionInput, Resultado<SesionAutenticadaDTO, ErrorDeDominio>>,
    IRenovarSesion
{
  constructor(
    private readonly consultaCredenciales: IConsultaCredencialesUsuario,
    private readonly tokenProvider: ITokenProvider,
  ) {}

  /**
   * Ejecuta la renovacion de sesion.
   * @param input - Datos con refresh token.
   * @returns Resultado con nueva sesion o error de dominio.
   */
  async ejecutar(
    input: RenovarSesionInput,
  ): Promise<Resultado<SesionAutenticadaDTO, ErrorDeDominio>> {
    try {
      const payloadRefresh = await this.tokenProvider.validarRefreshToken(input.refreshToken);
      const usuario = await this.consultaCredenciales.buscarPorId(payloadRefresh.idUsuario);

      if (!usuario || usuario.estado !== "ACTIVO") {
        return resultadoFallido(new CredencialesInvalidasError());
      }

      const payload = {
        idUsuario: payloadRefresh.idUsuario,
        rol: usuario.rol,
      };
      const authToken = await this.tokenProvider.generarAuthToken(payload);
      const nuevoRefreshToken = await this.tokenProvider.generarRefreshToken(payload);
      const sesion = Sesion.abrir({
        authToken,
        refreshToken: nuevoRefreshToken,
        idUsuario: usuario.idUsuario,
        username: usuario.username,
        rol: usuario.rol,
      });

      return resultadoExitoso({
        authToken: sesion.authToken,
        refreshToken: sesion.refreshToken,
        usuario: {
          id: sesion.idUsuario,
          username: sesion.username,
          rol: sesion.rol,
        },
      });
    } catch (error) {
      if (error instanceof ErrorDeDominio) {
        return resultadoFallido(error);
      }

      throw error;
    }
  }
}
