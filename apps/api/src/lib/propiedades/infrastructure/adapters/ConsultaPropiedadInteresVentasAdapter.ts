import { type IConsultaPropiedadInteres } from "../../../ventas/domain/ports/IConsultaPropiedadInteres";
import { type IPropiedadRepository } from "../../domain/ports";
import { idPropiedad } from "../../domain/value-objects";

/**
 * Adaptador que consulta disponibilidad de propiedad desde el modulo Ventas.
 *
 * @group Adaptadores
 */
export class ConsultaPropiedadInteresVentasAdapter implements IConsultaPropiedadInteres {
  constructor(private readonly propiedadRepository: IPropiedadRepository) {}

  async propiedadDisponibleParaCompra(id: string): Promise<boolean> {
    const propiedad = await this.propiedadRepository.obtenerPorId(idPropiedad(id));
    return propiedad?.estado?.esDisponible() === true;
  }
}
