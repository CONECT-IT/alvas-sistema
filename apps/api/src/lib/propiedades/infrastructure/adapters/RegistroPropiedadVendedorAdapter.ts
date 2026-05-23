import {
  type IRegistroPropiedadVendedor,
  type RegistroPropiedadVendedorInput,
} from "../../../ventas/domain/ports/IRegistroPropiedadVendedor";
import { resultadoExitoso, type Resultado } from "../../../shared";
import { type ErrorDeDominio } from "../../../shared/domain";
import { type IGeneradorId } from "../../../shared/domain/ports/IGeneradorId";
import { Propiedad } from "../../domain/entities";
import { type IPropiedadRepository } from "../../domain/ports";

export class RegistroPropiedadVendedorAdapter implements IRegistroPropiedadVendedor {
  constructor(
    private readonly propiedadRepository: IPropiedadRepository,
    private readonly generadorId: IGeneradorId,
  ) {}

  async registrar(
    input: RegistroPropiedadVendedorInput,
  ): Promise<Resultado<{ id: string }, ErrorDeDominio>> {
    const propiedad = Propiedad.crear({
      id: this.generadorId.generar(),
      titulo: input.titulo,
      descripcion: input.descripcion,
      precio: input.precio,
      origen: "CLIENTE", // Origen cliente porque viene de un lead que será cliente
      estado: "BORRADOR",
      idLeadOrigen: input.idLeadOrigen,
      captadaPorAsesorId: input.idAsesor,
      asesorResponsableId: input.idAsesor,
    });

    await this.propiedadRepository.guardar(propiedad);
    return resultadoExitoso({ id: propiedad.id as string });
  }
}
