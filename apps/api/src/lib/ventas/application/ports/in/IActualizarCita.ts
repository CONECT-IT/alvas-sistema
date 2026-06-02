import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type ActualizarCitaInput } from "../../use-cases/ActualizarCitaUseCase";

/** @group Puertos de Entrada */
export interface IActualizarCita {
  ejecutar(input: ActualizarCitaInput): Promise<Resultado<void, ErrorDeDominio>>;
}
