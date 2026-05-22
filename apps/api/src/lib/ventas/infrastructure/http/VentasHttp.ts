import { type Context } from "hono";
import { ErrorDeDominio } from "../../../shared/domain";
import { type D1DatabaseLike, type SessionClaims } from "../../../shared/infrastructure";
import {
  type IActualizarCita,
  type IActualizarCliente,
  type IActualizarLead,
  type IAgendarCita,
  type ICrearContrato,
  type IConvertirLeadACliente,
  type IFirmarContrato,
  type IListarActividadLead,
  type IListarClientes,
  type IListarContratos,
  type IListarLeadsPorAsesor,
  type IRegistrarClienteDirecto,
  type IRegistrarLead,
} from "../../application";

export type BindingsVentas = {
  DB: D1DatabaseLike;
};

type AppVariables = {
  authPayload: SessionClaims;
};

export type ContextoVentas = Context<{ Bindings: BindingsVentas; Variables: AppVariables }>;

export type VentasControllerDeps = Readonly<{
  crearRegistrarLead: (c: ContextoVentas) => IRegistrarLead;
  crearAgendarCita: (c: ContextoVentas) => IAgendarCita;
  crearRegistrarClienteDirecto: (c: ContextoVentas) => IRegistrarClienteDirecto;
  crearConvertirLeadACliente: (c: ContextoVentas) => IConvertirLeadACliente;
  crearActualizarLead: (c: ContextoVentas) => IActualizarLead;
  crearActualizarCita: (c: ContextoVentas) => IActualizarCita;
  crearListarLeadsPorAsesor: (c: ContextoVentas) => IListarLeadsPorAsesor;
  crearListarClientes: (c: ContextoVentas) => IListarClientes;
  crearActualizarCliente?: (c: ContextoVentas) => IActualizarCliente;
  crearCrearContrato: (c: ContextoVentas) => ICrearContrato;
  crearListarContratos: (c: ContextoVentas) => IListarContratos;
  crearFirmarContrato: (c: ContextoVentas) => IFirmarContrato;
  crearListarActividadLead: (c: ContextoVentas) => IListarActividadLead;
}>;

export function responderErrorDeDominio(
  c: ContextoVentas,
  error: ErrorDeDominio,
  status: 400 | 401 | 403 | 404 | 409 = 400,
): Response {
  const statusFinal =
    error.codigo === "SIN_PERMISOS_LEAD"
      ? 403
      : error.codigo.includes("NOT_FOUND") || error.codigo.includes("NO_ENCONTRADO")
        ? 404
        : status;

  return c.json({ success: false, message: error.message, code: error.codigo }, statusFinal);
}

export function responderErrorInterno(
  c: ContextoVentas,
  contexto: string,
  error: unknown,
): Response {
  console.error(contexto, error);

  return c.json({ success: false, message: "Error interno", code: "VENTAS_ERROR_INTERNO" }, 500);
}
