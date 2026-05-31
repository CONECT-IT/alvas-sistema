import { z } from "@hono/zod-openapi";
import {
  ActualizarUsuarioSchema,
  CrearUsuarioSchema,
} from "../../../usuarios/infrastructure/validation/schemas";
import {
  ActualizarPropiedadSchema,
  CrearPropiedadSchema,
} from "../../../propiedades/infrastructure/validation/schemas";
import {
  ActualizarCitaBodySchema,
  ActualizarClienteSchema,
  ActualizarLeadSchema,
  AgendarCitaSchema,
  AsignarLeadAsesorSchema,
  ConvertirLeadSchema,
  CrearContratoSchema,
  RegistrarClienteDirectoSchema,
  RegistrarLeadSchema,
} from "../../../ventas/infrastructure/validation/schemas";
import {
  IniciarSesionSchema,
  RenovarSesionSchema,
} from "../../../auth/infrastructure/validation/schemas";
import {
  CaptacionEntranteSchema,
  ConvertirCaptacionSchema,
  MarcarDuplicadaSchema,
  RechazarCaptacionSchema,
  WhatsAppWebhookSchema,
} from "../../../integraciones/infrastructure/validation/schemas";

export const ErrorResponseSchema = z
  .object({
    success: z.literal(false),
    message: z.string(),
    code: z.string(),
    detalles: z
      .array(
        z.object({
          path: z.string(),
          message: z.string(),
        }),
      )
      .optional(),
  })
  .openapi("ErrorResponse");

export const SuccessSchema = z.object({ success: z.literal(true) }).openapi("Success");

export const UsuarioSchema = z
  .object({
    id: z.string(),
    username: z.string(),
    nombre: z.string(),
    rol: z.string(),
    estado: z.string(),
    creadoEn: z.union([z.string(), z.date()]),
    actualizadoEn: z.union([z.string(), z.date()]),
  })
  .passthrough()
  .openapi("Usuario");

export const PropiedadSchema = z
  .object({
    id: z.string(),
    titulo: z.string(),
    descripcion: z.string(),
    precio: z.number(),
    estado: z.string(),
  })
  .passthrough()
  .openapi("Propiedad");

export const LeadSchema = z
  .object({
    id: z.string(),
    nombre: z.string(),
    email: z.string(),
    telefono: z.string(),
    tipo: z.string(),
    estado: z.string(),
    idAsesor: z.string().optional(),
  })
  .passthrough()
  .openapi("Lead");

export const ClienteSchema = z
  .object({
    id: z.string(),
    nombre: z.string(),
    email: z.string(),
    telefono: z.string(),
  })
  .passthrough()
  .openapi("Cliente");

export const AccionResumenSchema = z
  .object({
    evento: z.string(),
    total: z.number().int().nonnegative(),
  })
  .openapi("AccionResumen");

export const ResumenAccionesSchema = z
  .object({
    acciones: z.array(AccionResumenSchema),
    totalAcciones: z.number().int().nonnegative(),
  })
  .openapi("ResumenAcciones");

export const ActividadReporteSchema = z
  .object({
    idLead: z.string(),
    evento: z.string(),
    descripcion: z.string(),
    fecha: z.string(),
  })
  .openapi("ActividadReporte");

export const ReporteGeneralSchema = z
  .object({
    fechaGeneracion: z.union([z.string(), z.date()]),
    resumenAcciones: ResumenAccionesSchema,
    actividadReciente: z.array(ActividadReporteSchema),
  })
  .openapi("ReporteGeneral");

export const AuthDataSchema = z
  .object({
    authToken: z.string(),
    refreshToken: z.string(),
    usuario: UsuarioSchema.optional(),
  })
  .passthrough()
  .openapi("AuthData");

export const schemasEntrada = {
  ActualizarCitaBodySchema,
  ActualizarClienteSchema,
  ActualizarLeadSchema,
  ActualizarPropiedadSchema,
  ActualizarUsuarioSchema,
  AgendarCitaSchema,
  AsignarLeadAsesorSchema,
  CaptacionEntranteSchema,
  ConvertirCaptacionSchema,
  ConvertirLeadSchema,
  CrearContratoSchema,
  CrearPropiedadSchema,
  CrearUsuarioSchema,
  IniciarSesionSchema,
  MarcarDuplicadaSchema,
  RegistrarClienteDirectoSchema,
  RegistrarLeadSchema,
  RechazarCaptacionSchema,
  RenovarSesionSchema,
  WhatsAppWebhookSchema,
};
