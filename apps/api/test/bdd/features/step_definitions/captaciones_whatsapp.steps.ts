import { Given, When, Then } from "@cucumber/cucumber";
import * as assert from "assert";

import {
  ConvertirCaptacionPendienteUseCase,
  MarcarCaptacionDuplicadaUseCase,
  ProcesarWhatsAppWebhookUseCase,
  RechazarCaptacionPendienteUseCase,
  RevisarCaptacionPendienteUseCase,
} from "../../../../src/lib/integraciones/application";
import {
  Captacion,
  CaptacionPendiente,
  type ICaptacionPendienteRepository,
} from "../../../../src/lib/integraciones/domain";
import {
  type IRegistroLeadCaptacion,
  type RegistroLeadCaptacionInput,
} from "../../../../src/lib/integraciones/domain/ports/IRegistroLeadCaptacion";
import {
  type IRegistroPropiedadCaptacion,
  type RegistroPropiedadCaptacionInput,
} from "../../../../src/lib/integraciones/domain/ports/IRegistroPropiedadCaptacion";
import { resultadoExitoso } from "../../../../src/lib/shared";
import { type IGeneradorId } from "../../../../src/lib/shared/domain/ports/IGeneradorId";

class CaptacionPendienteRepositoryFake implements ICaptacionPendienteRepository {
  readonly captaciones = new Map<string, CaptacionPendiente>();

  async guardar(captacion: CaptacionPendiente): Promise<void> {
    this.captaciones.set(captacion.id, captacion);
  }

  async obtenerPorId(id: string): Promise<CaptacionPendiente | null> {
    return this.captaciones.get(id) ?? null;
  }

  async listarPendientes(): Promise<CaptacionPendiente[]> {
    return [...this.captaciones.values()].filter((captacion) => captacion.estado.esPendiente());
  }
}

class GeneradorIdFijo implements IGeneradorId {
  generar(): string {
    return "captacion-001";
  }
}

class RegistroLeadCaptacionFake implements IRegistroLeadCaptacion {
  readonly entradas: RegistroLeadCaptacionInput[] = [];

  async registrar(input: RegistroLeadCaptacionInput) {
    this.entradas.push(input);
    return resultadoExitoso({ id: "lead-001", idAsesor: input.idAsesor ?? "asesor-1" });
  }
}

class RegistroPropiedadCaptacionFake implements IRegistroPropiedadCaptacion {
  readonly entradas: RegistroPropiedadCaptacionInput[] = [];

  async registrar(input: RegistroPropiedadCaptacionInput) {
    this.entradas.push(input);
    return resultadoExitoso({ id: "propiedad-preliminar-001" });
  }
}

let repository: CaptacionPendienteRepositoryFake;
let registroLead: RegistroLeadCaptacionFake;
let registroPropiedad: RegistroPropiedadCaptacionFake;
let resultado:
  | Awaited<ReturnType<ProcesarWhatsAppWebhookUseCase["ejecutar"]>>
  | Awaited<ReturnType<RevisarCaptacionPendienteUseCase["ejecutar"]>>
  | Awaited<ReturnType<MarcarCaptacionDuplicadaUseCase["ejecutar"]>>
  | Awaited<ReturnType<RechazarCaptacionPendienteUseCase["ejecutar"]>>
  | Awaited<ReturnType<ConvertirCaptacionPendienteUseCase["ejecutar"]>>;

function prepararContexto(): void {
  repository = new CaptacionPendienteRepositoryFake();
  registroLead = new RegistroLeadCaptacionFake();
  registroPropiedad = new RegistroPropiedadCaptacionFake();
}

async function registrarPendiente(tipo: "COMPRA" | "VENTA" = "COMPRA"): Promise<void> {
  await repository.guardar(
    CaptacionPendiente.registrar({
      id: "captacion-001",
      captacion: Captacion.registrar({
        canal: "WHATSAPP",
        origen: "whatsapp_webhook",
        nombre: tipo === "VENTA" ? "Ana Vendedora" : "Carlos Comprador",
        telefono: "59170000002",
        tipo,
      }),
    }),
  );
}

Given("una captacion pendiente de WhatsApp", async function () {
  prepararContexto();
  await registrarPendiente("COMPRA");
});

Given("una captacion vendedora pendiente de WhatsApp", async function () {
  prepararContexto();
  await registrarPendiente("VENTA");
});

When("WhatsApp registra una captacion de comprador {string}", async function (nombre: string) {
  prepararContexto();
  resultado = await new ProcesarWhatsAppWebhookUseCase(repository, new GeneradorIdFijo()).ejecutar({
    wa_id: "59170000002",
    wa_name: nombre,
    pregunta_tipo: "COMPRA",
  });
});

When("el equipo comercial revisa la captacion", async function () {
  resultado = await new RevisarCaptacionPendienteUseCase(repository).ejecutar({
    idCaptacion: "captacion-001",
  });
});

When(
  "el equipo comercial marca la captacion como duplicada por {string}",
  async function (razon: string) {
    resultado = await new MarcarCaptacionDuplicadaUseCase(repository).ejecutar({
      idCaptacion: "captacion-001",
      razon,
    });
  },
);

When("el equipo comercial rechaza la captacion por {string}", async function (razon: string) {
  resultado = await new RechazarCaptacionPendienteUseCase(repository).ejecutar({
    idCaptacion: "captacion-001",
    razon,
  });
});

When(
  "el equipo comercial convierte la captacion asignada a {string}",
  async function (idAsesor: string) {
    resultado = await new ConvertirCaptacionPendienteUseCase(
      repository,
      registroLead,
      registroPropiedad,
    ).ejecutar({
      idCaptacion: "captacion-001",
      idAsesor,
    });
  },
);

Then("la captacion queda en estado {string}", async function (estado: string) {
  assert.strictEqual(resultado.esExito, true);
  const captacion = await repository.obtenerPorId("captacion-001");
  assert.strictEqual(captacion?.estado.valor, estado);
});

Then("se crea un lead desde la captacion", function () {
  assert.strictEqual(resultado.esExito, true);
  assert.strictEqual(registroLead.entradas.length, 1);
  assert.strictEqual(registroLead.entradas[0]?.canal, "WHATSAPP");
});

Then("se crea una propiedad preliminar desde la captacion", function () {
  assert.strictEqual(resultado.esExito, true);
  assert.strictEqual(registroPropiedad.entradas.length, 1);
  assert.strictEqual(registroPropiedad.entradas[0]?.idLeadOrigen, "lead-001");
});
