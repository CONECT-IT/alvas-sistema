import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  AuthDataSchema,
  ClienteSchema,
  ErrorResponseSchema,
  LeadSchema,
  PropiedadSchema,
  ReporteGeneralSchema,
  ResumenAccionesSchema,
  SuccessSchema,
  UsuarioSchema,
  schemasEntrada,
} from "./OpenApiSchemas";

const json = <T extends z.ZodTypeAny>(schema: T) => ({
  content: {
    "application/json": {
      schema,
    },
  },
});

const success = <T extends z.ZodTypeAny>(schema: T, description = "Operacion exitosa") => ({
  ...json(z.object({ success: z.literal(true), data: schema })),
  description,
});

const successOnly = (description = "Operacion exitosa") => ({
  ...json(SuccessSchema),
  description,
});

const error = {
  ...json(ErrorResponseSchema),
  description: "Error de negocio, validacion, autenticacion o sistema",
};

const bearer = [{ bearerAuth: [] }];

const idParam = (name: string) =>
  z.object({
    [name]: z.string().openapi({
      param: { name, in: "path" },
      example: `${name}-001`,
    }),
  });

type Method = "get" | "post" | "put" | "delete";

function registerRoute(params: {
  method: Method;
  path: string;
  tags: string[];
  summary: string;
  security?: { bearerAuth: string[] }[];
  request?: Parameters<typeof createRoute>[0]["request"];
  responses: Parameters<typeof createRoute>[0]["responses"];
}) {
  return createRoute({
    method: params.method,
    path: params.path,
    tags: params.tags,
    summary: params.summary,
    security: params.security,
    request: params.request,
    responses: params.responses,
  });
}

export function crearOpenApiDocument(origin = "http://127.0.0.1:8787") {
  const registry = new OpenAPIHono();

  registry.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  });

  const routes = [
    registerRoute({
      method: "get",
      path: "/health",
      tags: ["Health"],
      summary: "Estado operativo del servicio",
      security: [],
      responses: {
        200: successOnly("Servicio disponible"),
      },
    }),
    registerRoute({
      method: "post",
      path: "/auth/login",
      tags: ["Auth"],
      summary: "Inicia sesion",
      security: [],
      request: { body: { ...json(schemasEntrada.IniciarSesionSchema), required: true } },
      responses: { 200: success(AuthDataSchema, "Sesion iniciada"), 400: error },
    }),
    registerRoute({
      method: "post",
      path: "/auth/refresh",
      tags: ["Auth"],
      summary: "Renueva sesion",
      security: [],
      request: { body: { ...json(schemasEntrada.RenovarSesionSchema), required: true } },
      responses: { 200: success(AuthDataSchema, "Sesion renovada"), 400: error },
    }),
    registerRoute({
      method: "get",
      path: "/usuarios",
      tags: ["Usuarios"],
      summary: "Lista usuarios",
      security: bearer,
      responses: { 200: success(z.array(UsuarioSchema), "Usuarios"), 401: error },
    }),
    registerRoute({
      method: "post",
      path: "/usuarios",
      tags: ["Usuarios"],
      summary: "Crea usuario",
      security: bearer,
      request: { body: { ...json(schemasEntrada.CrearUsuarioSchema), required: true } },
      responses: { 201: success(UsuarioSchema, "Usuario creado"), 400: error },
    }),
    registerRoute({
      method: "get",
      path: "/usuarios/{idUsuario}",
      tags: ["Usuarios"],
      summary: "Obtiene usuario por id",
      security: bearer,
      request: { params: idParam("idUsuario") },
      responses: { 200: success(UsuarioSchema, "Usuario"), 404: error },
    }),
    registerRoute({
      method: "put",
      path: "/usuarios/{idUsuario}",
      tags: ["Usuarios"],
      summary: "Actualiza usuario",
      security: bearer,
      request: {
        params: idParam("idUsuario"),
        body: { ...json(schemasEntrada.ActualizarUsuarioSchema), required: true },
      },
      responses: { 200: success(UsuarioSchema, "Usuario actualizado"), 400: error },
    }),
    registerRoute({
      method: "get",
      path: "/propiedades",
      tags: ["Propiedades"],
      summary: "Lista propiedades",
      security: bearer,
      request: { query: z.object({ leadId: z.string().optional() }) },
      responses: { 200: success(z.array(PropiedadSchema), "Propiedades"), 401: error },
    }),
    registerRoute({
      method: "post",
      path: "/propiedades",
      tags: ["Propiedades"],
      summary: "Crea propiedad",
      security: bearer,
      request: { body: { ...json(schemasEntrada.CrearPropiedadSchema), required: true } },
      responses: { 201: success(PropiedadSchema, "Propiedad creada"), 400: error },
    }),
    registerRoute({
      method: "get",
      path: "/propiedades/{idPropiedad}",
      tags: ["Propiedades"],
      summary: "Obtiene propiedad",
      security: bearer,
      request: { params: idParam("idPropiedad") },
      responses: { 200: success(PropiedadSchema, "Propiedad"), 404: error },
    }),
    registerRoute({
      method: "put",
      path: "/propiedades/{idPropiedad}",
      tags: ["Propiedades"],
      summary: "Actualiza propiedad",
      security: bearer,
      request: {
        params: idParam("idPropiedad"),
        body: { ...json(schemasEntrada.ActualizarPropiedadSchema), required: true },
      },
      responses: { 200: success(PropiedadSchema, "Propiedad actualizada"), 400: error },
    }),
    registerRoute({
      method: "delete",
      path: "/propiedades/{idPropiedad}",
      tags: ["Propiedades"],
      summary: "Elimina propiedad",
      security: bearer,
      request: { params: idParam("idPropiedad") },
      responses: { 200: successOnly("Propiedad eliminada"), 404: error },
    }),
    registerRoute({
      method: "get",
      path: "/ventas/pipeline",
      tags: ["Ventas"],
      summary: "Lista pipeline comercial",
      security: bearer,
      responses: { 200: success(z.array(LeadSchema), "Pipeline"), 401: error },
    }),
    registerRoute({
      method: "post",
      path: "/ventas/lead",
      tags: ["Ventas"],
      summary: "Registra lead",
      security: bearer,
      request: { body: { ...json(schemasEntrada.RegistrarLeadSchema), required: true } },
      responses: { 201: success(LeadSchema, "Lead registrado"), 400: error },
    }),
    registerRoute({
      method: "get",
      path: "/ventas/lead/{idLead}",
      tags: ["Ventas"],
      summary: "Obtiene lead",
      security: bearer,
      request: { params: idParam("idLead") },
      responses: { 200: success(LeadSchema, "Lead"), 404: error },
    }),
    registerRoute({
      method: "put",
      path: "/ventas/lead/{idLead}",
      tags: ["Ventas"],
      summary: "Actualiza lead",
      security: bearer,
      request: {
        params: idParam("idLead"),
        body: { ...json(schemasEntrada.ActualizarLeadSchema), required: true },
      },
      responses: { 200: success(LeadSchema, "Lead actualizado"), 400: error },
    }),
    registerRoute({
      method: "put",
      path: "/ventas/lead/{idLead}/asesor",
      tags: ["Ventas"],
      summary: "Asigna asesor a lead",
      security: bearer,
      request: {
        params: idParam("idLead"),
        body: { ...json(schemasEntrada.AsignarLeadAsesorSchema), required: true },
      },
      responses: { 200: successOnly("Lead reasignado"), 400: error },
    }),
    registerRoute({
      method: "post",
      path: "/ventas/convertir",
      tags: ["Ventas"],
      summary: "Convierte lead a cliente",
      security: bearer,
      request: { body: { ...json(schemasEntrada.ConvertirLeadSchema), required: true } },
      responses: { 200: successOnly("Lead convertido"), 400: error },
    }),
    registerRoute({
      method: "get",
      path: "/ventas/leads",
      tags: ["Ventas"],
      summary: "Lista leads",
      security: bearer,
      responses: { 200: success(z.array(LeadSchema), "Leads"), 401: error },
    }),
    registerRoute({
      method: "get",
      path: "/ventas/asesores",
      tags: ["Ventas"],
      summary: "Lista asesores con leads",
      security: bearer,
      responses: {
        200: success(z.array(z.object({ idAsesor: z.string(), totalLeads: z.number() }))),
      },
    }),
    registerRoute({
      method: "post",
      path: "/ventas/cita",
      tags: ["Ventas"],
      summary: "Agenda cita",
      security: bearer,
      request: { body: { ...json(schemasEntrada.AgendarCitaSchema), required: true } },
      responses: { 200: successOnly("Cita agendada"), 400: error },
    }),
    registerRoute({
      method: "get",
      path: "/ventas/citas",
      tags: ["Ventas"],
      summary: "Lista citas",
      security: bearer,
      responses: { 200: success(z.array(z.record(z.string(), z.unknown())), "Citas") },
    }),
    registerRoute({
      method: "get",
      path: "/ventas/lead/{idLead}/cita/{idCita}",
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
    registerRoute({
      method: "put",
      path: "/ventas/lead/{idLead}/cita/{idCita}",
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
    registerRoute({
      method: "get",
      path: "/ventas/clientes",
      tags: ["Ventas"],
      summary: "Lista clientes",
      security: bearer,
      responses: { 200: success(z.array(ClienteSchema), "Clientes") },
    }),
    registerRoute({
      method: "post",
      path: "/ventas/cliente",
      tags: ["Ventas"],
      summary: "Registra cliente directo",
      security: bearer,
      request: { body: { ...json(schemasEntrada.RegistrarClienteDirectoSchema), required: true } },
      responses: { 201: success(ClienteSchema, "Cliente registrado"), 400: error },
    }),
    registerRoute({
      method: "get",
      path: "/ventas/cliente/{idCliente}",
      tags: ["Ventas"],
      summary: "Obtiene cliente",
      security: bearer,
      request: { params: idParam("idCliente") },
      responses: { 200: success(ClienteSchema, "Cliente"), 404: error },
    }),
    registerRoute({
      method: "put",
      path: "/ventas/cliente/{idCliente}",
      tags: ["Ventas"],
      summary: "Actualiza cliente",
      security: bearer,
      request: {
        params: idParam("idCliente"),
        body: { ...json(schemasEntrada.ActualizarClienteSchema), required: true },
      },
      responses: { 200: success(ClienteSchema, "Cliente actualizado"), 400: error },
    }),
    registerRoute({
      method: "get",
      path: "/ventas/cliente/{idCliente}/propiedades",
      tags: ["Ventas"],
      summary: "Lista propiedades vinculadas a cliente",
      security: bearer,
      request: { params: idParam("idCliente") },
      responses: { 200: success(z.array(PropiedadSchema), "Propiedades del cliente") },
    }),
    registerRoute({
      method: "get",
      path: "/ventas/contratos",
      tags: ["Ventas"],
      summary: "Lista contratos",
      security: bearer,
      responses: { 200: success(z.array(z.record(z.string(), z.unknown())), "Contratos") },
    }),
    registerRoute({
      method: "post",
      path: "/ventas/contratos",
      tags: ["Ventas"],
      summary: "Crea contrato",
      security: bearer,
      request: { body: { ...json(schemasEntrada.CrearContratoSchema), required: true } },
      responses: { 201: successOnly("Contrato creado"), 400: error },
    }),
    registerRoute({
      method: "get",
      path: "/ventas/contratos/mios",
      tags: ["Ventas"],
      summary: "Lista contratos del asesor autenticado",
      security: bearer,
      responses: {
        200: success(z.array(z.record(z.string(), z.unknown())), "Contratos del asesor"),
      },
    }),
    registerRoute({
      method: "post",
      path: "/ventas/contratos/{idContrato}/firmar",
      tags: ["Ventas"],
      summary: "Firma contrato",
      security: bearer,
      request: { params: idParam("idContrato") },
      responses: { 200: successOnly("Contrato firmado"), 400: error },
    }),
    registerRoute({
      method: "post",
      path: "/ventas/contratos/{idContrato}/cancelar",
      tags: ["Ventas"],
      summary: "Cancela contrato",
      security: bearer,
      request: { params: idParam("idContrato") },
      responses: { 200: successOnly("Contrato cancelado"), 400: error },
    }),
    registerRoute({
      method: "get",
      path: "/ventas/lead/{idLead}/actividad",
      tags: ["Ventas"],
      summary: "Lista actividad de un lead",
      security: bearer,
      request: { params: idParam("idLead") },
      responses: { 200: success(z.array(z.record(z.string(), z.unknown())), "Actividad del lead") },
    }),
    registerRoute({
      method: "get",
      path: "/reportes/estadisticas-globales",
      tags: ["Reportes"],
      summary: "Resumen global de acciones comerciales",
      security: bearer,
      responses: { 200: success(ResumenAccionesSchema, "Resumen de acciones"), 403: error },
    }),
    registerRoute({
      method: "get",
      path: "/reportes/general",
      tags: ["Reportes"],
      summary: "Reporte general de acciones recientes",
      security: bearer,
      responses: { 200: success(ReporteGeneralSchema, "Reporte general"), 403: error },
    }),
    registerRoute({
      method: "post",
      path: "/integraciones/captaciones",
      tags: ["Integraciones"],
      summary: "Recibe captacion entrante",
      security: [],
      request: { body: { ...json(schemasEntrada.CaptacionEntranteSchema), required: true } },
      responses: { 200: successOnly("Captacion recibida"), 400: error },
    }),
    registerRoute({
      method: "get",
      path: "/integraciones/captaciones/pendientes",
      tags: ["Integraciones"],
      summary: "Lista captaciones pendientes",
      security: bearer,
      responses: { 200: success(z.array(z.record(z.string(), z.unknown())), "Captaciones") },
    }),
    registerRoute({
      method: "post",
      path: "/integraciones/captaciones/pendientes/{idCaptacion}/revisar",
      tags: ["Integraciones"],
      summary: "Marca captacion pendiente como revisada",
      security: bearer,
      request: { params: idParam("idCaptacion") },
      responses: { 200: successOnly("Captacion revisada"), 400: error },
    }),
    registerRoute({
      method: "post",
      path: "/integraciones/captaciones/pendientes/{idCaptacion}/duplicada",
      tags: ["Integraciones"],
      summary: "Marca captacion pendiente como duplicada",
      security: bearer,
      request: {
        params: idParam("idCaptacion"),
        body: { ...json(schemasEntrada.MarcarDuplicadaSchema), required: false },
      },
      responses: { 200: successOnly("Captacion duplicada"), 400: error },
    }),
    registerRoute({
      method: "post",
      path: "/integraciones/captaciones/pendientes/{idCaptacion}/rechazar",
      tags: ["Integraciones"],
      summary: "Rechaza captacion pendiente",
      security: bearer,
      request: {
        params: idParam("idCaptacion"),
        body: { ...json(schemasEntrada.RechazarCaptacionSchema), required: false },
      },
      responses: { 200: successOnly("Captacion rechazada"), 400: error },
    }),
    registerRoute({
      method: "post",
      path: "/integraciones/captaciones/pendientes/{idCaptacion}/convertir",
      tags: ["Integraciones"],
      summary: "Convierte captacion pendiente a lead",
      security: bearer,
      request: {
        params: idParam("idCaptacion"),
        body: { ...json(schemasEntrada.ConvertirCaptacionSchema), required: false },
      },
      responses: { 200: successOnly("Captacion convertida"), 400: error },
    }),
    registerRoute({
      method: "post",
      path: "/integraciones/webhooks/whatsapp",
      tags: ["Integraciones"],
      summary: "Webhook de WhatsApp",
      security: [],
      request: { body: { ...json(schemasEntrada.WhatsAppWebhookSchema), required: true } },
      responses: { 200: successOnly("Webhook procesado"), 400: error },
    }),
  ];

  for (const route of routes) {
    registry.openapi(route, (c) => c.json({ success: true }, 200));
  }

  return registry.getOpenAPI31Document({
    openapi: "3.1.0",
    info: {
      title: "ALVAS API",
      version: "1.0.0",
      description:
        "Contrato HTTP de ALVAS. La documentacion vive en infraestructura y respeta los bounded contexts de dominio.",
    },
    servers: [{ url: origin, description: "Entorno actual" }],
  });
}
