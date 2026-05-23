import { describe, expect, test } from "bun:test";

import {
  ActualizarPropiedadUseCase,
  CrearPropiedadUseCase,
  EliminarPropiedadUseCase,
  ListarPropiedadesUseCase,
} from "../../../src/lib/propiedades/application/use-cases";
import { Propiedad } from "../../../src/lib/propiedades/domain/entities/Propiedad";
import {
  type IConsultaRelacionPropiedad,
  type IPropiedadRepository,
  type RelacionPropiedad,
} from "../../../src/lib/propiedades/domain/ports";
import { type IdPropiedad } from "../../../src/lib/propiedades/domain/value-objects";
import { PropiedadError } from "../../../src/lib/propiedades/domain/errors/PropiedadError";
import { ErrorDeDominio } from "../../../src/lib/shared/domain/errors/ErrorDeDominio";
import { type IGeneradorId } from "../../../src/lib/shared/domain/ports/IGeneradorId";
import { AutorizadorPropiedadesAdapter } from "../../../src/lib/propiedades/infrastructure/security/AutorizadorPropiedadesAdapter";

class GeneradorIdFijo implements IGeneradorId {
  constructor(private readonly id: string) {}

  generar(): string {
    return this.id;
  }
}

class FakePropiedadRepository implements IPropiedadRepository {
  readonly propiedades = new Map<string, Propiedad>();

  async obtenerPorId(id: IdPropiedad): Promise<Propiedad | null> {
    return this.propiedades.get(id) ?? null;
  }

  async existePorId(id: IdPropiedad): Promise<boolean> {
    return this.propiedades.has(id);
  }

  async guardar(propiedad: Propiedad): Promise<void> {
    this.propiedades.set(propiedad.id as string, propiedad);
  }

  async eliminarPorId(id: IdPropiedad): Promise<void> {
    this.propiedades.delete(id);
  }

  async listarTodas(): Promise<Propiedad[]> {
    return [...this.propiedades.values()];
  }
}

class FakeConsultaRelacionPropiedad implements IConsultaRelacionPropiedad {
  constructor(
    private readonly leadsPorAsesor = new Map<string, string>(),
    private readonly clientesPorAsesor = new Map<string, string>(),
  ) {}

  async asesorGestionaPropiedad(idAsesor: string, relacion: RelacionPropiedad): Promise<boolean> {
    return (
      (relacion.idLeadOrigen !== undefined &&
        this.leadsPorAsesor.get(relacion.idLeadOrigen) === idAsesor) ||
      (relacion.idClientePropietario !== undefined &&
        this.clientesPorAsesor.get(relacion.idClientePropietario) === idAsesor)
    );
  }
}

describe("propiedades / use cases", () => {
  test("solo admin crea propiedades del inventario", async () => {
    const repo = new FakePropiedadRepository();
    const autorizador = new AutorizadorPropiedadesAdapter();

    const asesor = await new CrearPropiedadUseCase(
      repo,
      new GeneradorIdFijo("prop-001"),
      autorizador,
      new FakeConsultaRelacionPropiedad(),
    ).ejecutar({
      titulo: "Casa central",
      descripcion: "Casa lista para publicar",
      precio: 250000,
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    const admin = await new CrearPropiedadUseCase(
      repo,
      new GeneradorIdFijo("prop-001"),
      autorizador,
      new FakeConsultaRelacionPropiedad(),
    ).ejecutar({
      titulo: "Casa central",
      descripcion: "Casa lista para publicar",
      precio: 250000,
      origen: "ALVAS",
      estado: "DISPONIBLE",
      asesorResponsableId: "asesor-1",
      usuarioAutenticado: { id: "admin-1", rol: "ADMIN" },
    });

    expect(asesor.esExito).toBe(false);
    expect(asesor.esExito ? undefined : asesor.error.message).toBe(
      "No tienes permisos para crear esta propiedad.",
    );
    expect(asesor.esExito ? undefined : asesor.error.codigo).toBe("SIN_PERMISOS");
    expect(admin.esExito).toBe(true);
    expect(repo.propiedades.get("prop-001")?.asesorResponsableId as string).toBe("asesor-1");
  });

  test("asesor crea propiedad preliminar para un lead vendedor suyo", async () => {
    const repo = new FakePropiedadRepository();

    const resultado = await new CrearPropiedadUseCase(
      repo,
      new GeneradorIdFijo("prop-002"),
      new AutorizadorPropiedadesAdapter(),
      new FakeConsultaRelacionPropiedad(new Map([["lead-001", "asesor-1"]])),
    ).ejecutar({
      titulo: "Lote por captar",
      descripcion: "Propiedad adicional del lead vendedor",
      precio: 0,
      origen: "CAPTACION",
      estado: "PRELIMINAR",
      idLeadOrigen: "lead-001",
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    expect(resultado.esExito).toBe(true);
    expect(repo.propiedades.get("prop-002")?.idLeadOrigen).toBe("lead-001");
  });

  test("asesor crea propiedad para un cliente suyo", async () => {
    const repo = new FakePropiedadRepository();

    const resultado = await new CrearPropiedadUseCase(
      repo,
      new GeneradorIdFijo("prop-003"),
      new AutorizadorPropiedadesAdapter(),
      new FakeConsultaRelacionPropiedad(undefined, new Map([["cliente-001", "asesor-1"]])),
    ).ejecutar({
      titulo: "Casa cliente",
      descripcion: "Propiedad agregada por asesor",
      precio: 450000,
      origen: "CLIENTE",
      estado: "EN_VALIDACION",
      idClientePropietario: "cliente-001",
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    expect(resultado.esExito).toBe(true);
    expect(repo.propiedades.get("prop-003")?.idClientePropietario).toBe("cliente-001");
  });

  test("asesor no crea propiedades sin relacion propia", async () => {
    const repo = new FakePropiedadRepository();

    const sinRelacion = await new CrearPropiedadUseCase(
      repo,
      new GeneradorIdFijo("prop-004"),
      new AutorizadorPropiedadesAdapter(),
      new FakeConsultaRelacionPropiedad(),
    ).ejecutar({
      titulo: "Inventario libre",
      descripcion: "Sin lead ni cliente",
      precio: 250000,
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    const relacionAjena = await new CrearPropiedadUseCase(
      repo,
      new GeneradorIdFijo("prop-005"),
      new AutorizadorPropiedadesAdapter(),
      new FakeConsultaRelacionPropiedad(new Map([["lead-002", "asesor-2"]])),
    ).ejecutar({
      titulo: "Lead ajeno",
      descripcion: "No debe crear",
      precio: 250000,
      idLeadOrigen: "lead-002",
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    expect(sinRelacion.esExito).toBe(false);
    expect(sinRelacion.esExito ? undefined : sinRelacion.error.message).toBe(
      "No tienes permisos para crear esta propiedad.",
    );
    expect(sinRelacion.esExito ? undefined : sinRelacion.error.codigo).toBe("SIN_PERMISOS");
    expect(relacionAjena.esExito).toBe(false);
    expect(relacionAjena.esExito ? undefined : relacionAjena.error.message).toBe(
      "No tienes permisos para crear esta propiedad.",
    );
    expect(relacionAjena.esExito ? undefined : relacionAjena.error.codigo).toBe("SIN_PERMISOS");
    expect(repo.propiedades.size).toBe(0);
  });

  test("asesor puede listar inventario completo", async () => {
    const repo = new FakePropiedadRepository();
    await repo.guardar(
      Propiedad.crear({
        id: "prop-001",
        titulo: "Casa central",
        descripcion: "Casa lista",
        precio: 250000,
        origen: "ALVAS",
        estado: "DISPONIBLE",
      }),
    );

    const resultado = await new ListarPropiedadesUseCase(
      repo,
      new AutorizadorPropiedadesAdapter(),
    ).ejecutar({
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    expect(resultado.esExito).toBe(true);
    expect(resultado.esExito ? resultado.valor : []).toHaveLength(1);
  });

  test("asesor puede actualizar propiedad originada en su lead vendedor", async () => {
    const repo = new FakePropiedadRepository();
    await repo.guardar(
      Propiedad.crear({
        id: "prop-001",
        titulo: "Casa sin validar",
        descripcion: "Captacion inicial",
        precio: 0,
        origen: "CAPTACION",
        estado: "PRELIMINAR",
        idLeadOrigen: "lead-001",
      }),
    );

    const resultado = await new ActualizarPropiedadUseCase(
      repo,
      new AutorizadorPropiedadesAdapter(),
      new FakeConsultaRelacionPropiedad(new Map([["lead-001", "asesor-1"]])),
    ).ejecutar({
      idPropiedad: "prop-001",
      precio: 310000,
      estado: "EN_VALIDACION",
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    expect(resultado.esExito).toBe(true);
    expect(repo.propiedades.get("prop-001")?.precio).toBe(310000);
    expect(repo.propiedades.get("prop-001")?.estado.valor).toBe("EN_VALIDACION");
  });

  test("asesor puede actualizar propiedad de un cliente suyo", async () => {
    const repo = new FakePropiedadRepository();
    await repo.guardar(
      Propiedad.crear({
        id: "prop-002",
        titulo: "Apartamento cliente",
        descripcion: "Propiedad de cliente existente",
        precio: 420000,
        origen: "CLIENTE",
        estado: "EN_VALIDACION",
        idClientePropietario: "cliente-001",
      }),
    );

    const resultado = await new ActualizarPropiedadUseCase(
      repo,
      new AutorizadorPropiedadesAdapter(),
      new FakeConsultaRelacionPropiedad(undefined, new Map([["cliente-001", "asesor-1"]])),
    ).ejecutar({
      idPropiedad: "prop-002",
      descripcion: "Propiedad validada con documentos",
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    expect(resultado.esExito).toBe(true);
    expect(repo.propiedades.get("prop-002")?.descripcion).toBe("Propiedad validada con documentos");
  });

  test("asesor no actualiza propiedades de leads o clientes ajenos", async () => {
    const repo = new FakePropiedadRepository();
    await repo.guardar(
      Propiedad.crear({
        id: "prop-003",
        titulo: "Casa ajena",
        descripcion: "Captacion de otro asesor",
        precio: 300000,
        origen: "CAPTACION",
        estado: "PRELIMINAR",
        idLeadOrigen: "lead-002",
      }),
    );

    const resultado = await new ActualizarPropiedadUseCase(
      repo,
      new AutorizadorPropiedadesAdapter(),
      new FakeConsultaRelacionPropiedad(new Map([["lead-002", "asesor-2"]])),
    ).ejecutar({
      idPropiedad: "prop-003",
      precio: 315000,
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    expect(resultado.esExito).toBe(false);
    expect(resultado.esExito ? undefined : resultado.error.message).toBe(
      "No tienes permisos para editar esta propiedad.",
    );
    expect(resultado.esExito ? undefined : resultado.error.codigo).toBe("SIN_PERMISOS");
    expect(repo.propiedades.get("prop-003")?.precio).toBe(300000);
  });

  test("admin actualiza cualquier propiedad aunque no tenga relacion comercial", async () => {
    const repo = new FakePropiedadRepository();
    await repo.guardar(
      Propiedad.crear({
        id: "prop-004",
        titulo: "Inventario Alvas",
        descripcion: "Propiedad propia",
        precio: 500000,
        origen: "ALVAS",
        estado: "DISPONIBLE",
      }),
    );

    const resultado = await new ActualizarPropiedadUseCase(
      repo,
      new AutorizadorPropiedadesAdapter(),
      new FakeConsultaRelacionPropiedad(),
    ).ejecutar({
      idPropiedad: "prop-004",
      precio: 520000,
      usuarioAutenticado: { id: "admin-1", rol: "ADMIN" },
    });

    expect(resultado.esExito).toBe(true);
    expect(repo.propiedades.get("prop-004")?.precio).toBe(520000);
  });

  test("EliminarPropiedadUseCase elimina solo con permisos de admin", async () => {
    const repo = new FakePropiedadRepository();
    await repo.guardar(
      Propiedad.crear({
        id: "prop-005",
        titulo: "Casa a retirar",
        descripcion: "Inventario duplicado",
        precio: 500000,
        origen: "ALVAS",
        estado: "DISPONIBLE",
      }),
    );
    const useCase = new EliminarPropiedadUseCase(repo, new AutorizadorPropiedadesAdapter());

    const asesor = await useCase.ejecutar({
      idPropiedad: "prop-005",
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });
    expect(asesor.esExito).toBe(false);
    expect(asesor.esExito ? undefined : asesor.error.message).toBe(
      "No tienes permisos para gestionar propiedades.",
    );
    expect(asesor.esExito ? undefined : asesor.error.codigo).toBe("SIN_PERMISOS");
    expect(repo.propiedades.has("prop-005")).toBe(true);

    const admin = await useCase.ejecutar({
      idPropiedad: "prop-005",
      usuarioAutenticado: { id: "admin-1", rol: "ADMIN" },
    });

    expect(admin.esExito).toBe(true);
    expect(repo.propiedades.has("prop-005")).toBe(false);
  });

  test("EliminarPropiedadUseCase rechaza propiedades inexistentes", async () => {
    const repo = new FakePropiedadRepository();

    const resultado = await new EliminarPropiedadUseCase(
      repo,
      new AutorizadorPropiedadesAdapter(),
    ).ejecutar({
      idPropiedad: "prop-no-existe",
      usuarioAutenticado: { id: "admin-1", rol: "ADMIN" },
    });

    expect(resultado.esExito).toBe(false);
    expect(resultado.esExito ? undefined : resultado.error.message).toBe(
      "Propiedad no encontrada.",
    );
    expect(resultado.esExito ? undefined : resultado.error.codigo).toBe("NO_ENCONTRADA");
  });

  test("ListarPropiedadesUseCase rechaza rol sin permisos", async () => {
    const repo = new FakePropiedadRepository();

    const resultado = await new ListarPropiedadesUseCase(
      repo,
      new AutorizadorPropiedadesAdapter(),
    ).ejecutar({
      usuarioAutenticado: { id: "invitado-1", rol: "INVITADO" },
    });

    expect(resultado.esExito).toBe(false);
    expect(resultado.esExito ? undefined : resultado.error.message).toBe(
      "No tienes permisos para ver propiedades.",
    );
    expect(resultado.esExito ? undefined : resultado.error.codigo).toBe("ROL_NO_PERMITIDO");
  });

  test("propaga errores no dominio en CrearPropiedadUseCase", async () => {
    const repo = new FakePropiedadRepository();
    repo.guardar = () => Promise.reject(new Error("db error"));

    await expect(
      new CrearPropiedadUseCase(
        repo,
        new GeneradorIdFijo("new-001"),
        new AutorizadorPropiedadesAdapter(),
        new FakeConsultaRelacionPropiedad(),
      ).ejecutar({
        titulo: "Test",
        descripcion: "Test",
        precio: 100,
        origen: "ALVAS",
        usuarioAutenticado: { id: "admin-1", rol: "ADMIN" },
      }),
    ).rejects.toThrow("db error");
  });

  test("propaga errores no dominio en ActualizarPropiedadUseCase", async () => {
    const repo = new FakePropiedadRepository();
    await repo.guardar(
      Propiedad.crear({
        id: "prop-001",
        titulo: "Test",
        descripcion: "Test",
        precio: 100,
        origen: "ALVAS",
      }),
    );
    repo.guardar = () => Promise.reject(new Error("db error"));

    await expect(
      new ActualizarPropiedadUseCase(
        repo,
        new AutorizadorPropiedadesAdapter(),
        new FakeConsultaRelacionPropiedad(),
      ).ejecutar({
        idPropiedad: "prop-001",
        titulo: "Nuevo",
        usuarioAutenticado: { id: "admin-1", rol: "ADMIN" },
      }),
    ).rejects.toThrow("db error");
  });

  test("propaga errores no dominio en ListarPropiedadesUseCase", async () => {
    const repo = new FakePropiedadRepository();
    repo.listarTodas = () => Promise.reject(new Error("db error"));

    await expect(
      new ListarPropiedadesUseCase(repo, new AutorizadorPropiedadesAdapter()).ejecutar({
        usuarioAutenticado: { id: "admin-1", rol: "ADMIN" },
      }),
    ).rejects.toThrow("db error");
  });

  test("captura PropiedadError como resultadoFallido en CrearPropiedadUseCase", async () => {
    const repo = new FakePropiedadRepository();
    repo.guardar = () => Promise.reject(new PropiedadError("error dominio", "ERROR"));

    const resultado = await new CrearPropiedadUseCase(
      repo,
      new GeneradorIdFijo("new-001"),
      new AutorizadorPropiedadesAdapter(),
      new FakeConsultaRelacionPropiedad(),
    ).ejecutar({
      titulo: "Test",
      descripcion: "Test",
      precio: 100,
      origen: "ALVAS",
      usuarioAutenticado: { id: "admin-1", rol: "ADMIN" },
    });

    expect(resultado.esExito).toBe(false);
  });

  test("captura PropiedadError como resultadoFallido en ActualizarPropiedadUseCase", async () => {
    const repo = new FakePropiedadRepository();
    await repo.guardar(
      Propiedad.crear({
        id: "prop-001",
        titulo: "Test",
        descripcion: "Test",
        precio: 100,
        origen: "ALVAS",
      }),
    );
    repo.guardar = () => Promise.reject(new PropiedadError("error dominio", "ERROR"));

    const resultado = await new ActualizarPropiedadUseCase(
      repo,
      new AutorizadorPropiedadesAdapter(),
      new FakeConsultaRelacionPropiedad(),
    ).ejecutar({
      idPropiedad: "prop-001",
      titulo: "Nuevo",
      usuarioAutenticado: { id: "admin-1", rol: "ADMIN" },
    });

    expect(resultado.esExito).toBe(false);
  });

  test("propaga errores no dominio en EliminarPropiedadUseCase", async () => {
    const repo = new FakePropiedadRepository();
    await repo.guardar(
      Propiedad.crear({
        id: "prop-005",
        titulo: "Test",
        descripcion: "Test",
        precio: 100,
        origen: "ALVAS",
      }),
    );
    repo.eliminarPorId = () => Promise.reject(new Error("db error"));

    await expect(
      new EliminarPropiedadUseCase(repo, new AutorizadorPropiedadesAdapter()).ejecutar({
        idPropiedad: "prop-005",
        usuarioAutenticado: { id: "admin-1", rol: "ADMIN" },
      }),
    ).rejects.toThrow("db error");
  });

  test("captura PropiedadError como resultadoFallido en EliminarPropiedadUseCase", async () => {
    const repo = new FakePropiedadRepository();
    await repo.guardar(
      Propiedad.crear({
        id: "prop-005",
        titulo: "Test",
        descripcion: "Test",
        precio: 100,
        origen: "ALVAS",
      }),
    );
    repo.existePorId = () => Promise.reject(new PropiedadError("error dominio", "ERROR"));

    const resultado = await new EliminarPropiedadUseCase(
      repo,
      new AutorizadorPropiedadesAdapter(),
    ).ejecutar({
      idPropiedad: "prop-005",
      usuarioAutenticado: { id: "admin-1", rol: "ADMIN" },
    });

    expect(resultado.esExito).toBe(false);
  });

  test("captura ErrorDeDominio como resultadoFallido en ListarPropiedadesUseCase", async () => {
    const repo = new FakePropiedadRepository();
    repo.listarTodas = () => Promise.reject(new ErrorDeDominio("error dominio"));

    const resultado = await new ListarPropiedadesUseCase(
      repo,
      new AutorizadorPropiedadesAdapter(),
    ).ejecutar({
      usuarioAutenticado: { id: "admin-1", rol: "ADMIN" },
    });

    expect(resultado.esExito).toBe(false);
  });
});
