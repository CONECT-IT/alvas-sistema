import { Given, When, Then } from "@cucumber/cucumber";
import * as assert from "assert";

import { RegistrarLeadUseCase } from "../../../../src/lib/ventas/application/use-cases/RegistrarLeadUseCase";
import { AsignarLeadAAsesorUseCase } from "../../../../src/lib/ventas/application/use-cases/AsignarLeadAAsesorUseCase";
import { type IVentasRepository } from "../../../../src/lib/ventas/domain/ports/IVentasRepository";
import { Lead } from "../../../../src/lib/ventas/domain/entities/Lead";
import { type Cita } from "../../../../src/lib/ventas/domain/entities/Cita";
import { type Cliente } from "../../../../src/lib/ventas/domain/entities/Cliente";
import { type Contrato } from "../../../../src/lib/ventas/domain/entities/Contrato";
import { type IdLead, type IdCliente } from "../../../../src/lib/ventas/domain/value-objects/Ids";
import {
  type IEvaluadorAsignacion,
  type AsesorStat,
} from "../../../../src/lib/ventas/domain/services/EvaluadorAsignacion";
import { type IConsultaPropiedadInteres } from "../../../../src/lib/ventas/domain/ports/IConsultaPropiedadInteres";
import { resultadoExitoso, type Resultado } from "../../../../src/lib/shared";
import { ErrorDeDominio } from "../../../../src/lib/shared/domain";
import {
  idUsuarioRef,
  type IdUsuarioRef,
} from "../../../../src/lib/shared/domain/value-objects/IdUsuarioRef";
import { AutorizadorVentasAdapter } from "../../../../src/lib/ventas/infrastructure/security/AutorizadorVentasAdapter";

class FakeVentasRepository implements IVentasRepository {
  readonly leads = new Map<string, Lead>();
  readonly clientes = new Map<string, Cliente>();
  readonly actividades: string[] = [];
  readonly descripcionesActividad: string[] = [];

  async obtenerLeadPorId(id: IdLead): Promise<Lead | null> {
    return this.leads.get(id) ?? null;
  }

  async guardarLead(lead: Lead): Promise<void> {
    this.leads.set(lead.id, lead);
  }

  async listarLeads(): Promise<Lead[]> {
    return [...this.leads.values()];
  }

  async listarLeadsPorAsesor(idAsesor: IdUsuarioRef): Promise<Lead[]> {
    return [...this.leads.values()].filter((leadActual) => leadActual.idAsesor === idAsesor);
  }

  async listarLeadsPorEstado(estado: string): Promise<Lead[]> {
    return [...this.leads.values()].filter((leadActual) => leadActual.estado.valor === estado);
  }

  async listarAsesoresConLeads(): Promise<{ idAsesor: IdUsuarioRef; totalLeads: number }[]> {
    return [{ idAsesor: idUsuarioRef("asesor-1"), totalLeads: this.leads.size }];
  }

  async contarAccionesPorTipo(): Promise<{ evento: string; total: number }[]> {
    return [];
  }

  async obtenerClientePorId(_id: IdCliente): Promise<Cliente | null> {
    return null;
  }

  async guardarCliente(): Promise<void> {}

  async listarClientes(): Promise<Cliente[]> {
    return [];
  }

  async listarClientesPorAsesor(): Promise<Cliente[]> {
    return [];
  }

  async obtenerCitaPorId(): Promise<Cita | undefined> {
    return undefined;
  }

  async guardarCita(): Promise<void> {}

  async listarCitas(): Promise<Cita[]> {
    return [];
  }

  async obtenerContratoPorId(): Promise<Contrato | undefined> {
    return undefined;
  }

  async guardarContrato(): Promise<void> {}

  async listarContratos(): Promise<Contrato[]> {
    return [];
  }

  async listarPropiedadesPorCliente(): Promise<{ idPropiedad: string }[]> {
    return [];
  }

  async buscarAsesorConMenosLeads(): Promise<string | undefined> {
    return undefined;
  }

  async registrarActividad(_idLead: IdLead, evento: string, descripcion: string): Promise<void> {
    this.actividades.push(evento);
    this.descripcionesActividad.push(descripcion);
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

class GeneradorIdSecuencial {
  private indice = 0;
  constructor(private readonly ids: string[]) {}

  generar(): string {
    return this.ids[this.indice] ?? `id-${this.indice}`;
  }
}

class EvaluadorAsignacionExitoso implements IEvaluadorAsignacion {
  evaluar(_stats: AsesorStat[]): Resultado<IdUsuarioRef, ErrorDeDominio> {
    return resultadoExitoso(idUsuarioRef("asesor-1"));
  }
}

class ConsultaPropiedadDisponible implements IConsultaPropiedadInteres {
  constructor(private readonly disponibles: Set<string> = new Set()) {}

  async propiedadDisponibleParaCompra(idPropiedad: string): Promise<boolean> {
    return this.disponibles.has(idPropiedad);
  }
}

let repository: FakeVentasRepository;
let useCase: RegistrarLeadUseCase;
let resultado: Awaited<ReturnType<RegistrarLeadUseCase["ejecutar"]>>;
let resultadoReasignacion: Awaited<ReturnType<AsignarLeadAAsesorUseCase["ejecutar"]>>;
let consultaPropiedad: ConsultaPropiedadDisponible | undefined;
let autorizador: AutorizadorVentasAdapter | undefined;
let evaluador: IEvaluadorAsignacion;

Given("un administrador autenticado", function () {
  repository = new FakeVentasRepository();
  evaluador = new EvaluadorAsignacionExitoso();
  autorizador = new AutorizadorVentasAdapter();
});

Given("un asesor autenticado", function () {
  repository = new FakeVentasRepository();
  evaluador = new EvaluadorAsignacionExitoso();
  autorizador = new AutorizadorVentasAdapter();
});

Given("una propiedad disponible para compra", function () {
  consultaPropiedad = new ConsultaPropiedadDisponible(new Set(["prop-001"]));
});

Given("una propiedad vendida fuera del catalogo comprador", function () {
  consultaPropiedad = new ConsultaPropiedadDisponible(new Set());
});

Given("un lead existente pertenece a {string}", function (idAsesor: string) {
  const lead = Lead.registrar({
    id: "lead-001",
    nombre: "Carlos Comprador",
    email: "carlos@example.com",
    telefono: "300000000",
    tipo: "COMPRA",
    idAsesor,
  });
  repository.leads.set(lead.id, lead);
});

When(
  "el admin registra un lead {string} con email {string} tipo {string} asignado a {string}",
  async function (nombre: string, email: string, tipo: string, idAsesor: string) {
    useCase = new RegistrarLeadUseCase(
      repository,
      new GeneradorIdSecuencial(["lead-001"]),
      evaluador,
      autorizador,
      consultaPropiedad,
    );
    resultado = await useCase.ejecutar({
      nombre,
      email,
      telefono: "300000000",
      tipo,
      idAsesor,
      usuarioAutenticado: { id: "admin-1", rol: "ADMIN" },
    });
  },
);

When(
  "el asesor registra un lead {string} con email {string} tipo {string}",
  async function (nombre: string, email: string, tipo: string) {
    useCase = new RegistrarLeadUseCase(
      repository,
      new GeneradorIdSecuencial(["lead-001"]),
      evaluador,
      autorizador,
      consultaPropiedad,
    );
    resultado = await useCase.ejecutar({
      nombre,
      email,
      telefono: "300000000",
      tipo,
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });
  },
);

When(
  "el asesor registra un lead {string} con email {string} tipo {string} interesado en {string}",
  async function (nombre: string, email: string, tipo: string, idPropiedad: string) {
    useCase = new RegistrarLeadUseCase(
      repository,
      new GeneradorIdSecuencial(["lead-001"]),
      evaluador,
      autorizador,
      consultaPropiedad,
    );
    resultado = await useCase.ejecutar({
      nombre,
      email,
      telefono: "300000000",
      tipo,
      idPropiedadInteres: idPropiedad,
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });
  },
);

Then("el lead se crea asignado al asesor {string}", function (idAsesor: string) {
  assert.strictEqual(resultado.esExito, true);
  if (resultado.esExito) {
    assert.strictEqual(resultado.valor.idAsesor, idUsuarioRef(idAsesor));
  }
});

Then("el lead se crea asignado al asesor autenticado", function () {
  assert.strictEqual(resultado.esExito, true);
  if (resultado.esExito) {
    assert.strictEqual(resultado.valor.idAsesor, idUsuarioRef("asesor-1"));
  }
});

Then("el lead se crea con la propiedad de interes vinculada", function () {
  assert.strictEqual(resultado.esExito, true);
  if (resultado.esExito) {
    assert.strictEqual(resultado.valor.idPropiedadInteres as string, "prop-001");
  }
});

Then("el sistema rechaza la propiedad de interes porque no esta disponible", function () {
  assert.strictEqual(resultado.esExito, false);
  if (!resultado.esExito) {
    assert.strictEqual(resultado.error.codigo, "PROPIEDAD_INTERES_NO_DISPONIBLE");
  }
});

When("el asesor intenta reasignar el lead a {string}", async function (idAsesor: string) {
  resultadoReasignacion = await new AsignarLeadAAsesorUseCase(repository).ejecutar({
    idLead: "lead-001",
    idAsesor,
    usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
  });
});

Then(
  "el sistema rechaza la reasignacion porque solo admin puede reasignar leads",
  async function () {
    assert.strictEqual(resultadoReasignacion.esExito, false);
    if (!resultadoReasignacion.esExito) {
      assert.strictEqual(resultadoReasignacion.error.codigo, "SIN_PERMISOS_REASIGNAR_LEAD");
    }

    const lead = await repository.obtenerLeadPorId("lead-001" as IdLead);
    assert.strictEqual(lead?.idAsesor, idUsuarioRef("asesor-1"));
  },
);
