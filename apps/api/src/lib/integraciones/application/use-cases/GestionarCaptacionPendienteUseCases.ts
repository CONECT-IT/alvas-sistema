import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type ICaptacionPendienteRepository } from "../../domain";
import {
  type CaptacionConvertidaDTO,
  type CaptacionPendienteDTO,
  type ConvertirCaptacionPendienteDTO,
  type MarcarCaptacionDuplicadaDTO,
  type RechazarCaptacionPendienteDTO,
  type RevisarCaptacionPendienteDTO,
} from "../dto/CaptacionDTOs";
import { captacionPendienteADTO } from "../mappers";
import {
  type IConvertirCaptacionPendiente,
  type IMarcarCaptacionDuplicada,
  type IRechazarCaptacionPendiente,
  type IRevisarCaptacionPendiente,
} from "../ports/in";
import { type IRegistroLeadCaptacion } from "../../domain/ports/IRegistroLeadCaptacion";
import { type IRegistroPropiedadCaptacion } from "../../domain/ports/IRegistroPropiedadCaptacion";

function captacionNoEncontrada(id: string): ErrorDeDominio {
  return new ErrorDeDominio("La captacion pendiente no existe.", {
    codigo: "CAPTACION_NO_ENCONTRADA",
    detalle: { idCaptacion: id },
  });
}

/** @group Casos de Uso */
export class RevisarCaptacionPendienteUseCase
  implements
    CasoDeUso<RevisarCaptacionPendienteDTO, Resultado<CaptacionPendienteDTO, ErrorDeDominio>>,
    IRevisarCaptacionPendiente
{
  constructor(private readonly captacionRepository: ICaptacionPendienteRepository) {}

  async ejecutar(
    input: RevisarCaptacionPendienteDTO,
  ): Promise<Resultado<CaptacionPendienteDTO, ErrorDeDominio>> {
    try {
      const captacion = await this.captacionRepository.obtenerPorId(input.idCaptacion);
      if (!captacion) return resultadoFallido(captacionNoEncontrada(input.idCaptacion));

      captacion.marcarRevisada();
      await this.captacionRepository.guardar(captacion);

      return resultadoExitoso(captacionPendienteADTO(captacion));
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

/** @group Casos de Uso */
export class MarcarCaptacionDuplicadaUseCase
  implements
    CasoDeUso<MarcarCaptacionDuplicadaDTO, Resultado<CaptacionPendienteDTO, ErrorDeDominio>>,
    IMarcarCaptacionDuplicada
{
  constructor(private readonly captacionRepository: ICaptacionPendienteRepository) {}

  async ejecutar(
    input: MarcarCaptacionDuplicadaDTO,
  ): Promise<Resultado<CaptacionPendienteDTO, ErrorDeDominio>> {
    try {
      const captacion = await this.captacionRepository.obtenerPorId(input.idCaptacion);
      if (!captacion) return resultadoFallido(captacionNoEncontrada(input.idCaptacion));

      captacion.marcarDuplicada(input.razon);
      await this.captacionRepository.guardar(captacion);

      return resultadoExitoso(captacionPendienteADTO(captacion));
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

/** @group Casos de Uso */
export class RechazarCaptacionPendienteUseCase
  implements
    CasoDeUso<RechazarCaptacionPendienteDTO, Resultado<CaptacionPendienteDTO, ErrorDeDominio>>,
    IRechazarCaptacionPendiente
{
  constructor(private readonly captacionRepository: ICaptacionPendienteRepository) {}

  async ejecutar(
    input: RechazarCaptacionPendienteDTO,
  ): Promise<Resultado<CaptacionPendienteDTO, ErrorDeDominio>> {
    try {
      const captacion = await this.captacionRepository.obtenerPorId(input.idCaptacion);
      if (!captacion) return resultadoFallido(captacionNoEncontrada(input.idCaptacion));

      captacion.rechazar(input.razon);
      await this.captacionRepository.guardar(captacion);

      return resultadoExitoso(captacionPendienteADTO(captacion));
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

/** @group Casos de Uso */
export class ConvertirCaptacionPendienteUseCase
  implements
    CasoDeUso<ConvertirCaptacionPendienteDTO, Resultado<CaptacionConvertidaDTO, ErrorDeDominio>>,
    IConvertirCaptacionPendiente
{
  constructor(
    private readonly captacionRepository: ICaptacionPendienteRepository,
    private readonly registroLead: IRegistroLeadCaptacion,
    private readonly registroPropiedad?: IRegistroPropiedadCaptacion,
  ) {}

  async ejecutar(
    input: ConvertirCaptacionPendienteDTO,
  ): Promise<Resultado<CaptacionConvertidaDTO, ErrorDeDominio>> {
    try {
      const captacionPendiente = await this.captacionRepository.obtenerPorId(input.idCaptacion);
      if (!captacionPendiente) return resultadoFallido(captacionNoEncontrada(input.idCaptacion));

      const captacion = captacionPendiente.captacion;
      const lead = await this.registroLead.registrar({
        canal: captacion.canal.valor,
        origen: captacion.origen.valor,
        nombre: captacion.contacto.nombre,
        email: captacion.contacto.email ?? captacion.emailDeContacto,
        telefono: captacion.contacto.telefono,
        tipo: captacion.tipo,
        idAsesor: input.idAsesor,
        idPropiedadInteres: captacion.idPropiedadInteres,
        metadata: captacion.metadata,
      });

      if (!lead.esExito) {
        return resultadoFallido(lead.error);
      }

      let idPropiedadPreliminar: string | undefined;
      if (captacion.tipo === "VENTA" && this.registroPropiedad) {
        const propiedad = await this.registroPropiedad.registrar({
          idLeadOrigen: lead.valor.id,
          asesorCaptadorId: lead.valor.idAsesor,
          nombreContacto: captacion.contacto.nombre,
          origen: captacion.origen.valor,
          metadata: captacion.metadata,
        });

        if (!propiedad.esExito) {
          return resultadoFallido(propiedad.error);
        }

        idPropiedadPreliminar = propiedad.valor.id;
      }

      captacionPendiente.marcarConvertida();
      await this.captacionRepository.guardar(captacionPendiente);

      return resultadoExitoso({
        idLead: lead.valor.id,
        idPropiedadPreliminar,
        captacion: captacionPendienteADTO(captacionPendiente),
      });
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}
