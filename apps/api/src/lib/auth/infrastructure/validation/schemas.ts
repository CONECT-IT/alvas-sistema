import { z } from "zod";

export const IniciarSesionSchema = z.object({
  username: z.string().min(1, "Username requerido"),
  clave: z.string().min(1, "Clave requerida"),
});

export const RenovarSesionSchema = z.object({
  refreshToken: z.string().min(1, "refreshToken requerido"),
});
