import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { type IAutorizadorVentas } from "../../domain/ports/IAutorizadorVentas";
import { Cita } from "../../domain/entities/Cita";
import { idLead, idCita } from "../../domain/value-objects/Ids";
import { type IGeneradorId } from "../../../shared/domain/ports/IGeneradorId";
import { type IAgendarCita } from "../ports/in";
import { type UsuarioAutenticadoVentas } from "./RegistrarLeadUseCase";

export type AgendarCitaInput = {
  idLead: string;
  idPropiedad?: string;
  fechaInicio: Date;
  duracionMinutos: number;
  observacion?: string;
  usuarioAutenticado?: UsuarioAutenticadoVentas;
};

/** @group Casos de Uso */
export class AgendarCitaUseCase
  implements CasoDeUso<AgendarCitaInput, Resultado<void, ErrorDeDominio>>, IAgendarCita
{
  constructor(
    private readonly repository: IVentasRepository,
    private readonly generadorId: IGeneradorId,
    private readonly autorizador?: IAutorizadorVentas,
  ) {}

  async ejecutar(input: AgendarCitaInput): Promise<Resultado<void, ErrorDeDominio>> {
    try {
      const lead = await this.repository.obtenerLeadPorId(idLead(input.idLead));
      if (!lead)
        return resultadoFallido(
          new ErrorDeDominio("Lead no encontrado", { codigo: "LEAD_NO_ENCONTRADO" }),
        );

      if (!lead.idAsesor) {
        return resultadoFallido(
          new ErrorDeDominio("El lead debe tener un asesor asignado para agendar citas.", {
            codigo: "LEAD_SIN_ASESOR",
          }),
        );
      }

      if (input.usuarioAutenticado?.rol === "ADMIN") {
        return resultadoFallido(
          new ErrorDeDominio("El administrador no agenda citas comerciales.", {
            codigo: "ADMIN_NO_AGENDA_CITAS",
          }),
        );
      }

      if (
        input.usuarioAutenticado &&
        this.autorizador &&
        !this.autorizador.puedeGestionarLead(
          input.usuarioAutenticado.rol,
          input.usuarioAutenticado.id,
          lead.idAsesor as string,
        )
      ) {
        return resultadoFallido(
          new ErrorDeDominio("No tienes permisos para gestionar este lead.", {
            codigo: "SIN_PERMISOS_LEAD",
          }),
        );
      }

      const fechaFin = new Date(input.fechaInicio.getTime() + input.duracionMinutos * 60000);

      const cita = Cita.crear({
        id: idCita(this.generadorId.generar()),
        idLead: lead.id,
        idPropiedad: input.idPropiedad,
        fechaInicio: input.fechaInicio,
        fechaFin: fechaFin,
        observacion: input.observacion,
      });

      lead.agendarCita(cita);
      await this.repository.guardarLead(lead);
      await this.repository.registrarActividad(
        lead.id,
        "CITA_AGENDADA",
        `Cita agendada para el ${input.fechaInicio.toLocaleString()}`,
      );

      return resultadoExitoso(undefined);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}
