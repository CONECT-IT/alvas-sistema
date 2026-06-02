import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { type SessionClaims } from "../../../shared/infrastructure";
import { CitasController } from "./CitasController";
import { ClientesController } from "./ClientesController";
import { ContratosController } from "./ContratosController";
import { LeadsController } from "./LeadsController";
import { PipelineController } from "./PipelineController";
import { type BindingsVentas, type VentasControllerDeps } from "./VentasHttp";
import {
  h,
  json,
  success,
  successOnly,
  error,
  bearer,
  idParam,
  validationHook,
} from "../../../shared/infrastructure/openapi/openapi-utils";
import {
  LeadSchema,
  ClienteSchema,
  PropiedadSchema,
  schemasEntrada,
} from "../../../shared/infrastructure/openapi/OpenApiSchemas";

export function crearVentasRouter(deps: VentasControllerDeps) {
  const ventasRouter = new OpenAPIHono<{
    Bindings: BindingsVentas;
    Variables: { authPayload: SessionClaims };
  }>({ defaultHook: validationHook });
  const leads = new LeadsController(deps);
  const citas = new CitasController(deps);
  const clientes = new ClientesController(deps);
  const contratos = new ContratosController(deps);
  const pipeline = new PipelineController(deps);

  ventasRouter.openapi(
    createRoute({
      method: "get",
      path: "/pipeline",
      tags: ["Ventas"],
      summary: "Lista pipeline comercial",
      security: bearer,
      responses: { 200: success(z.array(LeadSchema), "Pipeline"), 401: error },
    }),
    h((c) => pipeline.listar(c)),
  );
  ventasRouter.openapi(
    createRoute({
      method: "post",
      path: "/lead",
      tags: ["Ventas"],
      summary: "Registra lead",
      security: bearer,
      request: { body: { ...json(schemasEntrada.RegistrarLeadSchema), required: true } },
      responses: { 201: success(LeadSchema, "Lead registrado"), 400: error },
    }),
    h((c) => leads.registrar(c)),
  );
  ventasRouter.openapi(
    createRoute({
      method: "get",
      path: "/lead/{id}",
      tags: ["Ventas"],
      summary: "Obtiene lead",
      security: bearer,
      request: { params: idParam("id") },
      responses: { 200: success(LeadSchema, "Lead"), 404: error },
    }),
    h((c) => leads.obtener(c)),
  );
  ventasRouter.openapi(
    createRoute({
      method: "put",
      path: "/lead/{id}",
      tags: ["Ventas"],
      summary: "Actualiza lead",
      security: bearer,
      request: {
        params: idParam("id"),
        body: { ...json(schemasEntrada.ActualizarLeadSchema), required: true },
      },
      responses: { 200: success(LeadSchema, "Lead actualizado"), 400: error },
    }),
    h((c) => leads.actualizar(c)),
  );
  ventasRouter.openapi(
    createRoute({
      method: "put",
      path: "/lead/{id}/asesor",
      tags: ["Ventas"],
      summary: "Asigna asesor a lead",
      security: bearer,
      request: {
        params: idParam("id"),
        body: { ...json(schemasEntrada.AsignarLeadAsesorSchema), required: true },
      },
      responses: { 200: successOnly("Lead reasignado"), 400: error },
    }),
    h((c) => leads.asignarAsesor(c)),
  );
  ventasRouter.openapi(
    createRoute({
      method: "post",
      path: "/convertir",
      tags: ["Ventas"],
      summary: "Convierte lead a cliente",
      security: bearer,
      request: { body: { ...json(schemasEntrada.ConvertirLeadSchema), required: true } },
      responses: { 200: successOnly("Lead convertido"), 400: error },
    }),
    h((c) => leads.convertirACliente(c)),
  );
  ventasRouter.openapi(
    createRoute({
      method: "get",
      path: "/leads",
      tags: ["Ventas"],
      summary: "Lista leads",
      security: bearer,
      responses: { 200: success(z.array(LeadSchema), "Leads"), 401: error },
    }),
    h((c) => leads.listarTodos(c)),
  );
  ventasRouter.openapi(
    createRoute({
      method: "get",
      path: "/asesores",
      tags: ["Ventas"],
      summary: "Lista asesores con leads",
      security: bearer,
      responses: {
        200: success(z.array(z.object({ idAsesor: z.string(), totalLeads: z.number() }))),
      },
    }),
    h((c) => leads.listarAsesores(c)),
  );
  ventasRouter.openapi(
    createRoute({
      method: "post",
      path: "/cita",
      tags: ["Ventas"],
      summary: "Agenda cita",
      security: bearer,
      request: { body: { ...json(schemasEntrada.AgendarCitaSchema), required: true } },
      responses: { 200: successOnly("Cita agendada"), 400: error },
    }),
    h((c) => citas.agendar(c)),
  );
  ventasRouter.openapi(
    createRoute({
      method: "get",
      path: "/citas",
      tags: ["Ventas"],
      summary: "Lista citas",
      security: bearer,
      responses: { 200: success(z.array(z.record(z.string(), z.unknown())), "Citas") },
    }),
    h((c) => citas.listar(c)),
  );
  ventasRouter.openapi(
    createRoute({
      method: "get",
      path: "/lead/{idLead}/cita/{idCita}",
      tags: ["Ventas"],
      summary: "Obtiene cita de un lead",
      security: bearer,
      request: {
        params: idParam("idLead").extend({
          idCita: z.string().openapi({
            param: { name: "idCita", in: "path" },
            example: "cita-001",
          }),
        }),
      },
      responses: { 200: success(z.record(z.string(), z.unknown()), "Cita"), 404: error },
    }),
    h((c) => citas.obtener(c)),
  );
  ventasRouter.openapi(
    createRoute({
      method: "put",
      path: "/lead/{idLead}/cita/{idCita}",
      tags: ["Ventas"],
      summary: "Actualiza cita",
      security: bearer,
      request: {
        params: idParam("idLead").extend({
          idCita: z.string().openapi({
            param: { name: "idCita", in: "path" },
            example: "cita-001",
          }),
        }),
        body: { ...json(schemasEntrada.ActualizarCitaBodySchema), required: true },
      },
      responses: { 200: successOnly("Cita actualizada"), 400: error },
    }),
    h((c) => citas.actualizar(c)),
  );
  ventasRouter.openapi(
    createRoute({
      method: "get",
      path: "/clientes",
      tags: ["Ventas"],
      summary: "Lista clientes",
      security: bearer,
      responses: { 200: success(z.array(ClienteSchema), "Clientes") },
    }),
    h((c) => clientes.listar(c)),
  );
  ventasRouter.openapi(
    createRoute({
      method: "get",
      path: "/cliente/{id}",
      tags: ["Ventas"],
      summary: "Obtiene cliente",
      security: bearer,
      request: { params: idParam("id") },
      responses: { 200: success(ClienteSchema, "Cliente"), 404: error },
    }),
    h((c) => clientes.obtener(c)),
  );
  ventasRouter.openapi(
    createRoute({
      method: "put",
      path: "/cliente/{id}",
      tags: ["Ventas"],
      summary: "Actualiza cliente",
      security: bearer,
      request: {
        params: idParam("id"),
        body: { ...json(schemasEntrada.ActualizarClienteSchema), required: true },
      },
      responses: { 200: success(ClienteSchema, "Cliente actualizado"), 400: error },
    }),
    h((c) => clientes.actualizar(c)),
  );
  ventasRouter.openapi(
    createRoute({
      method: "get",
      path: "/cliente/{id}/propiedades",
      tags: ["Ventas"],
      summary: "Lista propiedades vinculadas a cliente",
      security: bearer,
      request: { params: idParam("id") },
      responses: { 200: success(z.array(PropiedadSchema), "Propiedades del cliente") },
    }),
    h((c) => clientes.listarPropiedades(c)),
  );
  ventasRouter.openapi(
    createRoute({
      method: "post",
      path: "/cliente",
      tags: ["Ventas"],
      summary: "Registra cliente directo",
      security: bearer,
      request: { body: { ...json(schemasEntrada.RegistrarClienteDirectoSchema), required: true } },
      responses: { 201: success(ClienteSchema, "Cliente registrado"), 400: error },
    }),
    h((c) => clientes.registrarDirecto(c)),
  );
  ventasRouter.openapi(
    createRoute({
      method: "get",
      path: "/contratos",
      tags: ["Ventas"],
      summary: "Lista contratos",
      security: bearer,
      responses: { 200: success(z.array(z.record(z.string(), z.unknown())), "Contratos") },
    }),
    h((c) => contratos.listar(c)),
  );
  ventasRouter.openapi(
    createRoute({
      method: "post",
      path: "/contratos",
      tags: ["Ventas"],
      summary: "Crea contrato",
      security: bearer,
      request: { body: { ...json(schemasEntrada.CrearContratoSchema), required: true } },
      responses: { 201: successOnly("Contrato creado"), 400: error },
    }),
    h((c) => contratos.crear(c)),
  );
  ventasRouter.openapi(
    createRoute({
      method: "get",
      path: "/contratos/mios",
      tags: ["Ventas"],
      summary: "Lista contratos del asesor autenticado",
      security: bearer,
      responses: {
        200: success(z.array(z.record(z.string(), z.unknown())), "Contratos del asesor"),
      },
    }),
    h((c) => contratos.listarPorAsesor(c)),
  );
  ventasRouter.openapi(
    createRoute({
      method: "post",
      path: "/contratos/{idContrato}/firmar",
      tags: ["Ventas"],
      summary: "Firma contrato",
      security: bearer,
      request: { params: idParam("idContrato") },
      responses: { 200: successOnly("Contrato firmado"), 400: error },
    }),
    h((c) => contratos.firmar(c)),
  );
  ventasRouter.openapi(
    createRoute({
      method: "post",
      path: "/contratos/{idContrato}/cancelar",
      tags: ["Ventas"],
      summary: "Cancela contrato",
      security: bearer,
      request: { params: idParam("idContrato") },
      responses: { 200: successOnly("Contrato cancelado"), 400: error },
    }),
    h((c) => contratos.cancelar(c)),
  );
  ventasRouter.openapi(
    createRoute({
      method: "get",
      path: "/lead/{idLead}/actividad",
      tags: ["Ventas"],
      summary: "Lista actividad de un lead",
      security: bearer,
      request: { params: idParam("idLead") },
      responses: {
        200: success(z.array(z.record(z.string(), z.unknown())), "Actividad del lead"),
      },
    }),
    h((c) => leads.listarActividad(c)),
  );

  return ventasRouter;
}
