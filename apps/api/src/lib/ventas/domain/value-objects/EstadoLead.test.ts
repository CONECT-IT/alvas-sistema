import { describe, expect, test } from "bun:test";
import { EstadoLead, ESTADOS_LEAD } from "./EstadoLead";
import { ErrorDeValidacion } from "../../../shared/domain";

describe("Value Object: EstadoLead SDD", () => {
  test("Debe crear estados validos via factory desde() normalizando mayusculas y espacios", () => {
    for (const valor of ESTADOS_LEAD) {
      expect(EstadoLead.desde(valor.toLowerCase()).valor).toBe(valor);
      expect(EstadoLead.desde(`  ${valor}  `).valor).toBe(valor);
    }
  });

  test("Debe lanzar ErrorDeValidacion si el estado es invalido", () => {
    expect(() => {
      EstadoLead.desde("INVENTADO");
    }).toThrow(ErrorDeValidacion);
    expect(() => {
      EstadoLead.desde(" NUEVO INVENTADO ");
    }).toThrow("Estado de lead inválido:  NUEVO INVENTADO ");
  });

  test("Debe identificar si un estado esta cerrado (CONVERTIDO o PERDIDO)", () => {
    expect(EstadoLead.convertido().estaCerrado()).toBe(true);
    expect(EstadoLead.perdido().estaCerrado()).toBe(true);

    expect(EstadoLead.nuevo().estaCerrado()).toBe(false);
    expect(EstadoLead.contacto().estaCerrado()).toBe(false);
    expect(EstadoLead.agendado().estaCerrado()).toBe(false);
    expect(EstadoLead.trabajando().estaCerrado()).toBe(false);
  });

  test("Debe identificar estados especificos con metodos semanticos", () => {
    expect(EstadoLead.nuevo().esNuevo()).toBe(true);
    expect(EstadoLead.contacto().esContacto()).toBe(true);
    expect(EstadoLead.agendado().esAgendado()).toBe(true);
    expect(EstadoLead.trabajando().esTrabajando()).toBe(true);
    expect(EstadoLead.convertido().esConvertido()).toBe(true);
    expect(EstadoLead.perdido().esPerdido()).toBe(true);
  });

  test("Debe retornar instancias correctas desde metodos factoria estaticos", () => {
    expect(EstadoLead.nuevo().valor).toBe("NUEVO");
    expect(EstadoLead.contacto().valor).toBe("CONTACTO");
    expect(EstadoLead.agendado().valor).toBe("AGENDADO");
    expect(EstadoLead.trabajando().valor).toBe("TRABAJANDO");
    expect(EstadoLead.convertido().valor).toBe("CONVERTIDO");
    expect(EstadoLead.perdido().valor).toBe("PERDIDO");
  });

  test("Un lead CONVERTIDO debe ser cerrado y convertido", () => {
    const estado = EstadoLead.convertido();
    expect(estado.esConvertido()).toBe(true);
    expect(estado.estaCerrado()).toBe(true);
    expect(estado.esPerdido()).toBe(false);
  });

  test("Un lead PERDIDO debe ser cerrado y perdido", () => {
    const estado = EstadoLead.perdido();
    expect(estado.esPerdido()).toBe(true);
    expect(estado.estaCerrado()).toBe(true);
    expect(estado.esConvertido()).toBe(false);
  });
});
