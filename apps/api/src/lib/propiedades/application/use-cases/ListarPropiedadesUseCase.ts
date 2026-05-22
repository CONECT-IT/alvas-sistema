import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type IPropiedadRepository } from "../../domain/ports";
import { Propiedad } from "../../domain/entities";
import { type IAutorizadorPropiedades } from "../../domain/ports";
import { type IListarPropiedades } from "../ports/in";

export type ListarPropiedadesInput = {
  usuarioAutenticado: {
    id: string;
    rol: string;
  };
};

export class ListarPropiedadesUseCase
  implements
    CasoDeUso<ListarPropiedadesInput, Resultado<Propiedad[], ErrorDeDominio>>,
    IListarPropiedades
{
  constructor(
    private readonly propiedadRepository: IPropiedadRepository,
    private readonly autorizador: IAutorizadorPropiedades,
  ) {}

  async ejecutar(input: ListarPropiedadesInput): Promise<Resultado<Propiedad[], ErrorDeDominio>> {
    try {
      const { usuarioAutenticado } = input;

      if (!this.autorizador.puedeVerPropiedades(usuarioAutenticado.rol)) {
        return resultadoFallido(
          new ErrorDeDominio("No tienes permisos para ver propiedades.", {
            codigo: "ROL_NO_PERMITIDO",
          }),
        );
      }

      const todas = await this.propiedadRepository.listarTodas();

      if (usuarioAutenticado.rol === "ADMIN") {
        return resultadoExitoso(todas);
      }

      // ASESOR: ve todas las DISPONIBLES/RESERVADAS/VENDIDAS
      // + las PRELIMINARES/EN_VALIDACION donde él sea el captador o responsable
      const filtradas = todas.filter((p) => {
        const esPublica = ["DISPONIBLE", "RESERVADA", "VENDIDA"].includes(p.estado);
        if (esPublica) return true;

        const esAsociado =
          (p.captadaPorAsesorId as string | undefined) === usuarioAutenticado.id ||
          (p.asesorResponsableId as string | undefined) === usuarioAutenticado.id;

        return esAsociado;
      });

      return resultadoExitoso(filtradas);
    } catch (error) {
      if (error instanceof ErrorDeDominio) {
        return resultadoFallido(error);
      }
      throw error;
    }
  }
}
