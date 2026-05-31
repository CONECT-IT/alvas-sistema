import { type Resultado } from "../../../../shared";
import { type Propiedad } from "../../../domain/entities";
import { type PropiedadError } from "../../../domain/errors/PropiedadError";
import { type ObtenerPropiedadInput } from "../../use-cases/ObtenerPropiedadUseCase";

export interface IObtenerPropiedad {
  ejecutar(input: ObtenerPropiedadInput): Promise<Resultado<Propiedad, PropiedadError>>;
}
