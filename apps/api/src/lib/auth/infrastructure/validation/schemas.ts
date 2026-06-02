import { z } from "zod";

/** Schema Zod para validar body de inicio de sesion. @group Validacion */
export const IniciarSesionSchema = z.object({
  username: z.string().min(1, "Username requerido"),
  clave: z.string().min(1, "Clave requerida"),
});

/** Schema Zod para validar body de renovacion de sesion. @group Validacion */
export const RenovarSesionSchema = z.object({
  refreshToken: z.string().min(1, "refreshToken requerido"),
});
