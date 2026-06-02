import { type Resultado } from "../../../../shared";
import { type PropiedadError } from "../../../domain/errors/PropiedadError";
import { type ActualizarPropiedadInput } from "../../use-cases/ActualizarPropiedadUseCase";

/**
 * Puerto de entrada para el caso de uso actualizar propiedad.
 * @group Puertos
 */
export interface IActualizarPropiedad {
  ejecutar(input: ActualizarPropiedadInput): Promise<Resultado<void, PropiedadError>>;
}
