import { type Resultado } from "../../../../shared";
import { type PropiedadError } from "../../../domain/errors/PropiedadError";
import { type EliminarPropiedadInput } from "../../use-cases/EliminarPropiedadUseCase";

/**
 * Puerto de entrada para el caso de uso eliminar propiedad.
 * @group Puertos
 */
export interface IEliminarPropiedad {
  ejecutar(input: EliminarPropiedadInput): Promise<Resultado<void, PropiedadError>>;
}
