import {
  type ContextoVentas,
  responderErrorDeDominio,
  responderErrorInterno,
  type VentasControllerDeps,
} from "./VentasHttp";
import { parseBody } from "../../../shared/infrastructure/validation/helpers";
import {
  RegistrarLeadSchema,
  ActualizarLeadSchema,
  ConvertirLeadSchema,
  AsignarLeadAsesorSchema,
} from "../validation/schemas";

export class LeadsController {
  constructor(private readonly deps: VentasControllerDeps) {}

  async registrar(c: ContextoVentas): Promise<Response> {
    try {
      const body = parseBody(RegistrarLeadSchema, await c.req.json());
      const authPayload = c.get("authPayload");
      const useCase = this.deps.crearRegistrarLead(c);

      const resultado = await useCase.ejecutar({
        ...body,
        idAsesor: authPayload.rol === "ADMIN" ? body.idAsesor : authPayload.idUsuario,
        usuarioAutenticado: { id: authPayload.idUsuario, rol: authPayload.rol },
      });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, data: { id: resultado.valor.id as string } }, 201);
    } catch (error) {
      return responderErrorInterno(c, "LeadsController.registrar:", error);
    }
  }

  async actualizar(c: ContextoVentas): Promise<Response> {
    try {
      const id = c.req.param("id") ?? "";
      const body = parseBody(ActualizarLeadSchema, await c.req.json());
      const authPayload = c.get("authPayload");
      const useCase = this.deps.crearActualizarLead(c);

      const resultado = await useCase.ejecutar({
        id,
        ...body,
        usuarioAutenticado: { id: authPayload.idUsuario, rol: authPayload.rol },
      });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, message: "Lead actualizado" });
    } catch (error) {
      return responderErrorInterno(c, "LeadsController.actualizar:", error);
    }
  }

  async convertirACliente(c: ContextoVentas): Promise<Response> {
    try {
      const body = parseBody(ConvertirLeadSchema, await c.req.json());
      const authPayload = c.get("authPayload");
      const useCase = this.deps.crearConvertirLeadACliente(c);
      const resultado = await useCase.ejecutar({
        ...body,
        usuarioAutenticado: { id: authPayload.idUsuario, rol: authPayload.rol },
      });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, data: { idCliente: resultado.valor.id as string } });
    } catch (error) {
      return responderErrorInterno(c, "LeadsController.convertirACliente:", error);
    }
  }

  async listarActividad(c: ContextoVentas): Promise<Response> {
    try {
      const id = c.req.param("idLead") ?? "";
      const useCase = this.deps.crearListarActividadLead(c);
      const resultado = await useCase.ejecutar({ idLead: id });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, data: resultado.valor });
    } catch (error) {
      return responderErrorInterno(c, "LeadsController.listarActividad:", error);
    }
  }

  async obtener(c: ContextoVentas): Promise<Response> {
    try {
      const id = c.req.param("id") ?? "";
      const useCase = this.deps.crearObtenerLead(c);
      const resultado = await useCase.ejecutar({ id });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      const lead = resultado.valor;
      const data = {
        id: lead.id as string,
        nombre: lead.nombre,
        email: lead.email,
        telefono: lead.telefono,
        tipo: lead.tipo.valor,
        estado: lead.estado.valor,
        idAsesor: lead.idAsesor as string,
        idCliente: (lead.idCliente as string | undefined) ?? null,
        idPropiedadInteres: (lead.idPropiedadInteres as string | undefined) ?? null,
        citas: lead.citas.map((cita) => ({
          id: cita.id as string,
          idLead: cita.idLead as string,
          idPropiedad: cita.idPropiedad,
          fechaInicio: cita.fechaInicio.toISOString(),
          fechaFin: cita.fechaFin.toISOString(),
          estado: cita.estado.valor,
          observacion: cita.observacion,
        })),
        creadoEn: lead.creadoEn.toISOString(),
        actualizadoEn: lead.actualizadoEn.toISOString(),
      };

      return c.json({ success: true, data });
    } catch (error) {
      return responderErrorInterno(c, "LeadsController.obtener:", error);
    }
  }

  async listarTodos(c: ContextoVentas): Promise<Response> {
    try {
      const authPayload = c.get("authPayload");
      const useCase = this.deps.crearListarLeads(c);
      const resultado = await useCase.ejecutar({
        idUsuarioEjecutor: authPayload.idUsuario,
        rolEjecutor: authPayload.rol,
      });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      const data = resultado.valor.map((lead) => ({
        id: lead.id as string,
        nombre: lead.nombre,
        email: lead.email,
        telefono: lead.telefono,
        tipo: lead.tipo.valor,
        estado: lead.estado.valor,
        idAsesor: lead.idAsesor as string,
        idCliente: (lead.idCliente as string | undefined) ?? null,
        idPropiedadInteres: (lead.idPropiedadInteres as string | undefined) ?? null,
        citas: lead.citas.map((cita) => ({
          id: cita.id as string,
          idLead: cita.idLead as string,
          idPropiedad: cita.idPropiedad,
          fechaInicio: cita.fechaInicio.toISOString(),
          fechaFin: cita.fechaFin.toISOString(),
          estado: cita.estado.valor,
          observacion: cita.observacion,
        })),
        creadoEn: lead.creadoEn.toISOString(),
        actualizadoEn: lead.actualizadoEn.toISOString(),
      }));

      return c.json({ success: true, data });
    } catch (error) {
      return responderErrorInterno(c, "LeadsController.listarTodos:", error);
    }
  }

  async asignarAsesor(c: ContextoVentas): Promise<Response> {
    try {
      const id = c.req.param("id") ?? "";
      const body = parseBody(AsignarLeadAsesorSchema, await c.req.json());
      const authPayload = c.get("authPayload");
      const useCase = this.deps.crearAsignarLeadAAsesor(c);
      const resultado = await useCase.ejecutar({
        idLead: id,
        idAsesor: body.idAsesor,
        usuarioAutenticado: { id: authPayload.idUsuario, rol: authPayload.rol },
      });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, message: "Lead reasignado" });
    } catch (error) {
      return responderErrorInterno(c, "LeadsController.asignarAsesor:", error);
    }
  }

  async listarAsesores(c: ContextoVentas): Promise<Response> {
    try {
      const useCase = this.deps.crearListarAsesoresConLeads(c);
      const resultado = await useCase.ejecutar();

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, data: resultado.valor });
    } catch (error) {
      return responderErrorInterno(c, "LeadsController.listarAsesores:", error);
    }
  }
}
