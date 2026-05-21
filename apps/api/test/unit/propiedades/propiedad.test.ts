import { describe, expect, test } from "bun:test";

import { Propiedad } from "../../../src/lib/propiedades/domain/entities/Propiedad";
import { PropiedadError } from "../../../src/lib/propiedades/domain/errors/PropiedadError";
import { idPropiedad, idUsuarioRef } from "../../../src/lib/propiedades/domain/value-objects";

describe("propiedades / Propiedad", () => {
  test("crea propiedades con datos base y fechas de auditoria", () => {
    const antes = Date.now();
    const propiedad = Propiedad.crear({
      id: "prop-001",
      titulo: "Casa central",
      descripcion: "Casa de dos pisos",
      precio: 250000,
      origen: "ALVAS",
      estado: "DISPONIBLE",
      asesorResponsableId: "asesor-001",
    });
    const despues = Date.now();

    expect(propiedad.id as string).toBe("prop-001");
    expect(propiedad.titulo).toBe("Casa central");
    expect(propiedad.descripcion).toBe("Casa de dos pisos");
    expect(propiedad.precio).toBe(250000);
    expect(propiedad.origen).toBe("ALVAS");
    expect(propiedad.estado).toBe("DISPONIBLE");
    expect(propiedad.asesorResponsableId as string).toBe("asesor-001");
    expect(propiedad.creadoEn.getTime()).toBeGreaterThanOrEqual(antes);
    expect(propiedad.creadoEn.getTime()).toBeLessThanOrEqual(despues);
    expect(propiedad.actualizadoEn).toBe(propiedad.creadoEn);
  });

  test("reconstituye propiedades existentes preservando fechas", () => {
    const creadoEn = new Date("2026-01-01T10:00:00.000Z");
    const actualizadoEn = new Date("2026-01-02T10:00:00.000Z");

    const propiedad = Propiedad.reconstituir({
      id: idPropiedad("prop-002"),
      titulo: "Apartamento norte",
      descripcion: "Apartamento con balcon",
      precio: 180000,
      origen: "CAPTACION",
      estado: "PRELIMINAR",
      idLeadOrigen: "lead-001",
      captadaPorAsesorId: idUsuarioRef("asesor-002"),
      creadoEn,
      actualizadoEn,
    });

    expect(propiedad.id as string).toBe("prop-002");
    expect(propiedad.titulo).toBe("Apartamento norte");
    expect(propiedad.descripcion).toBe("Apartamento con balcon");
    expect(propiedad.precio).toBe(180000);
    expect(propiedad.origen).toBe("CAPTACION");
    expect(propiedad.estado).toBe("PRELIMINAR");
    expect(propiedad.idLeadOrigen).toBe("lead-001");
    expect(propiedad.captadaPorAsesorId as string).toBe("asesor-002");
    expect(propiedad.creadoEn).toBe(creadoEn);
    expect(propiedad.actualizadoEn).toBe(actualizadoEn);
  });

  test("actualiza datos comerciales y relaciones de inventario", () => {
    const propiedad = Propiedad.crear({
      id: "prop-003",
      titulo: "Casa captada",
      descripcion: "Pendiente validacion",
      precio: 0,
      origen: "CAPTACION",
      estado: "PRELIMINAR",
      idLeadOrigen: "lead-002",
      captadaPorAsesorId: "asesor-001",
    });

    propiedad.actualizar({
      titulo: "Casa validada",
      descripcion: "Lista para publicar",
      precio: 300000,
      estado: "DISPONIBLE",
      idClientePropietario: "cliente-001",
      asesorResponsableId: "asesor-002",
    });

    expect(propiedad.titulo).toBe("Casa validada");
    expect(propiedad.descripcion).toBe("Lista para publicar");
    expect(propiedad.precio).toBe(300000);
    expect(propiedad.estado).toBe("DISPONIBLE");
    expect(propiedad.idClientePropietario).toBe("cliente-001");
    expect(propiedad.asesorResponsableId as string).toBe("asesor-002");
  });

  test("PropiedadError conserva codigo y contexto del modulo", () => {
    const error = new PropiedadError("No se puede publicar.", "PROPIEDAD_INVALIDA");

    expect(error.name).toBe("ErrorDeDominio");
    expect(error.message).toBe("No se puede publicar.");
    expect(error.codigo).toBe("PROPIEDAD_INVALIDA");
    expect(error.detalle).toEqual({ contexto: "PROPIEDADES" });
  });

  test("crear con origen por defecto ALVAS si no se especifica", () => {
    const propiedad = Propiedad.crear({
      id: "prop-def",
      titulo: "Default",
      descripcion: "Default",
      precio: 100,
      estado: "DISPONIBLE",
    });
    expect(propiedad.origen).toBe("ALVAS");
  });

  test("crear con estado por defecto si no se especifica", () => {
    const propiedad = Propiedad.crear({
      id: "prop-def2",
      titulo: "Default",
      descripcion: "Default",
      precio: 100,
      origen: "ALVAS",
    });
    expect(propiedad.estado).toBe("DISPONIBLE");
  });

  test("crear normaliza origen a mayusculas y trim", () => {
    const propiedad = Propiedad.crear({
      id: "prop-norm",
      titulo: "Test",
      descripcion: "Test",
      precio: 100,
      origen: " captacion ",
    });
    expect(propiedad.origen).toBe("CAPTACION");
  });

  test("crear lanza error con origen invalido", () => {
    expect(() =>
      Propiedad.crear({
        id: "prop-bad",
        titulo: "Test",
        descripcion: "Test",
        precio: 100,
        origen: "INEXISTENTE",
      }),
    ).toThrow("El origen de la propiedad no es valido.");
  });

  test("crear lanza error con estado invalido", () => {
    expect(() =>
      Propiedad.crear({
        id: "prop-bad2",
        titulo: "Test",
        descripcion: "Test",
        precio: 100,
        origen: "ALVAS",
        estado: "INEXISTENTE",
      }),
    ).toThrow("El estado de la propiedad no es valido.");
  });

  test("actualizar lanza error con titulo vacio", () => {
    const propiedad = Propiedad.crear({
      id: "prop-004",
      titulo: "Original",
      descripcion: "Original",
      precio: 100,
      origen: "ALVAS",
    });
    expect(() => propiedad.actualizar({ titulo: "  " })).toThrow(
      "El titulo de la propiedad es obligatorio.",
    );
  });

  test("actualizar lanza error con precio negativo", () => {
    const propiedad = Propiedad.crear({
      id: "prop-005",
      titulo: "Original",
      descripcion: "Original",
      precio: 100,
      origen: "ALVAS",
    });
    expect(() => propiedad.actualizar({ precio: -1 })).toThrow(
      "El precio de la propiedad no puede ser negativo.",
    );
  });

  test("actualizar normaliza estado y actualiza fecha", () => {
    const propiedad = Propiedad.crear({
      id: "prop-006",
      titulo: "Original",
      descripcion: "Original",
      precio: 100,
      origen: "ALVAS",
      estado: "PRELIMINAR",
    });
    const antes = Date.now();
    propiedad.actualizar({ estado: " disponible " });
    expect(propiedad.estado).toBe("DISPONIBLE");
    expect(propiedad.actualizadoEn.getTime()).toBeGreaterThanOrEqual(antes);
  });

  test("actualizar con undefined no modifica campos", () => {
    const propiedad = Propiedad.crear({
      id: "prop-007",
      titulo: "Fijo",
      descripcion: "Fijo",
      precio: 100,
      origen: "ALVAS",
      asesorResponsableId: "asesor-001",
    });
    propiedad.actualizar({});
    expect(propiedad.titulo).toBe("Fijo");
    expect(propiedad.asesorResponsableId as string).toBe("asesor-001");
  });

  test("actualizar con idClientePropietario undefined lo limpia", () => {
    const propiedad = Propiedad.crear({
      id: "prop-008",
      titulo: "Test",
      descripcion: "Test",
      precio: 100,
      origen: "ALVAS",
      idClientePropietario: "cli-001",
    });
    propiedad.actualizar({ idClientePropietario: "" });
    expect(propiedad.idClientePropietario).toBeUndefined();
  });
});
