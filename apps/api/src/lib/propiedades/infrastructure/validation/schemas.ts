import { z } from "zod";

/** Esquema Zod para validar creacion de propiedad. @group Validacion */
export const CrearPropiedadSchema = z.object({
  titulo: z.string().min(1, "Título requerido"),
  descripcion: z.string().min(1, "Descripción requerida"),
  precio: z.number().positive("Precio debe ser positivo"),
  origen: z.string().optional(),
  estado: z.string().optional(),
  idLeadOrigen: z.string().optional(),
  idClientePropietario: z.string().optional(),
  captadaPorAsesorId: z.string().optional(),
  asesorResponsableId: z.string().optional(),
});

/** Esquema Zod para validar actualizacion de propiedad. @group Validacion */
export const ActualizarPropiedadSchema = z.object({
  titulo: z.string().optional(),
  descripcion: z.string().optional(),
  precio: z.number().positive().optional(),
  estado: z.string().optional(),
  idClientePropietario: z.string().optional(),
  asesorResponsableId: z.string().optional(),
});
