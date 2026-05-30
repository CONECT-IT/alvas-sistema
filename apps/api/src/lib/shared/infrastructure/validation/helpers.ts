import { z } from "zod";

export function parseBody<T>(schema: z.ZodSchema<T>, raw: unknown): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    );
  }
  return result.data;
}

export class ValidationError extends Error {
  readonly details: { path: string; message: string }[];
  constructor(details: { path: string; message: string }[]) {
    super("VALIDATION_ERROR");
    this.name = "ValidationError";
    this.details = details;
  }
}
export const fechaStringSchema = z
  .string()
  .min(1, "Fecha requerida")
  .transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Fecha inválida");
    return d;
  });

export const uuidSchema = z.string().uuid();
