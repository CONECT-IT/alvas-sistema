import { z } from "zod";

export const CaptacionEntranteSchema = z.object({
  canal: z.string().min(1, "Canal requerido"),
  origen: z.string().min(1, "Origen requerido"),
  nombre: z.string().min(1, "Nombre requerido"),
  telefono: z.string().min(1, "Teléfono requerido"),
  email: z.string().optional(),
  tipo: z.string().min(1, "Tipo requerido"),
  idPropiedadInteres: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const WhatsAppWebhookSchema = z.object({
  wa_id: z.string().min(1, "wa_id requerido"),
  wa_name: z.string().min(1, "wa_name requerido"),
  pregunta_tipo: z.string().optional(),
  propiedad_id: z.string().optional(),
});

export const MarcarDuplicadaSchema = z.object({
  razon: z.string().optional().default(""),
});

export const RechazarCaptacionSchema = z.object({
  razon: z.string().optional(),
});

export const ConvertirCaptacionSchema = z.object({
  idAsesor: z.string().optional(),
});
