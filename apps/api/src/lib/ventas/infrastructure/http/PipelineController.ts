import {
  type ContextoVentas,
  responderErrorDeDominio,
  responderErrorInterno,
  type VentasControllerDeps,
} from "./VentasHttp";
import { IdUsuario } from "../../../usuarios/domain/value-objects/IdUsuario";

export class PipelineController {
  constructor(private readonly deps: VentasControllerDeps) {}

  async listar(c: ContextoVentas): Promise<Response> {
    try {
      const authPayload = c.get("authPayload");
      const usuarioRepo = this.deps.crearUsuarioRepo(c);

      let leads;

      if (authPayload.rol === "ADMIN") {
        const useCase = this.deps.crearListarLeads(c);
        const resultado = await useCase.ejecutar({
          idUsuarioEjecutor: authPayload.idUsuario,
          rolEjecutor: authPayload.rol,
        });
        if (!resultado.esExito) return responderErrorDeDominio(c, resultado.error);
        leads = resultado.valor;
      } else {
        const useCase = this.deps.crearListarLeadsPorAsesor(c);
        const resultado = await useCase.ejecutar({ idAsesor: authPayload.idUsuario });
        if (!resultado.esExito) return responderErrorDeDominio(c, resultado.error);
        leads = resultado.valor;
      }

      return c.json({
        success: true,
        data: await Promise.all(
          leads.map(async (lead) => {
            let nombreAsesor: string | undefined;
            try {
              const usuario = await usuarioRepo.obtenerPorId(
                new IdUsuario(lead.idAsesor as string),
              );
              nombreAsesor = usuario?.nombre.valor;
            } catch {
              /* lookup opcional */
            }

            return {
              id: lead.id as string,
              nombre: lead.nombre,
              estado: lead.estado?.valor ?? lead.estado,
              tipo: lead.tipo?.valor ?? lead.tipo,
              idAsesor: lead.idAsesor as string,
              nombreAsesor,
              citasCount: lead.citas.length,
              citas: lead.citas.map((cita) => ({
                id: cita.id as string,
                idLead: cita.idLead as string,
                idPropiedad: cita.idPropiedad,
                fechaInicio: cita.fechaInicio.toISOString(),
                fechaFin: cita.fechaFin.toISOString(),
                estado: cita.estado?.valor ?? cita.estado,
                observacion: cita.observacion,
              })),
            };
          }),
        ),
      });
    } catch (error) {
      return responderErrorInterno(c, "PipelineController.listar:", error);
    }
  }
}
