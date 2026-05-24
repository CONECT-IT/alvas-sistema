import { z } from "zod";
import { fechaStringSchema } from "../../../shared/infrastructure/validation/helpers";

export const RegistrarLeadSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  email: z.string().min(1, "Email requerido"),
  telefono: z.string().min(1, "Teléfono requerido"),
  tipo: z.string().min(1, "Tipo requerido"),
  idPropiedadInteres: z.string().optional(),
  idAsesor: z.string().optional(),
  datosPropiedad: z
    .object({
      titulo: z.string().min(1),
      descripcion: z.string().min(1),
      precio: z.number().positive(),
    })
    .optional(),
});

export const ActualizarLeadSchema = z.object({
  nombre: z.string().optional(),
  email: z.string().optional(),
  telefono: z.string().optional(),
  tipo: z.string().optional(),
  idPropiedadInteres: z.string().optional(),
  estado: z.string().optional(),
});

export const ConvertirLeadSchema = z.object({
  idLead: z.string().min(1, "idLead requerido"),
});

export const AsignarLeadAsesorSchema = z.object({
  idAsesor: z.string().min(1, "idAsesor requerido"),
});

export const AgendarCitaSchema = z.object({
  idLead: z.string().min(1, "idLead requerido"),
  idPropiedad: z.string().optional(),
  fechaInicio: fechaStringSchema,
  duracionMinutos: z.number().int().positive(),
  observacion: z.string().optional(),
});

export const ActualizarCitaBodySchema = z.object({
  fechaInicio: z.string().optional(),
  duracionMinutos: z.number().int().positive().optional(),
  observacion: z.string().optional(),
  estado: z.string().optional(),
});

export const CrearContratoSchema = z.object({
  id: z.string().min(1).optional().default(() => crypto.randomUUID()),
  idLead: z.string().min(1, "idLead requerido"),
  idPropiedad: z.string().min(1, "idPropiedad requerido"),
  fechaInicio: fechaStringSchema.optional().default(() => new Date()),
  fechaFin: fechaStringSchema.optional().default(() => new Date()),
});

export const RegistrarClienteDirectoSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  email: z.string().min(1, "Email requerido"),
  telefono: z.string().min(1, "Teléfono requerido"),
});

export const ActualizarClienteSchema = z.object({
  nombre: z.string().optional(),
  email: z.string().optional(),
  telefono: z.string().optional(),
});
