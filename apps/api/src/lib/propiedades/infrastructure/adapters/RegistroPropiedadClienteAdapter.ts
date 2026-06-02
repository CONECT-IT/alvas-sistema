import { ErrorDeDominio } from "../../../shared/domain";
import { type IRegistroPropiedadCliente } from "../../../ventas/domain/ports/IRegistroPropiedadCliente";
import { type IPropiedadRepository } from "../../domain/ports";
import { idPropiedad } from "../../domain/value-objects/Ids";

/**
 * Adaptador que asigna un cliente propietario a una propiedad desde el modulo Ventas.
 *
 * @group Adaptadores
 */
export class RegistroPropiedadClienteAdapter implements IRegistroPropiedadCliente {
  constructor(private readonly propiedadRepository: IPropiedadRepository) {}

  async registrarClientePropietario(idPropiedadValor: string, idCliente: string): Promise<void> {
    const propiedad = await this.propiedadRepository.obtenerPorId(idPropiedad(idPropiedadValor));

    if (!propiedad) {
      throw new ErrorDeDominio("Propiedad asociada al contrato no encontrada.", {
        codigo: "PROPIEDAD_NO_ENCONTRADA",
      });
    }

    propiedad.actualizar({ idClientePropietario: idCliente });
    await this.propiedadRepository.guardar(propiedad);
  }
}
