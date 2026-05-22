import { Given, When, Then } from "@cucumber/cucumber";
import * as assert from "assert";

import { CrearPropiedadUseCase } from "../../../../src/lib/propiedades/application/use-cases/CrearPropiedadUseCase";
import { ActualizarPropiedadUseCase } from "../../../../src/lib/propiedades/application/use-cases/ActualizarPropiedadUseCase";
import { Propiedad } from "../../../../src/lib/propiedades/domain/entities/Propiedad";
import {
  type IPropiedadRepository,
  type IConsultaRelacionPropiedad,
  type RelacionPropiedad,
} from "../../../../src/lib/propiedades/domain/ports";
import {
  type IdPropiedad,
  idPropiedad,
} from "../../../../src/lib/propiedades/domain/value-objects";
import { type IGeneradorId } from "../../../../src/lib/shared/domain/ports/IGeneradorId";
import { AutorizadorPropiedadesAdapter } from "../../../../src/lib/propiedades/infrastructure/security/AutorizadorPropiedadesAdapter";

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
  constructor(private readonly leadsPorAsesor = new Map<string, string>()) {}

  async asesorGestionaPropiedad(_idAsesor: string, relacion: RelacionPropiedad): Promise<boolean> {
    if (relacion.idLeadOrigen !== undefined) {
      return this.leadsPorAsesor.get(relacion.idLeadOrigen) === _idAsesor;
    }
    return false;
  }
}

class GeneradorIdFijo implements IGeneradorId {
  constructor(private readonly id: string) {}

  generar(): string {
    return this.id;
  }
}

let repository: FakePropiedadRepository;
let consultaRelacion: FakeConsultaRelacionPropiedad;
let autorizador: AutorizadorPropiedadesAdapter;
let useCaseCrear: CrearPropiedadUseCase;
let resultadoCrear: Awaited<ReturnType<CrearPropiedadUseCase["ejecutar"]>>;
let resultadoActualizar: Awaited<ReturnType<ActualizarPropiedadUseCase["ejecutar"]>>;

Given("un administrador autenticado en propiedades", function () {
  repository = new FakePropiedadRepository();
  consultaRelacion = new FakeConsultaRelacionPropiedad();
  autorizador = new AutorizadorPropiedadesAdapter();
});

Given("un asesor autenticado en propiedades", function () {
  repository = new FakePropiedadRepository();
  consultaRelacion = new FakeConsultaRelacionPropiedad();
  autorizador = new AutorizadorPropiedadesAdapter();
});

Given("un lead vendedor {string} pertenece al asesor", function (idLead: string) {
  consultaRelacion = new FakeConsultaRelacionPropiedad(new Map([[idLead, "asesor-1"]]));
});

Given("una propiedad existente {string} creada por el asesor", async function (id: string) {
  repository = new FakePropiedadRepository();
  const propiedad = Propiedad.crear({
    id,
    titulo: "Casa original",
    descripcion: "Captacion inicial",
    precio: 0,
    origen: "CAPTACION",
    estado: "PRELIMINAR",
    idLeadOrigen: "lead-001",
  });
  await repository.guardar(propiedad);
  consultaRelacion = new FakeConsultaRelacionPropiedad(new Map([["lead-001", "asesor-1"]]));
  autorizador = new AutorizadorPropiedadesAdapter();
});

When(
  "el admin crea una propiedad {string} con precio {int}",
  async function (titulo: string, precio: number) {
    useCaseCrear = new CrearPropiedadUseCase(
      repository,
      new GeneradorIdFijo("prop-001"),
      autorizador,
      consultaRelacion,
    );
    resultadoCrear = await useCaseCrear.ejecutar({
      titulo,
      descripcion: "Propiedad de inventario",
      precio,
      origen: "ALVAS",
      estado: "DISPONIBLE",
      usuarioAutenticado: { id: "admin-1", rol: "ADMIN" },
    });
  },
);

When(
  "el asesor crea una propiedad {string} para su lead {string}",
  async function (titulo: string, idLead: string) {
    useCaseCrear = new CrearPropiedadUseCase(
      repository,
      new GeneradorIdFijo("prop-002"),
      autorizador,
      consultaRelacion,
    );
    resultadoCrear = await useCaseCrear.ejecutar({
      titulo,
      descripcion: "Propiedad del lead",
      precio: 0,
      origen: "CAPTACION",
      estado: "PRELIMINAR",
      idLeadOrigen: idLead,
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });
  },
);

When(
  "el asesor actualiza el precio a {int} y estado {string}",
  async function (precio: number, estado: string) {
    resultadoActualizar = await new ActualizarPropiedadUseCase(
      repository,
      autorizador,
      consultaRelacion,
    ).ejecutar({
      idPropiedad: "prop-001",
      precio,
      estado,
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });
  },
);

Then(
  "la propiedad se guarda con origen {string} y estado {string}",
  function (origen: string, estado: string) {
    assert.strictEqual(resultadoCrear.esExito, true);
    if (resultadoCrear.esExito) {
      assert.strictEqual(resultadoCrear.valor.origen, origen);
      assert.strictEqual(resultadoCrear.valor.estado, estado);
    }
  },
);

Then("la propiedad refleja el nuevo precio y estado", async function () {
  assert.strictEqual(resultadoActualizar.esExito, true);
  const propiedad = await repository.obtenerPorId(idPropiedad("prop-001"));
  assert.strictEqual(propiedad?.precio, 310000);
  assert.strictEqual(propiedad?.estado, "EN_VALIDACION");
});
