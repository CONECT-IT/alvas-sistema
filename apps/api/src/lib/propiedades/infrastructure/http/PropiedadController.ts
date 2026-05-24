import { type Context } from "hono";
import { ErrorDeDominio } from "../../../shared/domain";
import { type D1DatabaseLike, type SessionClaims } from "../../../shared/infrastructure";
import {
  type IActualizarPropiedad,
  type ICrearPropiedad,
  type IEliminarPropiedad,
  type IListarPropiedades,
  type PropiedadRespuestaDTO,
} from "../../application";
import { type IAutorizadorPropiedades } from "../../domain/ports";
import {
  parseBody,
  esValidationError,
  formatearValidacion,
} from "../../../shared/infrastructure/validation/helpers";
import { CrearPropiedadSchema, ActualizarPropiedadSchema } from "../validation/schemas";

export type BindingsPropiedades = {
  DB: D1DatabaseLike;
};

type AppVariables = {
  authPayload: SessionClaims;
};

type ContextoPropiedades = Context<{ Bindings: BindingsPropiedades; Variables: AppVariables }>;

export type PropiedadControllerDeps = Readonly<{
  crearCrearPropiedad: (c: ContextoPropiedades) => ICrearPropiedad;
  crearListarPropiedades: (c: ContextoPropiedades) => IListarPropiedades;
  crearActualizarPropiedad: (c: ContextoPropiedades) => IActualizarPropiedad;
  crearEliminarPropiedad: (c: ContextoPropiedades) => IEliminarPropiedad;
}>;

export class PropiedadController {
  constructor(
    private readonly autorizador: IAutorizadorPropiedades,
    private readonly deps: PropiedadControllerDeps,
  ) {}

  async crear(c: ContextoPropiedades): Promise<Response> {
    try {
      const body = parseBody(CrearPropiedadSchema, await c.req.json());
      const authPayload = c.get("authPayload");
      const useCase = this.deps.crearCrearPropiedad(c);

      const resultado = await useCase.ejecutar({
        ...body,
        usuarioAutenticado: { id: authPayload.idUsuario, rol: authPayload.rol },
      });

      if (!resultado.esExito) {
        const err = resultado.error as ErrorDeDominio;
        return c.json({ success: false, message: err.message, code: err.codigo }, 403);
      }

      return c.json({ success: true, data: { id: resultado.valor.id as string } }, 201);
    } catch (error) {
      if (esValidationError(error)) return c.json(formatearValidacion(error), 400);
      console.error("PropiedadController.crear:", error);
      return c.json({ success: false, message: "Error interno" }, 500);
    }
  }

  async listar(c: ContextoPropiedades): Promise<Response> {
    try {
      const authPayload = c.get("authPayload");
      const leadId = c.req.query("leadId");
      const useCase = this.deps.crearListarPropiedades(c);

      const resultado = await useCase.ejecutar({
        usuarioAutenticado: { id: authPayload.idUsuario, rol: authPayload.rol },
      });

      if (!resultado.esExito) {
        const err = resultado.error as ErrorDeDominio;
        return c.json({ success: false, message: err.message, code: err.codigo }, 403);
      }

      let propiedades = resultado.valor;

      if (leadId) {
        propiedades = propiedades.filter((p) => p.idLeadOrigen === leadId);
      }

      const respuesta: PropiedadRespuestaDTO[] = propiedades.map((p) => ({
        id: p.id as string,
        titulo: p.titulo,
        descripcion: p.descripcion,
        precio: p.precio,
        origen: p.origen as string,
        estado: p.estado.valor,
        idLeadOrigen: p.idLeadOrigen,
        idClientePropietario: p.idClientePropietario,
        captadaPorAsesorId: p.captadaPorAsesorId as string | undefined,
        asesorResponsableId: p.asesorResponsableId as string | undefined,
      }));

      return c.json({
        success: true,
        data: respuesta,
      });
    } catch (error) {
      console.error("PropiedadController.listar:", error);
      return c.json({ success: false, message: "Error interno" }, 500);
    }
  }

  async actualizar(c: ContextoPropiedades): Promise<Response> {
    try {
      const body = parseBody(ActualizarPropiedadSchema, await c.req.json());
      const authPayload = c.get("authPayload");
      const useCase = this.deps.crearActualizarPropiedad(c);

      const resultado = await useCase.ejecutar({
        idPropiedad: c.req.param("idPropiedad") ?? "",
        ...body,
        usuarioAutenticado: { id: authPayload.idUsuario, rol: authPayload.rol },
      });

      if (!resultado.esExito) {
        const err = resultado.error as ErrorDeDominio;
        return c.json(
          { success: false, message: err.message, code: err.codigo },
          err.codigo === "NO_ENCONTRADA" ? 404 : 403,
        );
      }

      return c.json({ success: true, message: "Propiedad actualizada" });
    } catch (error) {
      if (esValidationError(error)) return c.json(formatearValidacion(error), 400);
      console.error("PropiedadController.actualizar:", error);
      return c.json({ success: false, message: "Error interno" }, 500);
    }
  }

  async eliminar(c: ContextoPropiedades): Promise<Response> {
    try {
      const authPayload = c.get("authPayload");
      const useCase = this.deps.crearEliminarPropiedad(c);

      const resultado = await useCase.ejecutar({
        idPropiedad: c.req.param("idPropiedad") ?? "",
        usuarioAutenticado: { id: authPayload.idUsuario, rol: authPayload.rol },
      });

      if (!resultado.esExito) {
        const err = resultado.error as ErrorDeDominio;
        return c.json(
          { success: false, message: err.message, code: err.codigo },
          err.codigo === "NO_ENCONTRADA" ? 404 : 403,
        );
      }

      return c.json({ success: true, message: "Propiedad eliminada" });
    } catch (error) {
      console.error("PropiedadController.eliminar:", error);
      return c.json({ success: false, message: "Error interno" }, 500);
    }
  }
}
