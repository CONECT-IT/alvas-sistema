import { describe, expect, test } from "bun:test";

import { Cita } from "../../../src/lib/ventas/domain/entities/Cita";
import { idCita, idLead } from "../../../src/lib/ventas/domain/value-objects/Ids";

describe("ventas / Cita", () => {
  const fechaInicio = new Date("2026-06-01T10:00:00.000Z");
  const crearCita = () =>
    Cita.crear({
      id: idCita("cita-001"),
      idLead: idLead("lead-001"),
      idPropiedad: "prop-001",
      fechaInicio,
      fechaFin: new Date("2026-06-01T11:00:00.000Z"),
      observacion: "Visita inicial",
    });

  test("expone los datos base de la cita", () => {
    const cita = crearCita();

    expect(cita.id).toBe(idCita("cita-001"));
    expect(cita.idLead).toBe(idLead("lead-001"));
    expect(cita.idPropiedad).toBe("prop-001");
    expect(cita.fechaInicio).toEqual(fechaInicio);
    expect(cita.fechaFin).toEqual(new Date("2026-06-01T11:00:00.000Z"));
    expect(cita.estado.esPendiente()).toBe(true);
    expect(cita.observacion).toBe("Visita inicial");
  });

  test("protege fechas y cambios invalidos", () => {
    const cita = crearCita();

    cita.marcarComoRealizada();

    expect(cita.estado.esRealizada()).toBe(true);
    expect(() => cita.reprogramar(fechaInicio, 30)).toThrow(
      "No se puede reprogramar una cita ya realizada.",
    );
    expect(() =>
      Cita.crear({
        id: idCita("cita-002"),
        idLead: idLead("lead-001"),
        fechaInicio,
        fechaFin: fechaInicio,
      }),
    ).toThrow("La fecha de fin debe ser posterior a la fecha de inicio.");
  });

  test("cancela con motivo y evita marcar como realizada una cita cancelada", () => {
    const cita = crearCita();
    const citaSinObservacion = Cita.crear({
      id: idCita("cita-004"),
      idLead: idLead("lead-001"),
      fechaInicio,
      fechaFin: new Date("2026-06-01T11:00:00.000Z"),
    });

    cita.cancelar("Cliente no disponible");
    expect(cita.estado.esCancelada()).toBe(true);
    expect(cita.observacion).toContain("Cancelado: Cliente no disponible");

    citaSinObservacion.cancelar();
    expect(citaSinObservacion.estado.esCancelada()).toBe(true);

    expect(() => cita.marcarComoRealizada()).toThrow(
      "No se puede marcar como realizada una cita cancelada.",
    );
  });

  test("reprograma correctamente la cita a futuro y actualiza observacion", () => {
    const cita = crearCita();
    const nuevaFecha = new Date("2026-06-15T14:00:00.000Z");
    const nuevaDuracion = 45;

    cita.reprogramar(nuevaFecha, nuevaDuracion, "Cliente pidio reprogramar");

    expect(cita.fechaInicio).toEqual(nuevaFecha);
    expect(cita.fechaFin).toEqual(new Date("2026-06-15T14:45:00.000Z"));
    expect(cita.estado.esReprogramada()).toBe(true);
    expect(cita.observacion).toContain("Cliente pidio reprogramar");
  });

  test("valida duracion positiva al reprogramar", () => {
    const cita = crearCita();
    expect(() => cita.reprogramar(new Date(), 0)).toThrow(
      "La duracion de la cita debe ser mayor que cero.",
    );
  });

  test("actualiza observacion sin cambiar estado", () => {
    const cita = crearCita();
    cita.actualizarObservacion("Nueva observacion");
    expect(cita.observacion).toBe("Nueva observacion");
    expect(cita.estado.esPendiente()).toBe(true);
  });

  test("actualiza propiedad asociada", () => {
    const cita = crearCita();
    cita.actualizarPropiedad("prop-002");
    expect(cita.idPropiedad).toBe("prop-002");
  });

  test("cambia estado usando el metodo generico cambiarEstado", () => {
    const cita = crearCita();
    cita.cambiarEstado("REALIZADA");
    expect(cita.estado.esRealizada()).toBe(true);

    cita.cambiarEstado("REPROGRAMADA");
    expect(cita.estado.esReprogramada()).toBe(true);

    cita.cambiarEstado("PENDIENTE");
    expect(cita.estado.esPendiente()).toBe(true);

    cita.cambiarEstado("CANCELADA", "Cancelado por sistema");
    expect(cita.estado.esCancelada()).toBe(true);
  });
});
