import {
  type ContextoVentas,
  responderErrorDeDominio,
  responderErrorInterno,
  type VentasControllerDeps,
} from "./VentasHttp";

/** @group Controladores HTTP */
export class PipelineController {
  constructor(private readonly deps: VentasControllerDeps) {}

  async listar(c: ContextoVentas): Promise<Response> {
    try {
      const authPayload = c.get("authPayload");
      const useCase = this.deps.crearListarPipeline(c);
      const resultado = await useCase.ejecutar({
        idUsuarioEjecutor: authPayload.idUsuario,
        rolEjecutor: authPayload.rol,
      });

      if (!resultado.esExito) return responderErrorDeDominio(c, resultado.error);

      return c.json({ success: true, data: resultado.valor });
    } catch (error) {
      return responderErrorInterno(c, "PipelineController.listar:", error);
    }
  }
}
