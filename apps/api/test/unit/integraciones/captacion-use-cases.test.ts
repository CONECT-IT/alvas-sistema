import { describe, expect, test } from "bun:test";

import {
  ConvertirCaptacionPendienteUseCase,
  MarcarCaptacionDuplicadaUseCase,
  RechazarCaptacionPendienteUseCase,
  RevisarCaptacionPendienteUseCase,
} from "../../../src/lib/integraciones/application/use-cases/GestionarCaptacionPendienteUseCases";
import { ListarCaptacionesPendientesUseCase } from "../../../src/lib/integraciones/application/use-cases/ListarCaptacionesPendientesUseCase";
import { ProcesarCaptacionEntranteUseCase } from "../../../src/lib/integraciones/application/use-cases/ProcesarCaptacionEntranteUseCase";
import { ProcesarWhatsAppWebhookUseCase } from "../../../src/lib/integraciones/application/use-cases/ProcesarWhatsAppWebhookUseCase";
import { CaptacionPendiente } from "../../../src/lib/integraciones/domain/entities";
import {
  type ICaptacionPendienteRepository,
  Captacion,
} from "../../../src/lib/integraciones/domain";
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
import { type IGeneradorId } from "../../../src/lib/shared/domain/ports/IGeneradorId";

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

class GeneradorIdFijo implements IGeneradorId {
  constructor(private readonly id: string) {}

  generar(): string {
    return this.id;
  }
}

class FakeCaptacionPendienteRepository implements ICaptacionPendienteRepository {
  readonly captaciones: CaptacionPendiente[] = [];

  async guardar(captacion: CaptacionPendiente): Promise<void> {
    const index = this.captaciones.findIndex((item) => item.id === captacion.id);
    if (index >= 0) {
      this.captaciones[index] = captacion;
      return;
    }

    this.captaciones.push(captacion);
  }

  async obtenerPorId(id: string): Promise<CaptacionPendiente | null> {
    return this.captaciones.find((captacion) => captacion.id === id) ?? null;
  }

  async listarPendientes(): Promise<CaptacionPendiente[]> {
    return this.captaciones.filter((captacion) => captacion.estado.esPendiente());
  }
}

function crearCaptacionPendiente(
  id = "captacion-pendiente",
  tipo: "COMPRA" | "VENTA" = "COMPRA",
): CaptacionPendiente {
  return CaptacionPendiente.registrar({
    id,
    captacion: Captacion.registrar({
      canal: "WHATSAPP",
      origen: "whatsapp_webhook",
      nombre: "Laura",
      telefono: "573001112233",
      tipo,
      metadata: { canal: "whatsapp" },
    }),
  });
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

  test("ProcesarWhatsAppWebhookUseCase registra captacion pendiente sin crear lead directo", async () => {
    const captacionRepository = new FakeCaptacionPendienteRepository();

    const resultado = await new ProcesarWhatsAppWebhookUseCase(
      captacionRepository,
      new GeneradorIdFijo("captacion-001"),
    ).ejecutar({
      wa_id: " 573001112233 ",
      wa_name: " Laura ",
      pregunta_tipo: " venta ",
      propiedad_id: " prop-456 ",
    });

    expect(resultado.esExito).toBe(true);
    expect(resultado.esExito ? resultado.valor : undefined).toMatchObject({
      id: "captacion-001",
      canal: "WHATSAPP",
      origen: "whatsapp_webhook",
      nombre: "Laura",
      email: "573001112233@contacto.whatsapp.local",
      telefono: "573001112233",
      tipo: "VENTA",
      idPropiedadInteres: "prop-456",
      estado: "PENDIENTE",
      metadata: { canal: "whatsapp" },
    });
    expect(captacionRepository.captaciones).toHaveLength(1);
    expect(captacionRepository.captaciones[0]?.captacion.contacto.telefono).toBe("573001112233");
  });

  test("ListarCaptacionesPendientesUseCase devuelve solo bandeja pendiente", async () => {
    const captacionRepository = new FakeCaptacionPendienteRepository();
    const pendiente = crearCaptacionPendiente("captacion-pendiente");
    const duplicada = crearCaptacionPendiente("captacion-duplicada");
    duplicada.marcarDuplicada("Telefono ya registrado");
    await captacionRepository.guardar(pendiente);
    await captacionRepository.guardar(duplicada);

    const resultado = await new ListarCaptacionesPendientesUseCase(captacionRepository).ejecutar();

    expect(resultado.esExito).toBe(true);
    expect(resultado.esExito ? resultado.valor.map((item) => item.id) : []).toEqual([
      "captacion-pendiente",
    ]);
  });

  test("RevisarCaptacionPendienteUseCase cambia captacion pendiente a revisada", async () => {
    const captacionRepository = new FakeCaptacionPendienteRepository();
    await captacionRepository.guardar(crearCaptacionPendiente("captacion-001"));

    const resultado = await new RevisarCaptacionPendienteUseCase(captacionRepository).ejecutar({
      idCaptacion: "captacion-001",
    });

    expect(resultado.esExito).toBe(true);
    expect(resultado.esExito ? resultado.valor.estado : undefined).toBe("REVISADA");
    expect(captacionRepository.captaciones[0]?.estado.valor).toBe("REVISADA");
  });

  test("MarcarCaptacionDuplicadaUseCase cierra captacion con razon de duplicado", async () => {
    const captacionRepository = new FakeCaptacionPendienteRepository();
    await captacionRepository.guardar(crearCaptacionPendiente("captacion-001"));

    const resultado = await new MarcarCaptacionDuplicadaUseCase(captacionRepository).ejecutar({
      idCaptacion: "captacion-001",
      razon: "Telefono ya existe en leads",
    });

    expect(resultado.esExito).toBe(true);
    expect(resultado.esExito ? resultado.valor : undefined).toMatchObject({
      estado: "DUPLICADA",
      razonDuplicado: "Telefono ya existe en leads",
    });
  });

  test("RechazarCaptacionPendienteUseCase cierra captacion no valida", async () => {
    const captacionRepository = new FakeCaptacionPendienteRepository();
    await captacionRepository.guardar(crearCaptacionPendiente("captacion-001"));

    const resultado = await new RechazarCaptacionPendienteUseCase(captacionRepository).ejecutar({
      idCaptacion: "captacion-001",
      razon: "Mensaje sin intencion comercial",
    });

    expect(resultado.esExito).toBe(true);
    expect(resultado.esExito ? resultado.valor.estado : undefined).toBe("RECHAZADA");
  });

  test("ConvertirCaptacionPendienteUseCase crea lead y cierra captacion como convertida", async () => {
    const captacionRepository = new FakeCaptacionPendienteRepository();
    const registroLead = new FakeRegistroLead();
    await captacionRepository.guardar(crearCaptacionPendiente("captacion-001"));

    const resultado = await new ConvertirCaptacionPendienteUseCase(
      captacionRepository,
      registroLead,
    ).ejecutar({
      idCaptacion: "captacion-001",
      idAsesor: "asesor-admin",
    });

    expect(resultado.esExito).toBe(true);
    expect(resultado.esExito ? resultado.valor : undefined).toMatchObject({
      idLead: "lead-001",
      captacion: { id: "captacion-001", estado: "CONVERTIDA" },
    });
    expect(registroLead.entradas[0]).toMatchObject({
      canal: "WHATSAPP",
      tipo: "COMPRA",
      idAsesor: "asesor-admin",
    });
  });

  test("ConvertirCaptacionPendienteUseCase crea propiedad preliminar cuando captacion es vendedora", async () => {
    const captacionRepository = new FakeCaptacionPendienteRepository();
    const registroPropiedad = new FakeRegistroPropiedad();
    await captacionRepository.guardar(crearCaptacionPendiente("captacion-001", "VENTA"));

    const resultado = await new ConvertirCaptacionPendienteUseCase(
      captacionRepository,
      new FakeRegistroLead(),
      registroPropiedad,
    ).ejecutar({
      idCaptacion: "captacion-001",
      idAsesor: "asesor-admin",
    });

    expect(resultado.esExito).toBe(true);
    expect(resultado.esExito ? resultado.valor.idPropiedadPreliminar : undefined).toBe(
      "propiedad-preliminar-001",
    );
    expect(registroPropiedad.entradas[0]).toMatchObject({
      idLeadOrigen: "lead-001",
      asesorCaptadorId: "asesor-001",
      nombreContacto: "Laura",
    });
  });

  test("no permite procesar una captacion ya cerrada", async () => {
    const captacionRepository = new FakeCaptacionPendienteRepository();
    const captacion = crearCaptacionPendiente("captacion-001");
    captacion.marcarDuplicada("Duplicada");
    await captacionRepository.guardar(captacion);

    const resultado = await new ConvertirCaptacionPendienteUseCase(
      captacionRepository,
      new FakeRegistroLead(),
    ).ejecutar({ idCaptacion: "captacion-001" });

    expect(resultado.esExito).toBe(false);
    expect(resultado.esExito ? undefined : resultado.error.codigo).toBe("CAPTACION_NO_PROCESABLE");
  });

  test("devuelve error de negocio cuando la captacion pendiente no existe", async () => {
    const resultado = await new RevisarCaptacionPendienteUseCase(
      new FakeCaptacionPendienteRepository(),
    ).ejecutar({
      idCaptacion: "captacion-inexistente",
    });

    expect(resultado.esExito).toBe(false);
    expect(resultado.esExito ? undefined : resultado.error.codigo).toBe("CAPTACION_NO_ENCONTRADA");
  });

  test("ProcesarWhatsAppWebhookUseCase captura errores de dominio de captacion", async () => {
    const captacion = await new ProcesarWhatsAppWebhookUseCase(
      new FakeCaptacionPendienteRepository(),
      new GeneradorIdFijo("captacion-001"),
    ).ejecutar({
      wa_id: "573001112233",
      wa_name: " ",
    });

    expect(captacion.esExito).toBe(false);
  });

  test("propaga errores no dominio en ProcesarCaptacionEntranteUseCase", async () => {
    const registroLead = new FakeRegistroLead();
    registroLead.registrar = () => Promise.reject(new Error("db error"));

    await expect(
      new ProcesarCaptacionEntranteUseCase(registroLead).ejecutar({
        canal: "formulario_web",
        origen: "landing",
        nombre: "Ana",
        telefono: "999",
        tipo: "compra",
      }),
    ).rejects.toThrow("db error");
  });

  test("captura ErrorDeDominio como resultadoFallido en ProcesarCaptacionEntranteUseCase", async () => {
    const registroLead = new FakeRegistroLead();
    registroLead.registrar = () => Promise.reject(new ErrorDeDominio("error dominio"));

    const resultado = await new ProcesarCaptacionEntranteUseCase(registroLead).ejecutar({
      canal: "formulario_web",
      origen: "landing",
      nombre: "Ana",
      telefono: "999",
      tipo: "compra",
    });

    expect(resultado.esExito).toBe(false);
  });

  test("propaga errores no dominio en ProcesarWhatsAppWebhookUseCase", async () => {
    const captacionRepository = new FakeCaptacionPendienteRepository();
    captacionRepository.guardar = () => Promise.reject(new Error("db error"));

    await expect(
      new ProcesarWhatsAppWebhookUseCase(
        captacionRepository,
        new GeneradorIdFijo("captacion-001"),
      ).ejecutar({
        wa_id: "573001112233",
        wa_name: "Laura",
      }),
    ).rejects.toThrow("db error");
  });

  test("captura ErrorDeDominio como resultadoFallido en ProcesarWhatsAppWebhookUseCase", async () => {
    const captacionRepository = new FakeCaptacionPendienteRepository();
    captacionRepository.guardar = () => Promise.reject(new ErrorDeDominio("error dominio"));

    const resultado = await new ProcesarWhatsAppWebhookUseCase(
      captacionRepository,
      new GeneradorIdFijo("captacion-001"),
    ).ejecutar({
      wa_id: "573001112233",
      wa_name: "Laura",
    });

    expect(resultado.esExito).toBe(false);
  });
});
