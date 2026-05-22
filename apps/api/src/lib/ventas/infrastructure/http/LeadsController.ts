import {
  type ActualizarLeadBodyDTO,
  type ConvertirLeadInputDTO,
  type RegistrarLeadInputDTO,
} from "../../application/dto/LeadDTOs";
import {
  type ContextoVentas,
  responderErrorDeDominio,
  responderErrorInterno,
  type VentasControllerDeps,
} from "./VentasHttp";

export class LeadsController {
  constructor(private readonly deps: VentasControllerDeps) {}

  async registrar(c: ContextoVentas): Promise<Response> {
    try {
      const body = await c.req.json<RegistrarLeadInputDTO>();
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
      const body = await c.req.json<ActualizarLeadBodyDTO>();
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
      const body = await c.req.json<ConvertirLeadInputDTO>();
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
}
