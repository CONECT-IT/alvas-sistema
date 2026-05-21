import { describe, expect, mock, test } from "bun:test";

import { type IGeneradorId } from "../../../src/lib/shared/domain/ports/IGeneradorId";
import {
  type IdUsuarioRef,
  idUsuarioRef,
} from "../../../src/lib/shared/domain/value-objects/IdUsuarioRef";
import { ActualizarCitaUseCase } from "../../../src/lib/ventas/application/use-cases/ActualizarCitaUseCase";
import { ActualizarClienteUseCase } from "../../../src/lib/ventas/application/use-cases/ActualizarClienteUseCase";
import { ActualizarLeadUseCase } from "../../../src/lib/ventas/application/use-cases/ActualizarLeadUseCase";
import { AgendarCitaUseCase } from "../../../src/lib/ventas/application/use-cases/AgendarCitaUseCase";
import { AsignarLeadAAsesorUseCase } from "../../../src/lib/ventas/application/use-cases/AsignarLeadAAsesorUseCase";
import { ConvertirLeadAClienteUseCase } from "../../../src/lib/ventas/application/use-cases/ConvertirLeadAClienteUseCase";
import { CrearContratoUseCase } from "../../../src/lib/ventas/application/use-cases/CrearContratoUseCase";
import { FirmarContratoUseCase } from "../../../src/lib/ventas/application/use-cases/FirmarContratoUseCase";
import { ListarAsesoresConLeadsUseCase } from "../../../src/lib/ventas/application/use-cases/ListarAsesoresConLeadsUseCase";
import { ListarCitasUseCase } from "../../../src/lib/ventas/application/use-cases/ListarCitasUseCase";
import { ListarClientesUseCase } from "../../../src/lib/ventas/application/use-cases/ListarClientesUseCase";
import { ListarContratosUseCase } from "../../../src/lib/ventas/application/use-cases/ListarContratosUseCase";
import { ListarLeadsPorAsesorUseCase } from "../../../src/lib/ventas/application/use-cases/ListarLeadsPorAsesorUseCase";
import { ListarLeadsUseCase } from "../../../src/lib/ventas/application/use-cases/ListarLeadsUseCase";
import { ListarPropiedadesPorClienteUseCase } from "../../../src/lib/ventas/application/use-cases/ListarPropiedadesPorClienteUseCase";
import { ObtenerCitaPorIdUseCase } from "../../../src/lib/ventas/application/use-cases/ObtenerCitaPorIdUseCase";
import { ObtenerClienteUseCase } from "../../../src/lib/ventas/application/use-cases/ObtenerClienteUseCase";
import { ObtenerLeadUseCase } from "../../../src/lib/ventas/application/use-cases/ObtenerLeadUseCase";
import { RegistrarClienteDirectoUseCase } from "../../../src/lib/ventas/application/use-cases/RegistrarClienteDirectoUseCase";
import { RegistrarLeadUseCase } from "../../../src/lib/ventas/application/use-cases/RegistrarLeadUseCase";
import { Cliente } from "../../../src/lib/ventas/domain/entities/Cliente";
import { Contrato } from "../../../src/lib/ventas/domain/entities/Contrato";
import { Lead } from "../../../src/lib/ventas/domain/entities/Lead";
import { type IConsultaPropiedadInteres } from "../../../src/lib/ventas/domain/ports/IConsultaPropiedadInteres";
import { type IContratoRepository } from "../../../src/lib/ventas/domain/ports/IContratoRepository";
import { type IVentasRepository } from "../../../src/lib/ventas/domain/ports/IVentasRepository";
import {
  idCliente,
  idContrato,
  idLead,
  idPropiedad,
  type IdCliente,
  type IdContrato as IdContratoBrand,
  type IdLead,
} from "../../../src/lib/ventas/domain/value-objects/Ids";
import { ErrorDeDominio } from "../../../src/lib/shared/domain/errors/ErrorDeDominio";
import { AutorizadorVentasAdapter } from "../../../src/lib/ventas/infrastructure/security/AutorizadorVentasAdapter";

class SecuenciaGeneradorId implements IGeneradorId {
  private indice = 0;

  constructor(private readonly ids: string[]) {}

  generar(): string {
    return this.ids[this.indice++] ?? `id-${this.indice}`;
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

  async listarLeadsPorAsesor(idAsesor: IdUsuarioRef): Promise<Lead[]> {
    return [...this.leads.values()].filter((lead) => lead.idAsesor === idAsesor);
  }

  async listarLeadsPorEstado(estado: string): Promise<Lead[]> {
    return [...this.leads.values()].filter((lead) => lead.estado.valor === estado);
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

  async listarClientesPorAsesor(idAsesor: IdUsuarioRef): Promise<Cliente[]> {
    return [...this.clientes.values()].filter((cliente) => cliente.idAsesor === idAsesor);
  }

  async registrarActividad(_idLead: IdLead, evento: string): Promise<void> {
    this.actividades.push(evento);
  }

  async obtenerActividadReciente(): Promise<
    { idLead: string; evento: string; descripcion: string; fecha: string }[]
  > {
    return [];
  }

  async listarAsesoresConLeads(): Promise<{ idAsesor: IdUsuarioRef; totalLeads: number }[]> {
    return [{ idAsesor: idUsuarioRef("asesor-1"), totalLeads: this.leads.size }];
  }
}

type ResultadoEvaluacion =
  | { esExito: true; valor: IdUsuarioRef }
  | { esExito: false; error: ErrorDeDominio };

class FakeEvaluadorAsignacion {
  private resultado: ResultadoEvaluacion;

  constructor(resultado?: ResultadoEvaluacion) {
    this.resultado = resultado ?? { esExito: true as const, valor: idUsuarioRef("asesor-1") };
  }

  evaluar(): ResultadoEvaluacion {
    return this.resultado;
  }
}

class FakeEvaluadorFallido {
  evaluar() {
    return { esExito: false as const, error: new ErrorDeDominio("No hay asesores.") };
  }
}

class FakeConsultaPropiedadInteres implements IConsultaPropiedadInteres {
  constructor(private readonly propiedadesDisponibles = new Set<string>()) {}

  async propiedadDisponibleParaCompra(idPropiedad: string): Promise<boolean> {
    return this.propiedadesDisponibles.has(idPropiedad);
  }
}

function crearLead(id = "lead-001"): Lead {
  return Lead.registrar({
    id,
    nombre: "Maria",
    email: "maria@example.com",
    telefono: "999888777",
    tipo: "COMPRA",
    idAsesor: "asesor-1",
  });
}

function crearCliente(id = "cliente-001"): Cliente {
  return Cliente.crear({
    id,
    nombre: "Maria Cliente",
    email: "cliente@example.com",
    telefono: "300123456",
    idAsesor: idUsuarioRef("asesor-1"),
  });
}

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

describe("ventas / use cases", () => {
  test("RegistrarLeadUseCase relaciona comprador solo con propiedad disponible", async () => {
    const repo = new FakeVentasRepository();

    const resultado = await new RegistrarLeadUseCase(
      repo,
      new SecuenciaGeneradorId(["lead-001"]),
      new FakeEvaluadorAsignacion(),
      new AutorizadorVentasAdapter(),
      new FakeConsultaPropiedadInteres(new Set(["prop-001"])),
    ).ejecutar({
      nombre: "Comprador",
      email: "comprador@example.com",
      telefono: "300000000",
      tipo: "COMPRA",
      idPropiedadInteres: "prop-001",
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    const lead = await repo.obtenerLeadPorId("lead-001" as IdLead);
    expect(resultado.esExito).toBe(true);
    expect(lead?.idPropiedadInteres as string).toBe("prop-001");
  });

  test("RegistrarLeadUseCase rechaza propiedad no disponible o lead vendedor con interes", async () => {
    const repo = new FakeVentasRepository();
    const crearUseCase = () =>
      new RegistrarLeadUseCase(
        repo,
        new SecuenciaGeneradorId(["lead-001"]),
        new FakeEvaluadorAsignacion(),
        new AutorizadorVentasAdapter(),
        new FakeConsultaPropiedadInteres(),
      );

    const propiedadNoDisponible = await crearUseCase().ejecutar({
      nombre: "Comprador",
      email: "comprador@example.com",
      telefono: "300000000",
      tipo: "COMPRA",
      idPropiedadInteres: "prop-preliminar",
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    const vendedorConInteres = await crearUseCase().ejecutar({
      nombre: "Vendedor",
      email: "vendedor@example.com",
      telefono: "300000001",
      tipo: "VENTA",
      idPropiedadInteres: "prop-001",
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    expect(propiedadNoDisponible.esExito).toBe(false);
    expect(propiedadNoDisponible.esExito ? undefined : propiedadNoDisponible.error.message).toBe(
      "La propiedad de interes no esta disponible para compradores.",
    );
    expect(propiedadNoDisponible.esExito ? undefined : propiedadNoDisponible.error.codigo).toBe(
      "PROPIEDAD_INTERES_NO_DISPONIBLE",
    );
    expect(vendedorConInteres.esExito).toBe(false);
    expect(vendedorConInteres.esExito ? undefined : vendedorConInteres.error.message).toBe(
      "Solo los leads compradores pueden relacionarse con una propiedad.",
    );
    expect(vendedorConInteres.esExito ? undefined : vendedorConInteres.error.codigo).toBe(
      "PROPIEDAD_INTERES_NO_APLICA",
    );
    expect(repo.leads.size).toBe(0);
  });

  test("RegistrarLeadUseCase funciona sin usuarioAutenticado", async () => {
    const repo = new FakeVentasRepository();

    const resultado = await new RegistrarLeadUseCase(
      repo,
      new SecuenciaGeneradorId(["lead-001"]),
      new FakeEvaluadorAsignacion(),
    ).ejecutar({
      nombre: "Anonimo",
      email: "anonimo@example.com",
      telefono: "300000000",
      tipo: "COMPRA",
    });

    expect(resultado.esExito).toBe(true);
    expect(repo.actividades).toContain("LEAD_REGISTRADO");
  });

  test("RegistrarLeadUseCase admin asigna a otro asesor", async () => {
    const repo = new FakeVentasRepository();

    const resultado = await new RegistrarLeadUseCase(
      repo,
      new SecuenciaGeneradorId(["lead-001"]),
      new FakeEvaluadorAsignacion(),
      new AutorizadorVentasAdapter(),
    ).ejecutar({
      nombre: "AdminReg",
      email: "adminreg@example.com",
      telefono: "300000000",
      tipo: "COMPRA",
      idAsesor: "asesor-2",
      usuarioAutenticado: { id: "admin-1", rol: "ADMIN" },
    });

    const lead = await repo.obtenerLeadPorId("lead-001" as IdLead);
    expect(resultado.esExito).toBe(true);
    expect(lead?.idAsesor).toBe(idUsuarioRef("asesor-2"));
  });

  test("RegistrarLeadUseCase funciona sin consultaPropiedadInteres", async () => {
    const repo = new FakeVentasRepository();

    const resultado = await new RegistrarLeadUseCase(
      repo,
      new SecuenciaGeneradorId(["lead-001"]),
      new FakeEvaluadorAsignacion(),
      new AutorizadorVentasAdapter(),
    ).ejecutar({
      nombre: "SinConsulta",
      email: "sinconsulta@example.com",
      telefono: "300000000",
      tipo: "COMPRA",
      idPropiedadInteres: "prop-001",
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    expect(resultado.esExito).toBe(true);
    expect(repo.leads.size).toBe(1);
  });

  test("RegistrarLeadUseCase rechaza si evaluador falla", async () => {
    const repo = new FakeVentasRepository();

    const resultado = await new RegistrarLeadUseCase(
      repo,
      new SecuenciaGeneradorId(["lead-001"]),
      new FakeEvaluadorFallido(),
    ).ejecutar({
      nombre: "SinAsesor",
      email: "sinasesor@example.com",
      telefono: "300000000",
      tipo: "COMPRA",
    });

    expect(resultado.esExito).toBe(false);
    expect(resultado.esExito ? undefined : resultado.error.message).toBe(
      "No se pudo asignar un asesor automáticamente.",
    );
    expect(repo.leads.size).toBe(0);
  });

  test("AgendarCitaUseCase agrega cita al lead y registra actividad", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());
    const registrarActividadSpy = mock(repo.registrarActividad.bind(repo));
    repo.registrarActividad = registrarActividadSpy;

    const resultado = await new AgendarCitaUseCase(
      repo,
      new SecuenciaGeneradorId(["cita-001"]),
      new AutorizadorVentasAdapter(),
    ).ejecutar({
      idLead: "lead-001",
      fechaInicio: new Date("2026-06-01T10:00:00.000Z"),
      duracionMinutos: 60,
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    const lead = await repo.obtenerLeadPorId("lead-001" as IdLead);
    expect(resultado.esExito).toBe(true);
    expect(lead?.citas).toHaveLength(1);
    if (resultado.esExito) {
      expect(lead?.citas[0]!.estado).toBe("PENDIENTE");
    }
    expect(repo.actividades).toContain("CITA_AGENDADA");
    expect(registrarActividadSpy).toHaveBeenCalledTimes(1);
  });

  test("AgendarCitaUseCase rechaza lead inexistente", async () => {
    const repo = new FakeVentasRepository();

    const resultado = await new AgendarCitaUseCase(
      repo,
      new SecuenciaGeneradorId(["cita-001"]),
      new AutorizadorVentasAdapter(),
    ).ejecutar({
      idLead: "lead-no-existe",
      fechaInicio: new Date("2026-06-01T10:00:00.000Z"),
      duracionMinutos: 60,
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    expect(resultado.esExito).toBe(false);
    expect(resultado.esExito ? undefined : resultado.error.message).toBe("Lead no encontrado");
  });

  test("AgendarCitaUseCase funciona sin usuarioAutenticado", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());

    const resultado = await new AgendarCitaUseCase(
      repo,
      new SecuenciaGeneradorId(["cita-001"]),
    ).ejecutar({
      idLead: "lead-001",
      fechaInicio: new Date("2026-06-01T10:00:00.000Z"),
      duracionMinutos: 60,
    });

    const lead = await repo.obtenerLeadPorId("lead-001" as IdLead);
    expect(resultado.esExito).toBe(true);
    expect(lead?.citas).toHaveLength(1);
  });

  test("ConvertirLeadAClienteUseCase crea cliente y cierra lead", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());

    const resultado = await new ConvertirLeadAClienteUseCase(
      repo,
      new SecuenciaGeneradorId(["cliente-001"]),
      new AutorizadorVentasAdapter(),
    ).ejecutar({
      idLead: "lead-001",
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    const lead = await repo.obtenerLeadPorId("lead-001" as IdLead);
    expect(resultado.esExito).toBe(true);
    expect(repo.clientes.size).toBe(1);
    expect(lead?.estado.valor).toBe("CONVERTIDO");
    expect(repo.actividades).toContain("CONVERTIDO_A_CLIENTE");
  });

  test("ConvertirLeadAClienteUseCase rechaza lead inexistente", async () => {
    const repo = new FakeVentasRepository();

    const resultado = await new ConvertirLeadAClienteUseCase(
      repo,
      new SecuenciaGeneradorId(["cliente-001"]),
      new AutorizadorVentasAdapter(),
    ).ejecutar({
      idLead: "lead-no-existe",
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    expect(resultado.esExito).toBe(false);
    expect(resultado.esExito ? undefined : resultado.error.message).toBe("Lead no encontrado");
    expect(repo.clientes.size).toBe(0);
  });

  test("ConvertirLeadAClienteUseCase funciona sin usuarioAutenticado", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());

    const resultado = await new ConvertirLeadAClienteUseCase(
      repo,
      new SecuenciaGeneradorId(["cliente-001"]),
    ).ejecutar({
      idLead: "lead-001",
    });

    expect(resultado.esExito).toBe(true);
    expect(repo.clientes.size).toBe(1);
  });

  test("rechaza mutaciones de leads ajenos para asesores", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());

    const resultado = await new ActualizarLeadUseCase(
      repo,
      new AutorizadorVentasAdapter(),
    ).ejecutar({
      id: "lead-001",
      nombre: "Otro nombre",
      usuarioAutenticado: { id: "asesor-2", rol: "ASESOR" },
    });

    const lead = await repo.obtenerLeadPorId("lead-001" as IdLead);
    expect(resultado.esExito).toBe(false);
    expect(resultado.esExito ? undefined : resultado.error.message).toBe(
      "No tienes permisos para gestionar este lead.",
    );
    expect(resultado.esExito ? undefined : resultado.error.codigo).toBe("SIN_PERMISOS_LEAD");
    expect(lead?.nombre).toBe("Maria");
  });

  test("ActualizarLeadUseCase relaciona comprador con propiedad disponible", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());

    const resultado = await new ActualizarLeadUseCase(
      repo,
      new AutorizadorVentasAdapter(),
      new FakeConsultaPropiedadInteres(new Set(["prop-001"])),
    ).ejecutar({
      id: "lead-001",
      idPropiedadInteres: "prop-001",
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    const lead = await repo.obtenerLeadPorId("lead-001" as IdLead);
    expect(resultado.esExito).toBe(true);
    expect(lead?.idPropiedadInteres as string).toBe("prop-001");
  });

  test("ActualizarLeadUseCase rechaza relacionar propiedad no disponible", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());

    const resultado = await new ActualizarLeadUseCase(
      repo,
      new AutorizadorVentasAdapter(),
      new FakeConsultaPropiedadInteres(),
    ).ejecutar({
      id: "lead-001",
      idPropiedadInteres: "prop-preliminar",
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    const lead = await repo.obtenerLeadPorId("lead-001" as IdLead);
    expect(resultado.esExito).toBe(false);
    expect(resultado.esExito ? undefined : resultado.error.message).toBe(
      "La propiedad de interes no esta disponible para compradores.",
    );
    expect(resultado.esExito ? undefined : resultado.error.codigo).toBe(
      "PROPIEDAD_INTERES_NO_DISPONIBLE",
    );
    expect(lead?.idPropiedadInteres).toBeUndefined();
  });

  test("permite a admin mutar leads de cualquier asesor", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());

    const resultado = await new ActualizarLeadUseCase(
      repo,
      new AutorizadorVentasAdapter(),
    ).ejecutar({
      id: "lead-001",
      nombre: "Nombre admin",
      usuarioAutenticado: { id: "admin-1", rol: "ADMIN" },
    });

    const lead = await repo.obtenerLeadPorId("lead-001" as IdLead);
    expect(resultado.esExito).toBe(true);
    expect(lead?.nombre).toBe("Nombre admin");
  });

  test("ActualizarLeadUseCase funciona sin usuarioAutenticado", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());

    const resultado = await new ActualizarLeadUseCase(repo).ejecutar({
      id: "lead-001",
      nombre: "Sin auth",
    });

    const lead = await repo.obtenerLeadPorId("lead-001" as IdLead);
    expect(resultado.esExito).toBe(true);
    expect(lead?.nombre).toBe("Sin auth");
  });

  test("ActualizarLeadUseCase rechaza lead inexistente", async () => {
    const repo = new FakeVentasRepository();

    const resultado = await new ActualizarLeadUseCase(repo).ejecutar({
      id: "lead-no-existe",
      nombre: "No importa",
    });

    expect(resultado.esExito).toBe(false);
    expect(resultado.esExito ? undefined : resultado.error.message).toBe("Lead no encontrado");
    expect(resultado.esExito ? undefined : resultado.error.codigo).toBe("LEAD_NOT_FOUND");
  });

  test("ActualizarCitaUseCase reprograma cita existente y registra actividad", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());
    await new AgendarCitaUseCase(
      repo,
      new SecuenciaGeneradorId(["cita-001"]),
      new AutorizadorVentasAdapter(),
    ).ejecutar({
      idLead: "lead-001",
      fechaInicio: new Date("2026-06-01T10:00:00.000Z"),
      duracionMinutos: 60,
      observacion: "Primera visita",
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    const resultado = await new ActualizarCitaUseCase(
      repo,
      new AutorizadorVentasAdapter(),
    ).ejecutar({
      idLead: "lead-001",
      idCita: "cita-001",
      fechaInicio: new Date("2026-06-02T15:30:00.000Z"),
      duracionMinutos: 45,
      observacion: "Reprogramada por cliente",
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    const lead = await repo.obtenerLeadPorId("lead-001" as IdLead);
    const cita = lead?.obtenerCitaPorId("cita-001" as never);
    expect(resultado.esExito).toBe(true);
    expect(cita?.fechaInicio.toISOString()).toBe("2026-06-02T15:30:00.000Z");
    expect(cita?.fechaFin.toISOString()).toBe("2026-06-02T16:15:00.000Z");
    expect(cita?.estado).toBe("REPROGRAMADA");
    expect(cita?.observacion).toBe("Reprogramada por cliente");
    expect(repo.actividades).toContain("CITA_ACTUALIZADA");
  });

  test("ActualizarCitaUseCase rechaza lead, cita o asesor no autorizado", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());
    await new AgendarCitaUseCase(
      repo,
      new SecuenciaGeneradorId(["cita-001"]),
      new AutorizadorVentasAdapter(),
    ).ejecutar({
      idLead: "lead-001",
      fechaInicio: new Date("2026-06-01T10:00:00.000Z"),
      duracionMinutos: 60,
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });
    const useCase = new ActualizarCitaUseCase(repo, new AutorizadorVentasAdapter());

    const leadInexistente = await useCase.ejecutar({
      idLead: "lead-no-existe",
      idCita: "cita-001",
      observacion: "No aplica",
    });
    const sinPermisos = await useCase.ejecutar({
      idLead: "lead-001",
      idCita: "cita-001",
      observacion: "No autorizado",
      usuarioAutenticado: { id: "asesor-2", rol: "ASESOR" },
    });
    const citaInexistente = await useCase.ejecutar({
      idLead: "lead-001",
      idCita: "cita-no-existe",
      observacion: "No aplica",
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    expect(leadInexistente.esExito).toBe(false);
    expect(leadInexistente.esExito ? undefined : leadInexistente.error.message).toBe(
      "Lead no encontrado",
    );
    expect(leadInexistente.esExito ? undefined : leadInexistente.error.codigo).toBe(
      "LEAD_NOT_FOUND",
    );
    expect(sinPermisos.esExito).toBe(false);
    expect(sinPermisos.esExito ? undefined : sinPermisos.error.message).toBe(
      "No tienes permisos para gestionar este lead.",
    );
    expect(sinPermisos.esExito ? undefined : sinPermisos.error.codigo).toBe("SIN_PERMISOS_LEAD");
    expect(citaInexistente.esExito).toBe(false);
    expect(citaInexistente.esExito ? undefined : citaInexistente.error.message).toBe(
      "Cita no encontrada",
    );
    expect(citaInexistente.esExito ? undefined : citaInexistente.error.codigo).toBe(
      "CITA_NOT_FOUND",
    );
  });

  test("ListarLeadsUseCase devuelve todos para admin y solo propios para asesor", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead("lead-001"));
    await repo.guardarLead(
      Lead.registrar({
        id: "lead-002",
        nombre: "Luis",
        email: "luis@example.com",
        telefono: "111222333",
        tipo: "COMPRA",
        idAsesor: "asesor-2",
      }),
    );
    const useCase = new ListarLeadsUseCase(repo, new AutorizadorVentasAdapter());

    const admin = await useCase.ejecutar({ idUsuarioEjecutor: "admin-1", rolEjecutor: "ADMIN" });
    const asesor = await useCase.ejecutar({
      idUsuarioEjecutor: "asesor-1",
      rolEjecutor: "ASESOR",
    });

    expect(admin.esExito).toBe(true);
    expect(admin.esExito ? admin.valor.map((lead) => lead.id) : []).toEqual([
      idLead("lead-001"),
      idLead("lead-002"),
    ]);
    expect(asesor.esExito).toBe(true);
    expect(asesor.esExito ? asesor.valor.map((lead) => lead.id) : []).toEqual([idLead("lead-001")]);
  });

  test("ObtenerLeadUseCase devuelve lead o error de no encontrado", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead("lead-001"));
    const useCase = new ObtenerLeadUseCase(repo);

    const encontrado = await useCase.ejecutar({ id: "lead-001" });
    const inexistente = await useCase.ejecutar({ id: "lead-no-existe" });

    expect(encontrado.esExito).toBe(true);
    expect(encontrado.esExito ? encontrado.valor.id : undefined).toBe(idLead("lead-001"));
    expect(inexistente.esExito).toBe(false);
    expect(inexistente.esExito ? undefined : inexistente.error.message).toContain("lead-no-existe");
  });

  test("ListarClientesUseCase y ObtenerClienteUseCase consultan clientes", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarCliente(crearCliente("cliente-001"));
    await repo.guardarCliente(crearCliente("cliente-002"));

    const listado = await new ListarClientesUseCase(repo).ejecutar();
    const encontrado = await new ObtenerClienteUseCase(repo).ejecutar({ id: "cliente-001" });
    const inexistente = await new ObtenerClienteUseCase(repo).ejecutar({
      id: "cliente-no-existe",
    });

    expect(listado.esExito).toBe(true);
    expect(listado.esExito ? listado.valor.map((cliente) => cliente.id) : []).toEqual([
      idCliente("cliente-001"),
      idCliente("cliente-002"),
    ]);
    expect(encontrado.esExito).toBe(true);
    expect(encontrado.esExito ? encontrado.valor.nombre : undefined).toBe("Maria Cliente");
    expect(inexistente.esExito).toBe(false);
    expect(inexistente.esExito ? undefined : inexistente.error.message).toContain(
      "cliente-no-existe",
    );
  });

  test("ObtenerCitaPorIdUseCase devuelve cita o error", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());
    await new AgendarCitaUseCase(
      repo,
      new SecuenciaGeneradorId(["cita-001"]),
      new AutorizadorVentasAdapter(),
    ).ejecutar({
      idLead: "lead-001",
      fechaInicio: new Date("2026-06-01T10:00:00.000Z"),
      duracionMinutos: 60,
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });
    const useCase = new ObtenerCitaPorIdUseCase(repo);

    const encontrado = await useCase.ejecutar({ idLead: "lead-001", idCita: "cita-001" });
    const leadInexistente = await useCase.ejecutar({
      idLead: "lead-no-existe",
      idCita: "cita-001",
    });
    const citaInexistente = await useCase.ejecutar({
      idLead: "lead-001",
      idCita: "cita-no-existe",
    });

    expect(encontrado.esExito).toBe(true);
    expect(encontrado.esExito ? encontrado.valor.fechaInicio.toISOString() : "").toBe(
      "2026-06-01T10:00:00.000Z",
    );
    expect(leadInexistente.esExito).toBe(false);
    expect(citaInexistente.esExito).toBe(false);
  });

  test("AsignarLeadAAsesorUseCase cambia asesor y registra actividad", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());

    const resultado = await new AsignarLeadAAsesorUseCase(repo).ejecutar({
      idLead: "lead-001",
      idAsesor: "asesor-2",
    });

    const lead = await repo.obtenerLeadPorId("lead-001" as IdLead);
    expect(resultado.esExito).toBe(true);
    expect(lead?.idAsesor).toBe(idUsuarioRef("asesor-2"));
    expect(repo.actividades).toContain("LEAD_ASIGNADO_A_ASESOR");
  });

  test("AsignarLeadAAsesorUseCase rechaza lead inexistente", async () => {
    const repo = new FakeVentasRepository();

    const resultado = await new AsignarLeadAAsesorUseCase(repo).ejecutar({
      idLead: "lead-no-existe",
      idAsesor: "asesor-2",
    });

    expect(resultado.esExito).toBe(false);
    expect(resultado.esExito ? undefined : resultado.error.message).toContain("lead-no-existe");
  });

  test("ActualizarClienteUseCase actualiza datos y devuelve output", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarCliente(crearCliente());

    const resultado = await new ActualizarClienteUseCase(repo).ejecutar({
      idCliente: "cliente-001",
      nombre: "Maria Actualizada",
      email: "maria.nuevo@example.com",
    });

    const cliente = await repo.obtenerClientePorId("cliente-001" as IdCliente);
    expect(resultado.esExito).toBe(true);
    expect(resultado.esExito ? resultado.valor.nombre : "").toBe("Maria Actualizada");
    expect(cliente?.nombre).toBe("Maria Actualizada");
    expect(cliente?.email).toBe("maria.nuevo@example.com");
  });

  test("ActualizarClienteUseCase rechaza cliente inexistente", async () => {
    const repo = new FakeVentasRepository();

    const resultado = await new ActualizarClienteUseCase(repo).ejecutar({
      idCliente: "cliente-no-existe",
      nombre: "No importa",
    });

    expect(resultado.esExito).toBe(false);
    expect(resultado.esExito ? undefined : resultado.error.message).toContain("cliente-no-existe");
  });

  test("RegistrarClienteDirectoUseCase crea cliente en repositorio", async () => {
    const repo = new FakeVentasRepository();

    const resultado = await new RegistrarClienteDirectoUseCase(
      repo,
      new SecuenciaGeneradorId(["cli-001"]),
    ).ejecutar({
      nombre: "Cliente Directo",
      email: "directo@example.com",
      telefono: "300111222",
      idAsesor: "asesor-1",
    });

    expect(resultado.esExito).toBe(true);
    expect(repo.clientes.size).toBe(1);
    if (resultado.esExito) {
      expect(resultado.valor.nombre).toBe("Cliente Directo");
      expect(resultado.valor.idAsesor).toBe(idUsuarioRef("asesor-1"));
    }
  });

  test("ListarCitasUseCase devuelve citas de todos los leads", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());
    const genId = new SecuenciaGeneradorId(["cita-001", "cita-002"]);
    const agendar = new AgendarCitaUseCase(repo, genId, new AutorizadorVentasAdapter());
    await agendar.ejecutar({
      idLead: "lead-001",
      fechaInicio: new Date("2026-06-01T10:00:00.000Z"),
      duracionMinutos: 60,
    });

    const resultado = await new ListarCitasUseCase(repo).ejecutar();

    expect(resultado.esExito).toBe(true);
    expect(resultado.esExito ? resultado.valor : []).toHaveLength(1);
    expect(resultado.esExito ? resultado.valor[0]!.fechaInicio.toISOString() : "").toBe(
      "2026-06-01T10:00:00.000Z",
    );
  });

  test("ListarLeadsPorAsesorUseCase filtra por asesor", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead("lead-001"));
    await repo.guardarLead(
      Lead.registrar({
        id: "lead-002",
        nombre: "Otro",
        email: "otro@example.com",
        telefono: "111222333",
        tipo: "COMPRA",
        idAsesor: "asesor-2",
      }),
    );

    const resultado = await new ListarLeadsPorAsesorUseCase(repo).ejecutar({
      idAsesor: "asesor-1",
    });

    expect(resultado.esExito).toBe(true);
    expect(resultado.esExito ? resultado.valor : []).toHaveLength(1);
    expect(resultado.esExito ? resultado.valor[0]!.id : "").toBe(idLead("lead-001"));
  });

  test("ListarAsesoresConLeadsUseCase devuelve stats", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());

    const resultado = await new ListarAsesoresConLeadsUseCase(repo).ejecutar();

    expect(resultado.esExito).toBe(true);
    expect(resultado.esExito ? resultado.valor : []).toHaveLength(1);
    expect(resultado.esExito ? resultado.valor[0]!.totalLeads : 0).toBe(1);
  });

  test("CrearContratoUseCase guarda contrato en repositorio", async () => {
    const repo = new FakeContratoRepository();

    const resultado = await new CrearContratoUseCase(repo).ejecutar({
      id: "cont-001",
      idCliente: "cliente-001",
      idPropiedad: "prop-001",
      fechaInicio: new Date("2026-07-01"),
      fechaFin: new Date("2027-07-01"),
    });

    expect(resultado.esExito).toBe(true);
    expect(repo.contratos.size).toBe(1);
    if (resultado.esExito) {
      expect(resultado.valor.estado).toBe("BORRADOR");
      expect(resultado.valor.idCliente).toBe(idCliente("cliente-001"));
    }
  });

  test("FirmarContratoUseCase cambia estado a VIGENTE", async () => {
    const repo = new FakeContratoRepository();
    await repo.guardar(
      Contrato.crear({
        id: idContrato("cont-001"),
        idCliente: idCliente("cliente-001"),
        idPropiedad: idPropiedad("prop-001"),
        fechaInicio: new Date("2026-07-01"),
        fechaFin: new Date("2027-07-01"),
      }),
    );

    const resultado = await new FirmarContratoUseCase(repo).ejecutar({
      idContrato: "cont-001",
    });

    const contrato = await repo.buscarPorId(idContrato("cont-001"));
    expect(resultado.esExito).toBe(true);
    expect(contrato?.estado).toBe("VIGENTE");
  });

  test("FirmarContratoUseCase rechaza contrato inexistente", async () => {
    const repo = new FakeContratoRepository();

    const resultado = await new FirmarContratoUseCase(repo).ejecutar({
      idContrato: "cont-no-existe",
    });

    expect(resultado.esExito).toBe(false);
  });

  test("ListarContratosUseCase devuelve todos los contratos", async () => {
    const repo = new FakeContratoRepository();
    await repo.guardar(
      Contrato.crear({
        id: idContrato("cont-001"),
        idCliente: idCliente("cliente-001"),
        idPropiedad: idPropiedad("prop-001"),
        fechaInicio: new Date("2026-07-01"),
        fechaFin: new Date("2027-07-01"),
      }),
    );
    await repo.guardar(
      Contrato.crear({
        id: idContrato("cont-002"),
        idCliente: idCliente("cliente-002"),
        idPropiedad: idPropiedad("prop-002"),
        fechaInicio: new Date("2026-08-01"),
        fechaFin: new Date("2027-08-01"),
      }),
    );

    const resultado = await new ListarContratosUseCase(repo).ejecutar();

    expect(resultado.esExito).toBe(true);
    expect(resultado.esExito ? resultado.valor.contratos : []).toHaveLength(2);
  });

  test("ListarPropiedadesPorClienteUseCase devuelve ids unicos", async () => {
    const repo = new FakeContratoRepository();
    await repo.guardar(
      Contrato.crear({
        id: idContrato("cont-001"),
        idCliente: idCliente("cliente-001"),
        idPropiedad: idPropiedad("prop-001"),
        fechaInicio: new Date("2026-07-01"),
        fechaFin: new Date("2027-07-01"),
      }),
    );

    const resultado = await new ListarPropiedadesPorClienteUseCase(repo).ejecutar({
      idCliente: "cliente-001",
    });

    expect(resultado.esExito).toBe(true);
    expect(resultado.esExito ? resultado.valor : []).toHaveLength(1);
  });

  test("propaga errores no dominico en RegistrarLeadUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.guardarLead = () => Promise.reject(new Error("db error"));

    const resultado = new RegistrarLeadUseCase(
      repo,
      new SecuenciaGeneradorId(["lead-001"]),
      new FakeEvaluadorAsignacion(),
    ).ejecutar({
      nombre: "test",
      email: "test@example.com",
      telefono: "300000000",
      tipo: "COMPRA",
      idAsesor: "asesor-1",
    });

    await expect(resultado).rejects.toThrow("db error");
  });

  test("propaga errores no dominico en AgendarCitaUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.obtenerLeadPorId = () => Promise.reject(new Error("db error"));

    const resultado = new AgendarCitaUseCase(repo, new SecuenciaGeneradorId(["cita-001"])).ejecutar(
      {
        idLead: "lead-001",
        fechaInicio: new Date(),
        duracionMinutos: 60,
      },
    );

    await expect(resultado).rejects.toThrow("db error");
  });

  test("propaga errores no dominico en ActualizarLeadUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.obtenerLeadPorId = () => Promise.reject(new Error("db error"));

    const resultado = new ActualizarLeadUseCase(repo).ejecutar({
      id: "lead-001",
      nombre: "test",
    });

    await expect(resultado).rejects.toThrow("db error");
  });

  test("propaga errores no dominico en ConvertirLeadAClienteUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.obtenerLeadPorId = () => Promise.reject(new Error("db error"));

    const resultado = new ConvertirLeadAClienteUseCase(
      repo,
      new SecuenciaGeneradorId(["cliente-001"]),
    ).ejecutar({
      idLead: "lead-001",
    });

    await expect(resultado).rejects.toThrow("db error");
  });

  test("propaga errores no dominico en AsignarLeadAAsesorUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.obtenerLeadPorId = () => Promise.reject(new Error("db error"));

    const resultado = new AsignarLeadAAsesorUseCase(repo).ejecutar({
      idLead: "lead-001",
      idAsesor: "asesor-2",
    });

    await expect(resultado).rejects.toThrow("db error");
  });

  test("propaga errores no dominico en ObtenerCitaPorIdUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.obtenerLeadPorId = () => Promise.reject(new Error("db error"));

    const resultado = new ObtenerCitaPorIdUseCase(repo).ejecutar({
      idLead: "lead-001",
      idCita: "cita-001",
    });

    await expect(resultado).rejects.toThrow("db error");
  });

  test("propaga errores no dominico en ActualizarClienteUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.obtenerClientePorId = () => Promise.reject(new Error("db error"));

    const resultado = new ActualizarClienteUseCase(repo).ejecutar({
      idCliente: "cliente-001",
      nombre: "test",
    });

    await expect(resultado).rejects.toThrow("db error");
  });

  test("propaga errores no dominico en FirmarContratoUseCase", async () => {
    const repo = new FakeContratoRepository();
    repo.buscarPorId = () => Promise.reject(new Error("db error"));

    const resultado = new FirmarContratoUseCase(repo).ejecutar({
      idContrato: "cont-001",
    });

    await expect(resultado).rejects.toThrow("db error");
  });

  test("propaga errores no dominico en CrearContratoUseCase", async () => {
    const repo = new FakeContratoRepository();
    repo.guardar = () => Promise.reject(new Error("db error"));

    const resultado = new CrearContratoUseCase(repo).ejecutar({
      id: "cont-001",
      idCliente: "cliente-001",
      idPropiedad: "prop-001",
      fechaInicio: new Date(),
      fechaFin: new Date("2027-01-01"),
    });

    await expect(resultado).rejects.toThrow("db error");
  });

  test("propaga errores no dominico en ObtenerLeadUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.obtenerLeadPorId = () => Promise.reject(new Error("db error"));

    await expect(new ObtenerLeadUseCase(repo).ejecutar({ id: "lead-001" })).rejects.toThrow(
      "db error",
    );
  });

  test("propaga errores no dominico en ObtenerClienteUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.obtenerClientePorId = () => Promise.reject(new Error("db error"));

    await expect(new ObtenerClienteUseCase(repo).ejecutar({ id: "cliente-001" })).rejects.toThrow(
      "db error",
    );
  });

  test("propaga errores no dominico en ListarLeadsUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.listarLeads = () => Promise.reject(new Error("db error"));

    await expect(
      new ListarLeadsUseCase(repo, new AutorizadorVentasAdapter()).ejecutar({
        idUsuarioEjecutor: "admin",
        rolEjecutor: "ADMIN",
      }),
    ).rejects.toThrow("db error");
  });

  test("propaga errores no dominico en ListarClientesUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.listarClientes = () => Promise.reject(new Error("db error"));

    await expect(new ListarClientesUseCase(repo).ejecutar()).rejects.toThrow("db error");
  });

  test("propaga errores no dominico en RegistrarClienteDirectoUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.guardarCliente = () => Promise.reject(new Error("db error"));

    await expect(
      new RegistrarClienteDirectoUseCase(repo, new SecuenciaGeneradorId(["cli-001"])).ejecutar({
        nombre: "test",
        email: "test@example.com",
        telefono: "300000000",
        idAsesor: "asesor-1",
      }),
    ).rejects.toThrow("db error");
  });

  test("propaga errores no dominico en ListarCitasUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.listarLeads = () => Promise.reject(new Error("db error"));

    await expect(new ListarCitasUseCase(repo).ejecutar()).rejects.toThrow("db error");
  });

  test("propaga errores no dominico en ListarLeadsPorAsesorUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.listarLeadsPorAsesor = () => Promise.reject(new Error("db error"));

    await expect(
      new ListarLeadsPorAsesorUseCase(repo).ejecutar({ idAsesor: "asesor-1" }),
    ).rejects.toThrow("db error");
  });

  test("propaga errores no dominico en ListarAsesoresConLeadsUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.listarAsesoresConLeads = () => Promise.reject(new Error("db error"));

    await expect(new ListarAsesoresConLeadsUseCase(repo).ejecutar()).rejects.toThrow("db error");
  });

  test("propaga errores no dominico en ListarContratosUseCase", async () => {
    const repo = new FakeContratoRepository();
    repo.listar = () => Promise.reject(new Error("db error"));

    await expect(new ListarContratosUseCase(repo).ejecutar()).rejects.toThrow("db error");
  });

  test("propaga errores no dominico en ListarPropiedadesPorClienteUseCase", async () => {
    const repo = new FakeContratoRepository();
    repo.listarPorCliente = () => Promise.reject(new Error("db error"));

    await expect(
      new ListarPropiedadesPorClienteUseCase(repo).ejecutar({ idCliente: "cliente-001" }),
    ).rejects.toThrow("db error");
  });

  test("captura ErrorDeDominio como resultadoFallido en RegistrarLeadUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.guardarLead = () => Promise.reject(new ErrorDeDominio("error dominio"));

    const resultado = await new RegistrarLeadUseCase(
      repo,
      new SecuenciaGeneradorId(["lead-001"]),
      new FakeEvaluadorAsignacion(),
    ).ejecutar({
      nombre: "test",
      email: "test@example.com",
      telefono: "300000000",
      tipo: "COMPRA",
      idAsesor: "asesor-1",
    });

    expect(resultado.esExito).toBe(false);
  });

  test("captura ErrorDeDominio como resultadoFallido en AgendarCitaUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.obtenerLeadPorId = () => Promise.reject(new ErrorDeDominio("error dominio"));

    const resultado = await new AgendarCitaUseCase(
      repo,
      new SecuenciaGeneradorId(["cita-001"]),
    ).ejecutar({
      idLead: "lead-001",
      fechaInicio: new Date(),
      duracionMinutos: 60,
    });

    expect(resultado.esExito).toBe(false);
  });

  test("captura ErrorDeDominio como resultadoFallido en ActualizarLeadUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.obtenerLeadPorId = () => Promise.reject(new ErrorDeDominio("error dominio"));

    const resultado = await new ActualizarLeadUseCase(repo).ejecutar({
      id: "lead-001",
      nombre: "test",
    });

    expect(resultado.esExito).toBe(false);
  });

  test("captura ErrorDeDominio como resultadoFallido en ConvertirLeadAClienteUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.obtenerLeadPorId = () => Promise.reject(new ErrorDeDominio("error dominio"));

    const resultado = await new ConvertirLeadAClienteUseCase(
      repo,
      new SecuenciaGeneradorId(["cli-001"]),
    ).ejecutar({ idLead: "lead-001" });

    expect(resultado.esExito).toBe(false);
  });

  test("captura ErrorDeDominio como resultadoFallido en ActualizarClienteUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.obtenerClientePorId = () => Promise.reject(new ErrorDeDominio("error dominio"));

    const resultado = await new ActualizarClienteUseCase(repo).ejecutar({
      idCliente: "cliente-001",
      nombre: "test",
    });

    expect(resultado.esExito).toBe(false);
  });

  test("captura ErrorDeDominio como resultadoFallido en AsignarLeadAAsesorUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.obtenerLeadPorId = () => Promise.reject(new ErrorDeDominio("error dominio"));

    const resultado = await new AsignarLeadAAsesorUseCase(repo).ejecutar({
      idLead: "lead-001",
      idAsesor: "asesor-2",
    });

    expect(resultado.esExito).toBe(false);
  });

  test("captura ErrorDeDominio como resultadoFallido en FirmarContratoUseCase", async () => {
    const repo = new FakeContratoRepository();
    repo.buscarPorId = () => Promise.reject(new ErrorDeDominio("error dominio"));

    const resultado = await new FirmarContratoUseCase(repo).ejecutar({ idContrato: "cont-001" });

    expect(resultado.esExito).toBe(false);
  });

  test("captura ErrorDeDominio como resultadoFallido en CrearContratoUseCase", async () => {
    const repo = new FakeContratoRepository();
    repo.guardar = () => Promise.reject(new ErrorDeDominio("error dominio"));

    const resultado = await new CrearContratoUseCase(repo).ejecutar({
      id: "cont-001",
      idCliente: "cliente-001",
      idPropiedad: "prop-001",
      fechaInicio: new Date(),
      fechaFin: new Date("2027-01-01"),
    });

    expect(resultado.esExito).toBe(false);
  });

  test("captura ErrorDeDominio como resultadoFallido en ObtenerLeadUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.obtenerLeadPorId = () => Promise.reject(new ErrorDeDominio("error dominio"));

    const resultado = await new ObtenerLeadUseCase(repo).ejecutar({ id: "lead-001" });

    expect(resultado.esExito).toBe(false);
  });

  test("captura ErrorDeDominio como resultadoFallido en ObtenerClienteUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.obtenerClientePorId = () => Promise.reject(new ErrorDeDominio("error dominio"));

    const resultado = await new ObtenerClienteUseCase(repo).ejecutar({ id: "cliente-001" });

    expect(resultado.esExito).toBe(false);
  });

  test("captura ErrorDeDominio como resultadoFallido en ListarLeadsUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.listarLeads = () => Promise.reject(new ErrorDeDominio("error dominio"));

    const resultado = await new ListarLeadsUseCase(repo, new AutorizadorVentasAdapter()).ejecutar({
      idUsuarioEjecutor: "admin",
      rolEjecutor: "ADMIN",
    });

    expect(resultado.esExito).toBe(false);
  });

  test("captura ErrorDeDominio como resultadoFallido en ListarClientesUseCase", async () => {
    const repo = new FakeVentasRepository();
    repo.listarClientes = () => Promise.reject(new ErrorDeDominio("error dominio"));

    const resultado = await new ListarClientesUseCase(repo).ejecutar();

    expect(resultado.esExito).toBe(false);
  });
});
