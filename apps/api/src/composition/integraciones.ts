import {
  ConvertirCaptacionPendienteUseCase,
  ListarCaptacionesPendientesUseCase,
  MarcarCaptacionDuplicadaUseCase,
  ProcesarCaptacionEntranteUseCase,
  ProcesarWhatsAppWebhookUseCase,
  RechazarCaptacionPendienteUseCase,
  RevisarCaptacionPendienteUseCase,
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
    crearRevisarCaptacionPendiente: (c) =>
      new RevisarCaptacionPendienteUseCase(new D1CaptacionPendienteRepository(c.env.DB)),
    crearMarcarCaptacionDuplicada: (c) =>
      new MarcarCaptacionDuplicadaUseCase(new D1CaptacionPendienteRepository(c.env.DB)),
    crearRechazarCaptacionPendiente: (c) =>
      new RechazarCaptacionPendienteUseCase(new D1CaptacionPendienteRepository(c.env.DB)),
    crearConvertirCaptacionPendiente: (c) =>
      new ConvertirCaptacionPendienteUseCase(
        new D1CaptacionPendienteRepository(c.env.DB),
        new RegistroLeadCaptacionVentasAdapter(crearRegistrarLeadUseCase(c.env.DB)),
        new RegistroPropiedadCaptacionAdapter(
          new D1PropiedadRepository(c.env.DB),
          new UuidGeneradorId(),
        ),
      ),
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
