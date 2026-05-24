import type { CasoDeUso } from "../../../shared/application/CasoDeUso";
import { resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { type IContratoRepository } from "../../domain/ports/IContratoRepository";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { Cliente } from "../../domain/entities/Cliente";
import { type IdContrato, idCliente } from "../../domain/value-objects/Ids";
import { type IGeneradorId } from "../../../shared/domain/ports/IGeneradorId";
import { ErrorDeDominio } from "../../../shared/domain";
import { ContratoNoEncontradoError } from "../../domain/errors/DomainErrors";
import { type IFirmarContrato } from "../ports/in";
import { type IRegistroPropiedadCliente } from "../../domain/ports/IRegistroPropiedadCliente";

export type FirmarContratoInput = {
  idContrato: string;
};

export class FirmarContratoUseCase
  implements CasoDeUso<FirmarContratoInput, Resultado<void, ErrorDeDominio>>, IFirmarContrato
{
  constructor(
    private readonly contratoRepository: IContratoRepository,
    private readonly ventasRepository: IVentasRepository,
    private readonly generadorId: IGeneradorId,
    private readonly registroPropiedadCliente?: IRegistroPropiedadCliente,
  ) {}

  async ejecutar(input: FirmarContratoInput): Promise<Resultado<void, ErrorDeDominio>> {
    try {
      const contrato = await this.contratoRepository.buscarPorId(input.idContrato as IdContrato);
      if (!contrato) {
        return resultadoFallido(new ContratoNoEncontradoError(input.idContrato));
      }

      // Si el contrato tiene idLead pero aún no tiene idCliente, crear el cliente al firmar
      if (contrato.idLead && !contrato.idCliente) {
        const lead = await this.ventasRepository.obtenerLeadPorId(contrato.idLead);
        if (!lead) {
          return resultadoFallido(
            new ErrorDeDominio("Lead asociado al contrato no encontrado", {
              codigo: "LEAD_NO_ENCONTRADO",
            }),
          );
        }

        const nuevoIdCliente = idCliente(this.generadorId.generar());
        const cliente = Cliente.crear({
          id: nuevoIdCliente as string,
          nombre: lead.nombre,
          email: lead.email,
          telefono: lead.telefono,
          idAsesor: lead.idAsesor,
          idLeadOrigen: lead.id,
        });

        lead.convertirACliente(nuevoIdCliente);
        contrato.asignarCliente(nuevoIdCliente);

        await this.ventasRepository.guardarCliente(cliente);
        await this.ventasRepository.guardarLead(lead);
        await this.ventasRepository.registrarActividad(
          lead.id,
          "CONVERTIDO_A_CLIENTE",
          `Lead convertido a cliente con ID ${nuevoIdCliente} al firmar contrato ${contrato.id}`,
        );
      }

      contrato.firmar();
      await this.contratoRepository.guardar(contrato);

      if (contrato.idCliente && this.registroPropiedadCliente) {
        await this.registroPropiedadCliente.registrarClientePropietario(
          contrato.idPropiedad as string,
          contrato.idCliente as string,
        );
      }

      return resultadoExitoso(undefined);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}
