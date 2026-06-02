import { z } from "@hono/zod-openapi";
import type { Context, Env } from "hono";
import { ErrorResponseSchema, SuccessSchema } from "./OpenApiSchemas";

export const json = <T extends z.ZodTypeAny>(schema: T) => ({
  content: {
    "application/json": {
      schema,
    },
  },
});

export const success = <T extends z.ZodTypeAny>(schema: T, description = "Operacion exitosa") => ({
  ...json(z.object({ success: z.literal(true), data: schema })),
  description,
});

export const successOnly = (description = "Operacion exitosa") => ({
  ...json(SuccessSchema),
  description,
});

export const error = {
  ...json(ErrorResponseSchema),
  description: "Error de negocio, validacion, autenticacion o sistema",
};

export const bearer = [{ bearerAuth: [] }];

export const idParam = (name: string) =>
  z.object({
    [name]: z.string().openapi({
      param: { name, in: "path" },
      example: `${name}-001`,
    }),
  });

export const validationHook = <E extends Env>(
  result: { target: "json" | "form" | "query" | "header" | "cookie" | "param" } & (
    | { success: true; data: unknown }
    | { success: false; error: z.ZodError }
  ),
  c: Context<E>,
) => {
  if (!result.success) {
    return c.json(
      {
        success: false,
        message: "Error de validacion",
        code: "VALIDATION_ERROR",
        detalles: result.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      400,
    );
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const h = (handler: (...args: any[]) => any) => handler;
