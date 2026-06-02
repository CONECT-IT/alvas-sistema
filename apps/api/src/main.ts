import { cors } from "hono/cors";
import { Scalar } from "@scalar/hono-api-reference";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { ErrorDeDominio } from "./lib/shared/domain";
import { mapErrorDeDominioAStatus } from "./lib/shared/infrastructure/http/responses";
import { ValidationError } from "./lib/shared/infrastructure/validation/helpers";
import { verifySessionMiddleware, requireRolesMiddleware } from "./lib/shared/infrastructure";
import { validationHook } from "./lib/shared/infrastructure/openapi/openapi-utils";
import { crearTokenProviderDesdeEnv } from "./lib/auth/infrastructure/security/TokenProviderFactory";
import { crearAuthRouter } from "./lib/auth/infrastructure";
import { crearUsuarioRouter } from "./lib/usuarios/infrastructure";
import { crearPropiedadRouter } from "./lib/propiedades/infrastructure";
import { crearVentasRouter } from "./lib/ventas/infrastructure";
import { crearReportesRouter } from "./lib/reportes/infrastructure";
import { crearIntegracionesRouter } from "./lib/integraciones/infrastructure";
import {
  crearAuthControllerDeps,
  crearIntegracionesRouterDeps,
  crearPropiedadRouterDeps,
  crearReportesRouterDeps,
  crearUsuarioControllerDeps,
  crearVentasControllerDeps,
} from "./composition";
import { type D1DatabaseLike, type SessionClaims } from "./lib/shared/infrastructure";

type AppBindings = {
  DB: D1DatabaseLike;
  AUTH_SECRET: string;
  AUTH_REFRESH_SECRET?: string;
  AUTH_TOKEN_TTL_SEGUNDOS?: string;
  REFRESH_TOKEN_TTL_SEGUNDOS?: string;
  AUTH_PEPPER?: string;
  INTEGRACION_WHATSAPP_SECRETO?: string;
  CORS_ORIGINS?: string;
};

type AppVariables = {
  authPayload: SessionClaims;
};

type AppEnv = { Bindings: AppBindings; Variables: AppVariables };

const app = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

// Security: CORS
app.use(
  "*",
  cors({
    origin: (origin, c) => {
      const allowed = (c.env?.CORS_ORIGINS ?? "http://localhost:5173")
        .split(",")
        .map((s: string) => s.trim());
      return allowed.includes(origin) ? origin : null;
    },
    credentials: true,
  }),
);

// Security: headers
app.use("*", async (c, next) => {
  await next();
  c.res.headers.set("X-Content-Type-Options", "nosniff");
  c.res.headers.set("X-Frame-Options", "DENY");
  c.res.headers.set("X-XSS-Protection", "1; mode=block");
  c.res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
});

// Security: rate limiting (in-memory, resets per cold start)
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 100;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
app.use("*", async (c, next) => {
  const clientIp = c.req.header("cf-connecting-ip") ?? "unknown";
  const now = Date.now();
  const entry = rateLimitStore.get(clientIp);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    c.res.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_MAX));
    c.res.headers.set("X-RateLimit-Remaining", String(RATE_LIMIT_MAX - 1));
    c.res.headers.set("X-RateLimit-Reset", String(Math.ceil((now + RATE_LIMIT_WINDOW_MS) / 1000)));
    await next();
    return;
  }

  entry.count++;
  c.res.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_MAX));
  c.res.headers.set("X-RateLimit-Remaining", String(Math.max(0, RATE_LIMIT_MAX - entry.count)));
  c.res.headers.set("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

  if (entry.count > RATE_LIMIT_MAX) {
    return c.json(
      {
        success: false,
        message: "Demasiadas solicitudes. Intenta de nuevo en un minuto.",
        code: "RATE_LIMIT",
      },
      429,
    );
  }

  await next();
});

// Create routers early so they're available for OpenAPI doc generation
const routerUsuarios = crearUsuarioRouter(crearUsuarioControllerDeps());
const routerAuth = crearAuthRouter(crearAuthControllerDeps());
const routerPropiedades = crearPropiedadRouter(crearPropiedadRouterDeps());
const routerVentas = crearVentasRouter(crearVentasControllerDeps());
const routerReportes = crearReportesRouter(crearReportesRouterDeps());
const routerIntegraciones = crearIntegracionesRouter(crearIntegracionesRouterDeps());

app.openapi(
  createRoute({
    method: "get",
    path: "/health",
    tags: ["Health"],
    summary: "Estado operativo del servicio",
    security: [],
    responses: {
      200: {
        description: "Servicio disponible",
        content: {
          "application/json": {
            schema: z.object({ status: z.string(), service: z.string() }),
          },
        },
      },
    },
  }),
  (c) => c.json({ status: "ok", service: "alvas-api" }),
);
app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

app.get(
  "/openapi.json",
  (c) =>
    c.json(
      app.getOpenAPI31Document({
        openapi: "3.1.0",
        info: {
          title: "ALVAS API",
          version: "1.0.0",
          description:
            "Contrato HTTP de ALVAS. La documentacion vive en infraestructura y respeta los bounded contexts de dominio.",
        },
        servers: [{ url: new URL(c.req.url).origin, description: "Entorno actual" }],
        security: [{ bearerAuth: [] as string[] }],
      }),
    ),
);
app.get(
  "/docs",
  Scalar((c) => ({
    url: new URL("/openapi.json", c.req.url).toString(),
    title: "ALVAS API",
  })),
);

// Auth middleware applied at composition root - BEFORE mounting routes
app.use(
  "/usuarios",
  verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)),
);
app.use(
  "/usuarios/*",
  verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)),
);

app.use(
  "/propiedades",
  verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)),
);
app.use(
  "/propiedades/*",
  verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)),
);

app.use(
  "/ventas",
  verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)),
);
app.use(
  "/ventas/*",
  verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)),
);

app.use(
  "/reportes",
  verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)),
);
app.use(
  "/reportes/*",
  verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)),
);
app.use("/reportes", requireRolesMiddleware(["ADMIN"]));
app.use("/reportes/*", requireRolesMiddleware(["ADMIN"]));

app.use(
  "/integraciones/captaciones/pendientes",
  verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)),
);
app.use(
  "/integraciones/captaciones/pendientes/*",
  verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)),
);

app.route("/usuarios", routerUsuarios);
app.route("/auth", routerAuth);
app.route("/propiedades", routerPropiedades);
app.route("/ventas", routerVentas);
app.route("/reportes", routerReportes);
app.route("/integraciones", routerIntegraciones);

// Audit logging for write operations
const METODOS_ESCRITURA = new Set(["POST", "PUT", "PATCH", "DELETE"]);
app.use("*", async (c, next) => {
  await next();

  if (c.res.status < 400 && METODOS_ESCRITURA.has(c.req.method)) {
    const payload = c.get("authPayload");
    console.log(
      JSON.stringify({
        tipo: "AUDIT",
        timestamp: new Date().toISOString(),
        usuario: payload?.idUsuario ?? "anonimo",
        rol: payload?.rol ?? "PUBLICO",
        metodo: c.req.method,
        path: c.req.path,
        status: c.res.status,
      }),
    );
  }
});

app.onError((error, c) => {
  if (error instanceof ErrorDeDominio) {
    return c.json(
      { success: false, message: error.message, code: error.codigo },
      mapErrorDeDominioAStatus(error) as Parameters<typeof c.json>[1],
    );
  }

  if (error instanceof ValidationError) {
    return c.json(
      {
        success: false,
        message: "Error de validación",
        code: "VALIDATION_ERROR",
        detalles: error.details,
      },
      400,
    );
  }

  console.error("Error no manejado:", error);
  return c.json(
    { success: false, message: "Error interno del servidor.", code: "ERROR_INTERNO" },
    500,
  );
});

export default app;
