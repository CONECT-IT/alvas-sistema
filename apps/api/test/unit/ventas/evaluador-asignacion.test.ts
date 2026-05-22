import { describe, expect, test } from "bun:test";

import { idUsuarioRef } from "../../../src/lib/shared/domain/value-objects/IdUsuarioRef";
import { EvaluadorAsignacionService } from "../../../src/lib/ventas/domain/services/EvaluadorAsignacion";
import { ErrorDeDominio } from "../../../src/lib/shared/domain/errors/ErrorDeDominio";

describe("ventas / EvaluadorAsignacionService", () => {
  test("elige el asesor con menor carga de leads", () => {
    const evaluador = new EvaluadorAsignacionService();
    const resultado = evaluador.evaluar([
      { idAsesor: "asesor-1", totalLeads: 8 },
      { idAsesor: "asesor-2", totalLeads: 2 },
      { idAsesor: "asesor-3", totalLeads: 4 },
    ]);

    expect(resultado.esExito).toBe(true);
    if (resultado.esExito) {
      expect(resultado.valor).toBe(idUsuarioRef("asesor-2"));
    }
  });

  test("falla si no hay asesores disponibles", () => {
    const resultado = new EvaluadorAsignacionService().evaluar([]);

    expect(resultado.esExito).toBe(false);
    expect(resultado.esExito ? undefined : resultado.error.message).toBe(
      "No hay asesores disponibles para asignación.",
    );
  });

  test("propaga errores no dominico durante evaluacion", () => {
    const evaluador = new EvaluadorAsignacionService();
    const stats = [
      { idAsesor: "asesor-1", totalLeads: 5 },
      {
        idAsesor: "throw-1",
        get totalLeads(): number {
          throw new Error("db error");
        },
      },
    ] as { idAsesor: string; totalLeads: number }[];

    expect(() => evaluador.evaluar(stats)).toThrow("db error");
  });

  test("captura ErrorDeDominio durante evaluacion", () => {
    const evaluador = new EvaluadorAsignacionService();
    const stats = [
      { idAsesor: "asesor-1", totalLeads: 5 },
      {
        idAsesor: "throw-1",
        get totalLeads(): number {
          throw new ErrorDeDominio("error dominio");
        },
      },
    ] as { idAsesor: string; totalLeads: number }[];

    const resultado = evaluador.evaluar(stats);

    expect(resultado.esExito).toBe(false);
  });
});
