import { describe, expect, test } from "bun:test";
import app from "../../src/main";

describe("contract / openapi", () => {
  test("expone contrato OpenAPI con rutas principales", async () => {
    const res = await app.request("/openapi.json");

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.openapi).toBe("3.1.0");
    expect(body.info.title).toBe("ALVAS API");
    expect(body.paths["/auth/login"].post).toBeDefined();
    expect(body.paths["/ventas/pipeline"].get).toBeDefined();
    expect(body.paths["/ventas/lead/{idLead}/cita/{idCita}"].put).toBeDefined();
    expect(
      body.paths["/integraciones/captaciones/pendientes/{idCaptacion}/convertir"].post,
    ).toBeDefined();
    expect(body.paths["/reportes/general"].get).toBeDefined();
    expect(body.components.securitySchemes.bearerAuth).toEqual({
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    });
  });
});
