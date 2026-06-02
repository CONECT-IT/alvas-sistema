import { z } from "zod";

/** Schema Zod para validar body de creacion de usuario. @group Validacion */
export const CrearUsuarioSchema = z.object({
  username: z.string().min(1, "Username requerido"),
  nombre: z.string().min(1, "Nombre requerido"),
  clave: z.string().min(1, "Clave requerida"),
  rol: z.string().min(1, "Rol requerido"),
});

/** Schema Zod para validar body de actualizacion de usuario. @group Validacion */
export const ActualizarUsuarioSchema = z.object({
  username: z.string().optional(),
  nombre: z.string().optional(),
  clave: z.string().optional(),
  rol: z.string().optional(),
});
