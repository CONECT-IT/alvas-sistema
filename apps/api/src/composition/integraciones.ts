import {
  ListarCaptacionesPendientesUseCase,
  ProcesarCaptacionEntranteUseCase,
  ProcesarWhatsAppWebhookUseCase,
} from "../lib/integraciones/application";
import {
  D1CaptacionPendienteRepository,
  type IntegracionesRouterDeps,
} from "../lib/integraciones/infrastructure";
import {
  D1PropiedadRepository,
  RegistroPropiedadCaptacionAdapter,
} from "../lib/propiedades/infrastructure";
import { UuidGeneradorId } from "../lib/shared/infrastructure/security/UuidGeneradorId";
import { RegistroLeadCaptacionVentasAdapter } from "../lib/ventas/infrastructure/adapters/RegistroLeadCaptacionVentasAdapter";
import { crearRegistrarLeadUseCase } from "./ventas";

export function crearIntegracionesRouterDeps(): IntegracionesRouterDeps {
  return {
    crearProcesarWhatsAppWebhook: (c) =>
      new ProcesarWhatsAppWebhookUseCase(
        new D1CaptacionPendienteRepository(c.env.DB),
        new UuidGeneradorId(),
      ),
    crearListarCaptacionesPendientes: (c) =>
      new ListarCaptacionesPendientesUseCase(new D1CaptacionPendienteRepository(c.env.DB)),
    crearProcesarCaptacionEntrante: (c) =>
      new ProcesarCaptacionEntranteUseCase(
        new RegistroLeadCaptacionVentasAdapter(crearRegistrarLeadUseCase(c.env.DB)),
        new RegistroPropiedadCaptacionAdapter(
          new D1PropiedadRepository(c.env.DB),
          new UuidGeneradorId(),
        ),
      ),
  };
}
