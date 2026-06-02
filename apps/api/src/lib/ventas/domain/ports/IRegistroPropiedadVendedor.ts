import { type Resultado } from "../../../shared";
import { type ErrorDeDominio } from "../../../shared/domain";

export interface RegistroPropiedadVendedorInput {
  idLeadOrigen: string;
  idAsesor: string;
  titulo: string;
  descripcion: string;
  precio: number;
}

/** @group Puertos */
export interface IRegistroPropiedadVendedor {
  registrar(
    input: RegistroPropiedadVendedorInput,
  ): Promise<Resultado<{ id: string }, ErrorDeDominio>>;
}
