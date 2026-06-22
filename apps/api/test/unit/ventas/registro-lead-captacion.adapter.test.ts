import { describe, expect, mock, test } from "bun:test";

import { RegistroLeadCaptacionVentasAdapter } from "../../../src/lib/ventas/infrastructure/adapters/RegistroLeadCaptacionVentasAdapter";
import { Lead } from "../../../src/lib/ventas/domain/entities/Lead";
import { resultadoExitoso } from "../../../src/lib/shared/application/Resultado";
import { type IRegistrarLead } from "../../../src/lib/ventas/application";

function crearRegistrarLeadMock(): IRegistrarLead {
  const lead = Lead.registrar({
    id: "lead-001",
    nombre: "Lead Test",
    email: "test@test.com",
    telefono: "123456",
    tipo: "VENTA",
    idAsesor: "asesor-1",
  });
  return {
    ejecutar: mock(() => Promise.resolve(resultadoExitoso(lead))),
  };
}

describe("RegistroLeadCaptacionVentasAdapter", () => {
  test("registrar delega al use case de ventas", async () => {
    const registrarLead = crearRegistrarLeadMock();

    const adapter = new RegistroLeadCaptacionVentasAdapter(registrarLead);
    const resultado = await adapter.registrar({
      nombre: "Lead Test",
      telefono: "123456",
      canal: "WHATSAPP",
      origen: "WHATSAPP",
      tipo: "VENTA",
      idAsesor: "asesor-1",
    });

    expect(resultado.esExito).toBe(true);
    expect(registrarLead.ejecutar).toHaveBeenCalledTimes(1);
  });

  test("registrar construye email desde telefono si no se provee", async () => {
    const registrarLead = crearRegistrarLeadMock();

    const adapter = new RegistroLeadCaptacionVentasAdapter(registrarLead);
    await adapter.registrar({
      nombre: "Lead Test",
      telefono: "123456",
      canal: "WHATSAPP",
      origen: "WHATSAPP",
      tipo: "VENTA",
      idAsesor: "asesor-1",
    });

    expect(registrarLead.ejecutar).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "123456@contacto.whatsapp.local",
      }),
    );
  });
});
