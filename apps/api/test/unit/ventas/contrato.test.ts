import { describe, expect, test } from "bun:test";

import { Contrato } from "../../../src/lib/ventas/domain/entities/Contrato";
import {
  idLead,
  idCliente,
  idContrato,
  idPropiedad,
} from "../../../src/lib/ventas/domain/value-objects/Ids";
import { EstadoContrato } from "../../../src/lib/ventas/domain/value-objects/EstadoContrato";

describe("ventas / Contrato", () => {
  const fechaInicio = new Date("2026-06-01T00:00:00.000Z");
  const fechaFin = new Date("2027-06-01T00:00:00.000Z");
  const crearContrato = () =>
    Contrato.crear({
      id: idContrato("contrato-001"),
      idLead: idLead("lead-001"),
      idPropiedad: idPropiedad("propiedad-001"),
      fechaInicio,
      fechaFin,
    });

  test("inicia en borrador y solo se firma una vez", () => {
    const contrato = crearContrato();

    expect(contrato.id).toBe(idContrato("contrato-001"));
    expect(contrato.idLead).toBe(idLead("lead-001"));
    expect(contrato.idPropiedad).toBe(idPropiedad("propiedad-001"));
    expect(contrato.fechaInicio).toEqual(fechaInicio);
    expect(contrato.fechaFin).toEqual(fechaFin);
    expect(contrato.estado.valor).toBe("BORRADOR");
    expect(contrato.creadoEn).toBeInstanceOf(Date);
    expect(contrato.actualizadoEn).toBeInstanceOf(Date);

    contrato.firmar();

    expect(contrato.estado.valor).toBe("VIGENTE");
    expect(() => contrato.firmar()).toThrow("Solo se pueden firmar contratos en estado borrador.");
  });

  test("finaliza contratos y actualiza estado", () => {
    const contrato = crearContrato();

    contrato.finalizar();

    expect(contrato.estado.valor).toBe("FINALIZADO");
    expect(contrato.actualizadoEn).toBeInstanceOf(Date);
  });

  test("reconstituye contratos existentes", () => {
    const creadoEn = new Date("2026-05-01T00:00:00.000Z");
    const actualizadoEn = new Date("2026-05-02T00:00:00.000Z");
    const contrato = Contrato.reconstituir({
      id: idContrato("contrato-002"),
      idLead: idLead("lead-002"),
      idPropiedad: idPropiedad("propiedad-002"),
      fechaInicio,
      fechaFin,
      estado: EstadoContrato.vigente(),
      creadoEn,
      actualizadoEn,
    });

    expect(contrato.id).toBe(idContrato("contrato-002"));
    expect(contrato.idLead).toBe(idLead("lead-002"));
    expect(contrato.idPropiedad).toBe(idPropiedad("propiedad-002"));
    expect(contrato.estado.valor).toBe("VIGENTE");
    expect(contrato.creadoEn).toEqual(creadoEn);
    expect(contrato.actualizadoEn).toEqual(actualizadoEn);
  });

  test("asigna cliente al contrato", () => {
    const contrato = crearContrato();
    expect(contrato.idCliente).toBeUndefined();

    contrato.asignarCliente(idCliente("cliente-001"));
    expect(contrato.idCliente).toBe(idCliente("cliente-001"));
  });

  test("no permite asignar cliente si ya tiene uno", () => {
    const contrato = crearContrato();
    contrato.asignarCliente(idCliente("cliente-001"));
    expect(() => contrato.asignarCliente(idCliente("cliente-002"))).toThrow(
      "El contrato ya tiene un cliente asignado.",
    );
  });

  test("rechaza contratos con fechas invalidas", () => {
    expect(() =>
      Contrato.crear({
        id: idContrato("contrato-003"),
        idLead: idLead("lead-003"),
        idPropiedad: idPropiedad("propiedad-001"),
        fechaInicio,
        fechaFin: fechaInicio,
      }),
    ).toThrow("La fecha de fin debe ser posterior a la fecha de inicio.");
  });
});
