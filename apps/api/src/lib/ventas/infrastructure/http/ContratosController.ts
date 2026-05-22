import { type CrearContratoInputDTO } from "../../application/dto/ContratoDTOs";
import {
  type ContextoVentas,
  responderErrorDeDominio,
  responderErrorInterno,
  type VentasControllerDeps,
} from "./VentasHttp";

export class ContratosController {
  constructor(private readonly deps: VentasControllerDeps) {}

  async crear(c: ContextoVentas): Promise<Response> {
    try {
      const body = await c.req.json<Partial<CrearContratoInputDTO>>();
      const useCase = this.deps.crearCrearContrato(c);
      const resultado = await useCase.ejecutar({
        id: body.id ?? crypto.randomUUID(),
        idLead: body.idLead ?? "",
        idPropiedad: body.idPropiedad ?? "",
        fechaInicio: body.fechaInicio ? new Date(body.fechaInicio) : new Date(),
        fechaFin: body.fechaFin ? new Date(body.fechaFin) : new Date(),
      });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, data: resultado.valor }, 201);
    } catch (error) {
      return responderErrorInterno(c, "ContratosController.crear:", error);
    }
  }

  async listar(c: ContextoVentas): Promise<Response> {
    try {
      const useCase = this.deps.crearListarContratos(c);
      const resultado = await useCase.ejecutar();

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, data: resultado.valor.contratos });
    } catch (error) {
      return responderErrorInterno(c, "ContratosController.listar:", error);
    }
  }

  async listarPorAsesor(c: ContextoVentas): Promise<Response> {
    try {
      const authPayload = c.get("authPayload");
      const idAsesor = authPayload?.id ?? "";
      const useCase = this.deps.crearListarContratosPorAsesor(c);
      const resultado = await useCase.ejecutar({ idAsesor });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, data: resultado.valor.contratos });
    } catch (error) {
      return responderErrorInterno(c, "ContratosController.listarPorAsesor:", error);
    }
  }

  async firmar(c: ContextoVentas): Promise<Response> {
    try {
      const useCase = this.deps.crearFirmarContrato(c);
      const resultado = await useCase.ejecutar({ idContrato: c.req.param("idContrato") ?? "" });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, message: "Contrato firmado" });
    } catch (error) {
      return responderErrorInterno(c, "ContratosController.firmar:", error);
    }
  }
}
