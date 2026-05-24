import {
  type ContextoVentas,
  responderErrorDeDominio,
  responderErrorInterno,
  type VentasControllerDeps,
} from "./VentasHttp";
import {
  parseBody,
  esValidationError,
  formatearValidacion,
} from "../../../shared/infrastructure/validation/helpers";
import { AgendarCitaSchema, ActualizarCitaBodySchema } from "../validation/schemas";

export class CitasController {
  constructor(private readonly deps: VentasControllerDeps) {}

  async agendar(c: ContextoVentas): Promise<Response> {
    try {
      const body = parseBody(AgendarCitaSchema, await c.req.json());
      const authPayload = c.get("authPayload");
      const useCase = this.deps.crearAgendarCita(c);

      const resultado = await useCase.ejecutar({
        ...body,
        usuarioAutenticado: { id: authPayload.idUsuario, rol: authPayload.rol },
      });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, message: "Cita agendada" });
    } catch (error) {
      if (esValidationError(error)) return c.json(formatearValidacion(error), 400);
      return responderErrorInterno(c, "CitasController.agendar:", error);
    }
  }

  async actualizar(c: ContextoVentas): Promise<Response> {
    try {
      const idLead = c.req.param("idLead") ?? "";
      const idCita = c.req.param("idCita") ?? "";
      const body = parseBody(ActualizarCitaBodySchema, await c.req.json());
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
      if (esValidationError(error)) return c.json(formatearValidacion(error), 400);
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

      const data = resultado.valor.map((cita) => ({
        id: cita.id,
        idLead: cita.idLead,
        idPropiedad: cita.idPropiedad,
        idAsesor: cita.idAsesor,
        fechaInicio: cita.fechaInicio.toISOString(),
        fechaFin: cita.fechaFin.toISOString(),
        estado: cita.estado,
        observacion: cita.observacion,
      }));

      return c.json({ success: true, data });
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

      const cita = resultado.valor;
      const data = {
        id: cita.id as string,
        idLead: cita.idLead as string,
        idPropiedad: cita.idPropiedad,
        fechaInicio: cita.fechaInicio.toISOString(),
        fechaFin: cita.fechaFin.toISOString(),
        estado: cita.estado,
        observacion: cita.observacion,
      };

      return c.json({ success: true, data });
    } catch (error) {
      return responderErrorInterno(c, "CitasController.obtener:", error);
    }
  }
}
