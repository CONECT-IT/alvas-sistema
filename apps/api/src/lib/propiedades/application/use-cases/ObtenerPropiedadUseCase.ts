import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { type IPropiedadRepository, type IAutorizadorPropiedades } from "../../domain/ports";
import { idPropiedad } from "../../domain/value-objects";
import { Propiedad } from "../../domain/entities";
import { PropiedadError } from "../../domain/errors/PropiedadError";
import { type IObtenerPropiedad } from "../ports/in";

export type ObtenerPropiedadInput = {
  /** Identificador publico de la propiedad solicitada. */
  idPropiedad: string;
  /** Usuario que solicita el detalle y define permisos de lectura. */
  usuarioAutenticado: {
    id: string;
    rol: string;
  };
};

/**
 * Obtiene el detalle de una propiedad respetando permisos por rol.
 *
 * Admin puede abrir cualquier ficha. Asesor solo puede abrir propiedades donde
 * participa como captador o responsable, incluso si la propiedad esta
 * disponible comercialmente.
 */
export class ObtenerPropiedadUseCase
  implements
    CasoDeUso<ObtenerPropiedadInput, Resultado<Propiedad, PropiedadError>>,
    IObtenerPropiedad
{
  constructor(
    private readonly propiedadRepository: IPropiedadRepository,
    private readonly autorizador: IAutorizadorPropiedades,
  ) {}

  /**
   * Devuelve la propiedad solicitada o un error de dominio si no existe o no es visible.
   */
  async ejecutar(input: ObtenerPropiedadInput): Promise<Resultado<Propiedad, PropiedadError>> {
    try {
      if (!this.autorizador.puedeVerPropiedades(input.usuarioAutenticado.rol)) {
        return resultadoFallido(
          new PropiedadError("No tienes permisos para ver propiedades.", "SIN_PERMISOS"),
        );
      }

      const propiedad = await this.propiedadRepository.obtenerPorId(idPropiedad(input.idPropiedad));

      if (!propiedad) {
        return resultadoFallido(new PropiedadError("Propiedad no encontrada.", "NO_ENCONTRADA"));
      }

      const { usuarioAutenticado } = input;

      if (usuarioAutenticado.rol === "ADMIN") {
        return resultadoExitoso(propiedad);
      }

      // ASESOR: solo ve propiedades donde participa como captador o responsable.
      const esAsociado =
        (propiedad.captadaPorAsesorId as string | undefined) === usuarioAutenticado.id ||
        (propiedad.asesorResponsableId as string | undefined) === usuarioAutenticado.id;

      if (esAsociado) return resultadoExitoso(propiedad);

      return resultadoFallido(
        new PropiedadError("No tienes permisos para ver esta propiedad.", "SIN_PERMISOS"),
      );
    } catch (error) {
      if (error instanceof PropiedadError) {
        return resultadoFallido(error);
      }
      throw error;
    }
  }
}
