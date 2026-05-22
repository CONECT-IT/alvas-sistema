import {
  type ContextoVentas,
  responderErrorDeDominio,
  responderErrorInterno,
  type VentasControllerDeps,
} from "./VentasHttp";

export class PipelineController {
  constructor(private readonly deps: VentasControllerDeps) {}

  async listar(c: ContextoVentas): Promise<Response> {
    try {
      const authPayload = c.get("authPayload");
      const useCase = this.deps.crearListarLeadsPorAsesor(c);
      const resultado = await useCase.ejecutar({ idAsesor: authPayload.idUsuario });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      const leads = resultado.valor;

      return c.json({
        success: true,
        data: leads.map((lead) => ({
          id: lead.id as string,
          nombre: lead.nombre,
          estado: lead.estado.valor,
          tipo: lead.tipo.valor,
          citasCount: lead.citas.length,
          citas: lead.citas.map((cita) => ({
            id: cita.id as string,
            idLead: cita.idLead as string,
            idPropiedad: cita.idPropiedad,
            fechaInicio: cita.fechaInicio.toISOString(),
            fechaFin: cita.fechaFin.toISOString(),
            estado: cita.estado,
            observacion: cita.observacion,
          })),
        })),
      });
    } catch (error) {
      return responderErrorInterno(c, "PipelineController.listar:", error);
    }
  }
}
