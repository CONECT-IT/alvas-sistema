import { type Context } from "hono";
import { type D1DatabaseLike, type SessionClaims } from "../../../shared/infrastructure";
import {
  type IActualizarCita,
  type IActualizarCliente,
  type IActualizarLead,
  type IAgendarCita,
  type IAsignarLeadAAsesor,
  type ICancelarContrato,
  type ICrearContrato,
  type IConvertirLeadACliente,
  type IFirmarContrato,
  type IListarActividadLead,
  type IListarAsesoresConLeads,
  type IListarCitas,
  type IListarClientes,
  type IListarContratos,
  type IListarContratosPorAsesor,
  type IListarLeads,
  type IListarLeadsPorAsesor,
  type IListarPipeline,
  type IListarPropiedadesPorCliente,
  type IObtenerCitaPorId,
  type IObtenerCliente,
  type IObtenerLead,
  type IRegistrarClienteDirecto,
  type IRegistrarLead,
} from "../../application";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { type IPropiedadRepository } from "../../../propiedades/domain/ports/IPropiedadRepository";
import { type IUsuarioRepository } from "../../../usuarios/domain/ports/IUsuarioRepository";
import {
  responderErrorDeDominio,
  responderErrorInterno,
} from "../../../shared/infrastructure/http/responses";

export type BindingsVentas = {
  DB: D1DatabaseLike;
};

type AppVariables = {
  authPayload: SessionClaims;
};

export type ContextoVentas = Context<{ Bindings: BindingsVentas; Variables: AppVariables }>;

export { responderErrorDeDominio, responderErrorInterno };

export type VentasControllerDeps = Readonly<{
  crearRegistrarLead: (c: ContextoVentas) => IRegistrarLead;
  crearAgendarCita: (c: ContextoVentas) => IAgendarCita;
  crearRegistrarClienteDirecto: (c: ContextoVentas) => IRegistrarClienteDirecto;
  crearConvertirLeadACliente: (c: ContextoVentas) => IConvertirLeadACliente;
  crearActualizarLead: (c: ContextoVentas) => IActualizarLead;
  crearActualizarCita: (c: ContextoVentas) => IActualizarCita;
  crearListarLeadsPorAsesor: (c: ContextoVentas) => IListarLeadsPorAsesor;
  crearListarClientes: (c: ContextoVentas) => IListarClientes;
  crearObtenerLead: (c: ContextoVentas) => IObtenerLead;
  crearListarLeads: (c: ContextoVentas) => IListarLeads;
  crearAsignarLeadAAsesor: (c: ContextoVentas) => IAsignarLeadAAsesor;
  crearListarAsesoresConLeads: (c: ContextoVentas) => IListarAsesoresConLeads;
  crearListarCitas: (c: ContextoVentas) => IListarCitas;
  crearObtenerCitaPorId: (c: ContextoVentas) => IObtenerCitaPorId;
  crearObtenerCliente: (c: ContextoVentas) => IObtenerCliente;
  crearActualizarCliente: (c: ContextoVentas) => IActualizarCliente;
  crearListarPropiedadesPorCliente: (c: ContextoVentas) => IListarPropiedadesPorCliente;
  crearCrearContrato: (c: ContextoVentas) => ICrearContrato;
  crearListarContratos: (c: ContextoVentas) => IListarContratos;
  crearListarContratosPorAsesor: (c: ContextoVentas) => IListarContratosPorAsesor;
  crearFirmarContrato: (c: ContextoVentas) => IFirmarContrato;
  crearCancelarContrato: (c: ContextoVentas) => ICancelarContrato;
  crearListarActividadLead: (c: ContextoVentas) => IListarActividadLead;
  crearListarPipeline: (c: ContextoVentas) => IListarPipeline;
  crearVentasRepo: (c: ContextoVentas) => IVentasRepository;
  crearPropiedadRepo: (c: ContextoVentas) => IPropiedadRepository;
  crearUsuarioRepo: (c: ContextoVentas) => IUsuarioRepository;
}>;
