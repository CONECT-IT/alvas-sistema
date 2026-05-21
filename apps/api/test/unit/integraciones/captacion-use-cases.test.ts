import { describe, expect, test } from "bun:test";

import { ProcesarCaptacionEntranteUseCase } from "../../../src/lib/integraciones/application/use-cases/ProcesarCaptacionEntranteUseCase";
import { ProcesarWhatsAppWebhookUseCase } from "../../../src/lib/integraciones/application/use-cases/ProcesarWhatsAppWebhookUseCase";
import {
  type IRegistroLeadCaptacion,
  type RegistroLeadCaptacionInput,
} from "../../../src/lib/integraciones/domain/ports/IRegistroLeadCaptacion";
import {
  type IRegistroPropiedadCaptacion,
  type RegistroPropiedadCaptacionInput,
} from "../../../src/lib/integraciones/domain/ports/IRegistroPropiedadCaptacion";
import { resultadoExitoso, resultadoFallido } from "../../../src/lib/shared";
import { ErrorDeDominio } from "../../../src/lib/shared/domain";

class FakeRegistroLead implements IRegistroLeadCaptacion {
  readonly entradas: RegistroLeadCaptacionInput[] = [];

  constructor(private readonly falla?: ErrorDeDominio) {}

  async registrar(input: RegistroLeadCaptacionInput) {
    this.entradas.push(input);

    if (this.falla) {
      return resultadoFallido(this.falla);
    }

    return resultadoExitoso({ id: "lead-001", idAsesor: "asesor-001" });
  }
}

class FakeRegistroPropiedad implements IRegistroPropiedadCaptacion {
  readonly entradas: RegistroPropiedadCaptacionInput[] = [];

  constructor(private readonly falla?: ErrorDeDominio) {}

  async registrar(input: RegistroPropiedadCaptacionInput) {
    this.entradas.push(input);

    if (this.falla) {
      return resultadoFallido(this.falla);
    }

    return resultadoExitoso({ id: "propiedad-preliminar-001" });
  }
}

describe("integraciones / use cases", () => {
  test("ProcesarCaptacionEntranteUseCase registra lead comprador normalizado", async () => {
    const registroLead = new FakeRegistroLead();
    const registroPropiedad = new FakeRegistroPropiedad();

    const resultado = await new ProcesarCaptacionEntranteUseCase(
      registroLead,
      registroPropiedad,
    ).ejecutar({
      canal: " whatsapp ",
      origen: " Landing Abril ",
      nombre: " Ana Perez ",
      telefono: " 999888777 ",
      email: " ANA@EXAMPLE.COM ",
      tipo: " compra ",
      idPropiedadInteres: " prop-001 ",
      metadata: { campania: "abril" },
    });

    expect(resultado.esExito).toBe(true);
    expect(resultado.esExito ? resultado.valor : undefined).toEqual({
      idLead: "lead-001",
      idPropiedadPreliminar: undefined,
    });
    expect(registroLead.entradas).toEqual([
      {
        canal: "WHATSAPP",
        origen: "Landing Abril",
        nombre: "Ana Perez",
        email: "ana@example.com",
        telefono: "999888777",
        tipo: "COMPRA",
        idPropiedadInteres: "prop-001",
        metadata: { campania: "abril" },
      },
    ]);
    expect(registroPropiedad.entradas).toHaveLength(0);
  });

  test("ProcesarCaptacionEntranteUseCase crea propiedad preliminar para vendedor", async () => {
    const registroLead = new FakeRegistroLead();
    const registroPropiedad = new FakeRegistroPropiedad();

    const resultado = await new ProcesarCaptacionEntranteUseCase(
      registroLead,
      registroPropiedad,
    ).ejecutar({
      canal: "formulario_web",
      origen: "formulario vendedor",
      nombre: "Luis Vendedor",
      telefono: "300111222",
      tipo: "venta",
      metadata: { fuente: "web" },
    });

    expect(resultado.esExito).toBe(true);
    expect(resultado.esExito ? resultado.valor.idLead : undefined).toBe("lead-001");
    expect(resultado.esExito ? resultado.valor.idPropiedadPreliminar : undefined).toBe(
      "propiedad-preliminar-001",
    );
    expect(registroLead.entradas[0]).toMatchObject({
      canal: "FORMULARIO_WEB",
      origen: "formulario vendedor",
      nombre: "Luis Vendedor",
      email: "300111222@contacto.formulario_web.local",
      telefono: "300111222",
      tipo: "VENTA",
      metadata: { fuente: "web" },
    });
    expect(registroPropiedad.entradas).toEqual([
      {
        idLeadOrigen: "lead-001",
        asesorCaptadorId: "asesor-001",
        nombreContacto: "Luis Vendedor",
        origen: "formulario vendedor",
        metadata: { fuente: "web" },
      },
    ]);
  });

  test("ProcesarCaptacionEntranteUseCase propaga fallos de lead o propiedad", async () => {
    const errorLead = new ErrorDeDominio("Lead rechazado", { codigo: "LEAD_RECHAZADO" });
    const errorPropiedad = new ErrorDeDominio("Propiedad rechazada", {
      codigo: "PROPIEDAD_RECHAZADA",
    });

    const falloLead = await new ProcesarCaptacionEntranteUseCase(
      new FakeRegistroLead(errorLead),
      new FakeRegistroPropiedad(),
    ).ejecutar({
      canal: "formulario_web",
      origen: "landing",
      nombre: "Ana",
      telefono: "999",
      tipo: "compra",
    });
    const falloPropiedad = await new ProcesarCaptacionEntranteUseCase(
      new FakeRegistroLead(),
      new FakeRegistroPropiedad(errorPropiedad),
    ).ejecutar({
      canal: "formulario_web",
      origen: "landing",
      nombre: "Luis",
      telefono: "300",
      tipo: "venta",
    });

    expect(falloLead.esExito).toBe(false);
    expect(falloLead.esExito ? undefined : falloLead.error.codigo).toBe("LEAD_RECHAZADO");
    expect(falloPropiedad.esExito).toBe(false);
    expect(falloPropiedad.esExito ? undefined : falloPropiedad.error.codigo).toBe(
      "PROPIEDAD_RECHAZADA",
    );
  });

  test("ProcesarWhatsAppWebhookUseCase registra webhook y propiedad preliminar", async () => {
    const registroLead = new FakeRegistroLead();
    const registroPropiedad = new FakeRegistroPropiedad();

    const resultado = await new ProcesarWhatsAppWebhookUseCase(
      registroLead,
      registroPropiedad,
    ).ejecutar({
      wa_id: " 573001112233 ",
      wa_name: " Laura ",
      pregunta_tipo: " venta ",
      propiedad_id: " prop-456 ",
    });

    expect(resultado.esExito).toBe(true);
    expect(resultado.esExito ? resultado.valor : undefined).toEqual({
      idLead: "lead-001",
      idPropiedadPreliminar: "propiedad-preliminar-001",
    });
    expect(registroLead.entradas[0]).toEqual({
      canal: "WHATSAPP",
      origen: "whatsapp_webhook",
      nombre: "Laura",
      email: "573001112233@contacto.whatsapp.local",
      telefono: "573001112233",
      tipo: "VENTA",
      idPropiedadInteres: "prop-456",
      metadata: { canal: "whatsapp" },
    });
    expect(registroPropiedad.entradas[0]).toEqual({
      idLeadOrigen: "lead-001",
      asesorCaptadorId: "asesor-001",
      nombreContacto: "Laura",
      origen: "whatsapp_webhook",
      metadata: { canal: "whatsapp" },
    });
  });

  test("ProcesarWhatsAppWebhookUseCase propaga fallos y no crea propiedad para captacion", async () => {
    const registroLead = new FakeRegistroLead();
    const registroPropiedad = new FakeRegistroPropiedad();

    const captacion = await new ProcesarWhatsAppWebhookUseCase(
      registroLead,
      registroPropiedad,
    ).ejecutar({
      wa_id: "573001112233",
      wa_name: "Laura",
    });
    const fallo = await new ProcesarWhatsAppWebhookUseCase(
      new FakeRegistroLead(new ErrorDeDominio("Lead rechazado", { codigo: "LEAD_RECHAZADO" })),
      registroPropiedad,
    ).ejecutar({
      wa_id: "573001112233",
      wa_name: "Laura",
    });

    expect(captacion.esExito).toBe(true);
    expect(captacion.esExito ? captacion.valor.idPropiedadPreliminar : "x").toBeUndefined();
    expect(registroPropiedad.entradas).toHaveLength(0);
    expect(fallo.esExito).toBe(false);
    expect(fallo.esExito ? undefined : fallo.error.codigo).toBe("LEAD_RECHAZADO");
  });
});
