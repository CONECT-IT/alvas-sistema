import { type Context } from "hono";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import {
  type IActualizarUsuario,
  type ICrearUsuario,
  type IListarUsuarios,
  type IObtenerUsuario,
} from "../../application";
import { UsuarioMapper } from "../persistence/UsuarioMapper";
import { parseBody } from "../../../shared/infrastructure/validation/helpers";
import {
  responderErrorDeDominio,
  responderErrorInterno,
} from "../../../shared/infrastructure/http/responses";
import { CrearUsuarioSchema, ActualizarUsuarioSchema } from "../validation/schemas";

export type BindingsUsuarios = {
  DB: D1DatabaseLike;
  AUTH_PEPPER?: string;
};

type ContextoUsuarios = Context<{ Bindings: BindingsUsuarios }>;

export type UsuarioControllerDeps = Readonly<{
  crearCrearUsuario: (c: ContextoUsuarios) => ICrearUsuario;
  crearListarUsuarios: (c: ContextoUsuarios) => IListarUsuarios;
  crearObtenerUsuario: (c: ContextoUsuarios) => IObtenerUsuario;
  crearActualizarUsuario: (c: ContextoUsuarios) => IActualizarUsuario;
}>;

export class UsuarioController {
  constructor(private readonly deps: UsuarioControllerDeps) {}

  async crear(c: ContextoUsuarios): Promise<Response> {
    try {
      const body = parseBody(CrearUsuarioSchema, await c.req.json());
      const useCase = this.deps.crearCrearUsuario(c);
      const resultado = await useCase.ejecutar(body);

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json(
        {
          success: true,
          data: UsuarioMapper.aRespuesta(resultado.valor),
        },
        201,
      );
    } catch (error) {
      return responderErrorInterno(c, "UsuarioController.crear", error);
    }
  }

  async listar(c: ContextoUsuarios): Promise<Response> {
    try {
      const useCase = this.deps.crearListarUsuarios(c);
      const resultado = await useCase.ejecutar();

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, data: resultado.valor });
    } catch (error) {
      return responderErrorInterno(c, "UsuarioController.listar", error);
    }
  }

  async obtener(c: ContextoUsuarios): Promise<Response> {
    try {
      const useCase = this.deps.crearObtenerUsuario(c);
      const resultado = await useCase.ejecutar({ idUsuario: c.req.param("idUsuario") ?? "" });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, data: resultado.valor });
    } catch (error) {
      return responderErrorInterno(c, "UsuarioController.obtener", error);
    }
  }

  async actualizar(c: ContextoUsuarios): Promise<Response> {
    try {
      const body = parseBody(ActualizarUsuarioSchema, await c.req.json());
      const useCase = this.deps.crearActualizarUsuario(c);
      const resultado = await useCase.ejecutar({
        idUsuario: c.req.param("idUsuario") ?? "",
        ...body,
      });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, data: resultado.valor });
    } catch (error) {
      return responderErrorInterno(c, "UsuarioController.actualizar", error);
    }
  }
}
