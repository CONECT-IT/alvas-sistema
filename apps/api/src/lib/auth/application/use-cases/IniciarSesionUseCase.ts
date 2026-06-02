import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { CredencialesInvalidasError, Sesion } from "../../domain";
import { type SesionAutenticadaDTO } from "../dto";
import { type IIniciarSesion } from "../ports/in";
import {
  type IConsultaCredencialesUsuario,
  type ITokenProvider,
  type IVerificadorDeClave,
} from "../../domain/ports";

/** @param username - Nombre de usuario. @param clave - Clave en texto plano. */
export type IniciarSesionInput = {
  username: string;
  clave: string;
};

/** Caso de uso: autenticar usuario con username y clave. @group Casos de Uso */
export class IniciarSesionUseCase
  implements
    CasoDeUso<IniciarSesionInput, Resultado<SesionAutenticadaDTO, ErrorDeDominio>>,
    IIniciarSesion
{
  constructor(
    private readonly consultaCredenciales: IConsultaCredencialesUsuario,
    private readonly verificadorDeClave: IVerificadorDeClave,
    private readonly tokenProvider: ITokenProvider,
  ) {}

  /**
   * Ejecuta el inicio de sesion.
   * @param input - Datos de autenticacion (username, clave).
   * @returns Resultado con sesion autenticada o error de dominio.
   */
  async ejecutar(
    input: IniciarSesionInput,
  ): Promise<Resultado<SesionAutenticadaDTO, ErrorDeDominio>> {
    try {
      const clave = input.clave.trim();

      if (!clave) {
        return resultadoFallido(new CredencialesInvalidasError());
      }

      const username = input.username.trim().toLowerCase();
      const usuario = await this.consultaCredenciales.buscarPorUsername(username);

      if (!usuario || usuario.estado !== "ACTIVO") {
        return resultadoFallido(new CredencialesInvalidasError());
      }

      const coincideClave = await this.verificadorDeClave.comparar(clave, usuario.hashClave);

      if (!coincideClave) {
        return resultadoFallido(new CredencialesInvalidasError());
      }

      const payload = {
        idUsuario: usuario.idUsuario,
        rol: usuario.rol,
      };
      const authToken = await this.tokenProvider.generarAuthToken(payload);
      const refreshToken = await this.tokenProvider.generarRefreshToken(payload);
      const sesion = Sesion.abrir({
        authToken,
        refreshToken,
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
