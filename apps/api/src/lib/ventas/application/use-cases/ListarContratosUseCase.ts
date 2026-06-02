import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type IContratoRepository } from "../../domain/ports/IContratoRepository";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { type ListarContratosOutputDTO, type ContratoOutputDTO } from "../dto/ContratoDTOs";
import { type IListarContratos } from "../ports/in";
import { idLead } from "../../domain/value-objects";

export type ListarContratosInput = void;
export type ListarContratosOutput = ListarContratosOutputDTO;

/** @group Casos de Uso */
export class ListarContratosUseCase
  implements
    CasoDeUso<ListarContratosInput, Resultado<ListarContratosOutput, ErrorDeDominio>>,
    IListarContratos
{
  constructor(
    private readonly repository: IContratoRepository,
    private readonly ventasRepository: IVentasRepository,
  ) {}

  async ejecutar(): Promise<Resultado<ListarContratosOutput, ErrorDeDominio>> {
    try {
      const contratos = await this.repository.listar();
      const outputContratos: ContratoOutputDTO[] = [];

      for (const contrato of contratos) {
        let idAsesor: string | undefined;

        if (contrato.idLead) {
          const lead = await this.ventasRepository.obtenerLeadPorId(
            idLead(contrato.idLead as string),
          );
          idAsesor = lead?.idAsesor as string | undefined;
        }

        outputContratos.push({
          id: contrato.id as string,
          idLead: contrato.idLead as string | undefined,
          idCliente: contrato.idCliente as string | undefined,
          idPropiedad: contrato.idPropiedad,
          idAsesor,
          fechaInicio: contrato.fechaInicio.toISOString(),
          fechaFin: contrato.fechaFin.toISOString(),
          estado: contrato.estado.valor,
          creadoEn: contrato.creadoEn.toISOString(),
          actualizadoEn: contrato.actualizadoEn.toISOString(),
        });
      }

      const output: ListarContratosOutputDTO = {
        contratos: outputContratos,
      };

      return resultadoExitoso(output);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}
