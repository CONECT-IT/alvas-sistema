import {
  type ContextoVentas,
  responderErrorDeDominio,
  responderErrorInterno,
  type VentasControllerDeps,
} from "./VentasHttp";
import { idLead, idPropiedad } from "../../domain/value-objects/Ids";
import { parseBody } from "../../../shared/infrastructure/validation/helpers";
import { CrearContratoSchema } from "../validation/schemas";

export class ContratosController {
  constructor(private readonly deps: VentasControllerDeps) {}

  async crear(c: ContextoVentas): Promise<Response> {
    try {
      const body = parseBody(CrearContratoSchema, await c.req.json());
      const useCase = this.deps.crearCrearContrato(c);
      const resultado = await useCase.ejecutar(body);

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

      const ventasRepo = this.deps.crearVentasRepo(c);
      const propRepo = this.deps.crearPropiedadRepo(c);

      const data = await Promise.all(
        (resultado.valor.contratos ?? []).map(async (ctr) => {
          let nombreLead: string | undefined;
          let nombrePropiedad: string | undefined;

          if (ctr.idLead) {
            const lead = await ventasRepo.obtenerLeadPorId(idLead(ctr.idLead));
            nombreLead = lead?.nombre;
          }
          if (ctr.idPropiedad) {
            try {
              const prop = await propRepo.obtenerPorId(idPropiedad(ctr.idPropiedad));
              nombrePropiedad = prop?.titulo;
            } catch {
              /* ignorar */
            }
          }

          return { ...ctr, nombreLead, nombrePropiedad };
        }),
      );

      return c.json({ success: true, data });
    } catch (error) {
      return responderErrorInterno(c, "ContratosController.listar:", error);
    }
  }

  async listarPorAsesor(c: ContextoVentas): Promise<Response> {
    try {
      const authPayload = c.get("authPayload");
      const idAsesor = authPayload.idUsuario;
      const useCase = this.deps.crearListarContratosPorAsesor(c);
      const resultado = await useCase.ejecutar({ idAsesor });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      const ventasRepo = this.deps.crearVentasRepo(c);
      const propRepo = this.deps.crearPropiedadRepo(c);

      const data = await Promise.all(
        (resultado.valor.contratos ?? []).map(async (ctr) => {
          let nombreLead: string | undefined;
          let nombrePropiedad: string | undefined;

          if (ctr.idLead) {
            const lead = await ventasRepo.obtenerLeadPorId(idLead(ctr.idLead));
            nombreLead = lead?.nombre;
          }
          if (ctr.idPropiedad) {
            try {
              const prop = await propRepo.obtenerPorId(idPropiedad(ctr.idPropiedad));
              nombrePropiedad = prop?.titulo;
            } catch {
              /* ignorar */
            }
          }

          return { ...ctr, nombreLead, nombrePropiedad };
        }),
      );

      return c.json({ success: true, data });
    } catch (error) {
      return responderErrorInterno(c, "ContratosController.listarPorAsesor:", error);
    }
  }

  async cancelar(c: ContextoVentas): Promise<Response> {
    try {
      const useCase = this.deps.crearCancelarContrato(c);
      const resultado = await useCase.ejecutar({ idContrato: c.req.param("idContrato") ?? "" });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, message: "Contrato cancelado" });
    } catch (error) {
      return responderErrorInterno(c, "ContratosController.cancelar:", error);
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
