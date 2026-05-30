import { z } from "zod";

export const CrearUsuarioSchema = z.object({
  username: z.string().min(1, "Username requerido"),
  nombre: z.string().min(1, "Nombre requerido"),
  clave: z.string().min(1, "Clave requerida"),
  rol: z.string().min(1, "Rol requerido"),
});

export const ActualizarUsuarioSchema = z.object({
  username: z.string().optional(),
  nombre: z.string().optional(),
  clave: z.string().optional(),
  rol: z.string().optional(),
});
