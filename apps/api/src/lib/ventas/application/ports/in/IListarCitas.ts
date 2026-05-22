import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type CitaConAsesorDTO } from "../../use-cases/ListarCitasUseCase";

export interface IListarCitas {
  ejecutar(): Promise<Resultado<CitaConAsesorDTO[], ErrorDeDominio>>;
}
