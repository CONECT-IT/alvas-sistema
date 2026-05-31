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
  idPropiedad: string;
  usuarioAutenticado: {
    id: string;
    rol: string;
  };
};

export class ObtenerPropiedadUseCase
  implements
    CasoDeUso<ObtenerPropiedadInput, Resultado<Propiedad, PropiedadError>>,
    IObtenerPropiedad
{
  constructor(
    private readonly propiedadRepository: IPropiedadRepository,
    private readonly autorizador: IAutorizadorPropiedades,
  ) {}

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

      // ASESOR: solo ve propiedades públicas o asociadas a él
      const esPublica =
        propiedad.estado.esDisponible() ||
        propiedad.estado.esReservada() ||
        propiedad.estado.esVendida();

      if (esPublica) return resultadoExitoso(propiedad);

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
