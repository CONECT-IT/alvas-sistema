import { Given, When, Then } from "@cucumber/cucumber";
import * as assert from "assert";

import { CrearContratoUseCase } from "../../../../src/lib/ventas/application/use-cases/CrearContratoUseCase";
import { FirmarContratoUseCase } from "../../../../src/lib/ventas/application/use-cases/FirmarContratoUseCase";
import { CancelarContratoUseCase } from "../../../../src/lib/ventas/application/use-cases/CancelarContratoUseCase";
import { Contrato } from "../../../../src/lib/ventas/domain/entities/Contrato";
import { Lead } from "../../../../src/lib/ventas/domain/entities/Lead";
import { Cliente } from "../../../../src/lib/ventas/domain/entities/Cliente";
import { type IContratoRepository } from "../../../../src/lib/ventas/domain/ports/IContratoRepository";
import { type IVentasRepository } from "../../../../src/lib/ventas/domain/ports/IVentasRepository";
import { type IGeneradorId } from "../../../../src/lib/shared/domain/ports/IGeneradorId";
import {
  idContrato,
  idLead,
  idCliente,
  idPropiedad,
  type IdContrato as IdContratoBrand,
  type IdCliente,
  type IdLead,
} from "../../../../src/lib/ventas/domain/value-objects/Ids";
import { type IdUsuarioRef } from "../../../../src/lib/shared/domain/value-objects/IdUsuarioRef";

class FakeContratoRepository implements IContratoRepository {
  readonly contratos = new Map<string, Contrato>();

  async buscarPorId(id: IdContratoBrand): Promise<Contrato | null> {
    return this.contratos.get(id) ?? null;
  }

  async guardar(contrato: Contrato): Promise<void> {
    this.contratos.set(contrato.id, contrato);
  }

  async listar(): Promise<Contrato[]> {
    return [...this.contratos.values()];
  }

  async listarPorCliente(idCliente: IdCliente): Promise<Contrato[]> {
    return [...this.contratos.values()].filter((c) => c.idCliente === idCliente);
  }

  async listarPorLead(idLead: IdLead): Promise<Contrato[]> {
    return [...this.contratos.values()].filter((c) => c.idLead === idLead);
  }

  async listarPorIdsLead(_ids: IdLead[]): Promise<Contrato[]> {
    return [];
  }
}

class FakeVentasRepository implements IVentasRepository {
  readonly leads = new Map<string, Lead>();
  readonly clientes = new Map<string, Cliente>();
  readonly actividades: string[] = [];

  async obtenerLeadPorId(id: IdLead): Promise<Lead | null> {
    return this.leads.get(id) ?? null;
  }

  async guardarLead(lead: Lead): Promise<void> {
    this.leads.set(lead.id, lead);
  }

  async listarLeads(): Promise<Lead[]> {
    return [...this.leads.values()];
  }

  async listarLeadsPorAsesor(_idAsesor: IdUsuarioRef): Promise<Lead[]> {
    return [];
  }

  async listarLeadsPorEstado(_estado: string): Promise<Lead[]> {
    return [];
  }

  async listarAsesoresConLeads(): Promise<{ idAsesor: IdUsuarioRef; totalLeads: number }[]> {
    return [];
  }

  async obtenerClientePorId(id: IdCliente): Promise<Cliente | null> {
    return this.clientes.get(id) ?? null;
  }

  async guardarCliente(cliente: Cliente): Promise<void> {
    this.clientes.set(cliente.id, cliente);
  }

  async listarClientes(): Promise<Cliente[]> {
    return [...this.clientes.values()];
  }

  async listarClientesPorAsesor(_idAsesor: IdUsuarioRef): Promise<Cliente[]> {
    return [];
  }

  async registrarActividad(_idLead: IdLead, _evento: string, _descripcion: string): Promise<void> {
    this.actividades.push(_evento);
  }

  async obtenerActividadReciente(): Promise<
    { idLead: string; evento: string; descripcion: string; fecha: string }[]
  > {
    return [];
  }

  async obtenerActividadPorLead(
    _idLead: IdLead,
  ): Promise<{ id: number; idLead: string; evento: string; descripcion: string; fecha: string }[]> {
    return [];
  }
}

class GeneradorIdCliente implements IGeneradorId {
  generar(): string {
    return "cliente-creado-001";
  }
}

let contratoRepository: FakeContratoRepository;
let ventasRepository: FakeVentasRepository;
let resultadoCrear: Awaited<ReturnType<CrearContratoUseCase["ejecutar"]>>;
let resultadoFirmar: Awaited<ReturnType<FirmarContratoUseCase["ejecutar"]>>;
let resultadoCancelar: Awaited<ReturnType<CancelarContratoUseCase["ejecutar"]>>;

Given(
  "un lead {string} y una propiedad {string}",
  function (_idLead: string, _idPropiedad: string) {
    contratoRepository = new FakeContratoRepository();
    ventasRepository = new FakeVentasRepository();
    const lead = Lead.registrar({
      id: _idLead,
      nombre: "Maria",
      email: "maria@example.com",
      telefono: "999888777",
      tipo: "COMPRA",
      idAsesor: "asesor-1",
    });
    ventasRepository.leads.set(lead.id, lead);
    void _idPropiedad;
  },
);

Given("un contrato en estado {string}", async function (_estado: string) {
  contratoRepository = new FakeContratoRepository();
  ventasRepository = new FakeVentasRepository();
  const contrato = Contrato.crear({
    id: idContrato("cont-001"),
    idLead: idLead("lead-001"),
    idPropiedad: idPropiedad("prop-001"),
    fechaInicio: new Date("2026-07-01"),
    fechaFin: new Date("2027-07-01"),
  });
  if (_estado === "VIGENTE") {
    const lead = Lead.registrar({
      id: "lead-001",
      nombre: "Maria",
      email: "maria@example.com",
      telefono: "999888777",
      tipo: "COMPRA",
      idAsesor: "asesor-1",
    });
    ventasRepository.leads.set(lead.id, lead);
    contrato.asignarCliente(idCliente("cliente-001"));
    contrato.firmar();
  }
  await contratoRepository.guardar(contrato);
});

Given("un contrato en estado {string} vinculado a un lead", async function (_estado: string) {
  contratoRepository = new FakeContratoRepository();
  ventasRepository = new FakeVentasRepository();
  const lead = Lead.registrar({
    id: "lead-001",
    nombre: "Maria",
    email: "maria@example.com",
    telefono: "999888777",
    tipo: "COMPRA",
    idAsesor: "asesor-1",
  });
  ventasRepository.leads.set(lead.id, lead);
  const contrato = Contrato.crear({
    id: idContrato("cont-001"),
    idLead: idLead("lead-001"),
    idPropiedad: idPropiedad("prop-001"),
    fechaInicio: new Date("2026-07-01"),
    fechaFin: new Date("2027-07-01"),
  });
  await contratoRepository.guardar(contrato);
  void _estado;
});

When("el asesor crea un contrato para el lead", async function () {
  resultadoCrear = await new CrearContratoUseCase(contratoRepository).ejecutar({
    id: "cont-001",
    idLead: "lead-001",
    idPropiedad: "prop-001",
    fechaInicio: new Date("2026-07-01"),
    fechaFin: new Date("2027-07-01"),
  });
});

When("el asesor firma el contrato", async function () {
  resultadoFirmar = await new FirmarContratoUseCase(
    contratoRepository,
    ventasRepository,
    new GeneradorIdCliente(),
  ).ejecutar({
    idContrato: "cont-001",
  });
});

When("el asesor cancela el contrato", async function () {
  resultadoCancelar = await new CancelarContratoUseCase(contratoRepository).ejecutar({
    idContrato: "cont-001",
  });
});

Then("el contrato se crea en estado {string} con el lead vinculado", function (estado: string) {
  assert.strictEqual(resultadoCrear.esExito, true);
  if (resultadoCrear.esExito) {
    assert.strictEqual(resultadoCrear.valor.estado, estado);
    assert.strictEqual(resultadoCrear.valor.idLead, "lead-001");
    assert.strictEqual(resultadoCrear.valor.idCliente, undefined);
  }
});

Then(
  "el contrato pasa a estado {string} y el cliente queda creado",
  async function (estado: string) {
    assert.strictEqual(resultadoFirmar.esExito, true);
    const contrato = await contratoRepository.buscarPorId(idContrato("cont-001"));
    assert.strictEqual(contrato?.estado.valor, estado);
    assert.strictEqual(contrato?.idCliente, idCliente("cliente-creado-001"));
    const cliente = await ventasRepository.obtenerClientePorId(idCliente("cliente-creado-001"));
    assert.notStrictEqual(cliente, null);
  },
);

Then("el contrato pasa a estado {string}", async function (estado: string) {
  assert.strictEqual(resultadoCancelar.esExito, true);
  const contrato = await contratoRepository.buscarPorId(idContrato("cont-001"));
  assert.strictEqual(contrato?.estado.valor, estado);
});
