import { Given, When, Then } from "@cucumber/cucumber";
import * as assert from "assert";

import { CrearContratoUseCase } from "../../../../src/lib/ventas/application/use-cases/CrearContratoUseCase";
import { FirmarContratoUseCase } from "../../../../src/lib/ventas/application/use-cases/FirmarContratoUseCase";
import { Contrato } from "../../../../src/lib/ventas/domain/entities/Contrato";
import { type IContratoRepository } from "../../../../src/lib/ventas/domain/ports/IContratoRepository";
import {
  idContrato,
  idCliente,
  idPropiedad,
  type IdContrato as IdContratoBrand,
  type IdCliente,
} from "../../../../src/lib/ventas/domain/value-objects/Ids";

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
}

let repository: FakeContratoRepository;
let resultadoCrear: Awaited<ReturnType<CrearContratoUseCase["ejecutar"]>>;
let resultadoFirmar: Awaited<ReturnType<FirmarContratoUseCase["ejecutar"]>>;

Given(
  "un cliente {string} y una propiedad {string}",
  function (_idCliente: string, _idPropiedad: string) {
    repository = new FakeContratoRepository();
    void _idCliente;
    void _idPropiedad;
  },
);

Given("un contrato en estado {string}", async function (_estado: string) {
  void _estado;
  repository = new FakeContratoRepository();
  const contrato = Contrato.crear({
    id: idContrato("cont-001"),
    idCliente: idCliente("cliente-001"),
    idPropiedad: idPropiedad("prop-001"),
    fechaInicio: new Date("2026-07-01"),
    fechaFin: new Date("2027-07-01"),
  });
  await repository.guardar(contrato);
});

When("el asesor crea un contrato para el cliente", async function () {
  resultadoCrear = await new CrearContratoUseCase(repository).ejecutar({
    id: "cont-001",
    idCliente: "cliente-001",
    idPropiedad: "prop-001",
    fechaInicio: new Date("2026-07-01"),
    fechaFin: new Date("2027-07-01"),
  });
});

When("el asesor firma el contrato", async function () {
  resultadoFirmar = await new FirmarContratoUseCase(repository).ejecutar({
    idContrato: "cont-001",
  });
});

Then("el contrato se crea en estado {string}", function (estado: string) {
  assert.strictEqual(resultadoCrear.esExito, true);
  if (resultadoCrear.esExito) {
    assert.strictEqual(resultadoCrear.valor.estado, estado);
  }
});

Then("el contrato pasa a estado {string}", async function (estado: string) {
  assert.strictEqual(resultadoFirmar.esExito, true);
  const contrato = await repository.buscarPorId(idContrato("cont-001"));
  assert.strictEqual(contrato?.estado, estado);
});
