import {
  type ActualizarCitaBodyDTO,
  type AgendarCitaInputDTO,
} from "../../application/dto/LeadDTOs";
import {
  type ContextoVentas,
  responderErrorDeDominio,
  responderErrorInterno,
  type VentasControllerDeps,
} from "./VentasHttp";

export class CitasController {
  constructor(private readonly deps: VentasControllerDeps) {}

  async agendar(c: ContextoVentas): Promise<Response> {
    try {
      const body = await c.req.json<AgendarCitaInputDTO>();
      const authPayload = c.get("authPayload");
      const useCase = this.deps.crearAgendarCita(c);

      const resultado = await useCase.ejecutar({
        ...body,
        fechaInicio: new Date(body.fechaInicio),
        usuarioAutenticado: { id: authPayload.idUsuario, rol: authPayload.rol },
      });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, message: "Cita agendada" });
    } catch (error) {
      return responderErrorInterno(c, "CitasController.agendar:", error);
    }
  }

  async actualizar(c: ContextoVentas): Promise<Response> {
    try {
      const idLead = c.req.param("idLead") ?? "";
      const idCita = c.req.param("idCita") ?? "";
      const body = await c.req.json<ActualizarCitaBodyDTO>();
      const authPayload = c.get("authPayload");
      const useCase = this.deps.crearActualizarCita(c);

      const resultado = await useCase.ejecutar({
        idLead,
        idCita,
        ...body,
        fechaInicio: body.fechaInicio ? new Date(body.fechaInicio) : undefined,
        usuarioAutenticado: { id: authPayload.idUsuario, rol: authPayload.rol },
      });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, message: "Cita actualizada" });
    } catch (error) {
      return responderErrorInterno(c, "CitasController.actualizar:", error);
    }
  }

  async listar(c: ContextoVentas): Promise<Response> {
    try {
      const useCase = this.deps.crearListarCitas(c);
      const resultado = await useCase.ejecutar();

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, data: resultado.valor });
    } catch (error) {
      return responderErrorInterno(c, "CitasController.listar:", error);
    }
  }

  async obtener(c: ContextoVentas): Promise<Response> {
    try {
      const idLead = c.req.param("idLead") ?? "";
      const idCita = c.req.param("idCita") ?? "";
      const useCase = this.deps.crearObtenerCitaPorId(c);
      const resultado = await useCase.ejecutar({ idLead, idCita });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, data: resultado.valor });
    } catch (error) {
      return responderErrorInterno(c, "CitasController.obtener:", error);
    }
  }
}
