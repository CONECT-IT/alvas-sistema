import {
  ActualizarCitaUseCase,
  ActualizarClienteUseCase,
  ActualizarLeadUseCase,
  AgendarCitaUseCase,
  AsignarLeadAAsesorUseCase,
  CancelarContratoUseCase,
  ConvertirLeadAClienteUseCase,
  CrearContratoUseCase,
  FirmarContratoUseCase,
  ListarActividadLeadUseCase,
  ListarAsesoresConLeadsUseCase,
  ListarCitasUseCase,
  ListarClientesUseCase,
  ListarContratosUseCase,
  ListarContratosPorAsesorUseCase,
  ListarLeadsPorAsesorUseCase,
  ListarLeadsUseCase,
  ListarPropiedadesPorClienteUseCase,
  ObtenerCitaPorIdUseCase,
  ObtenerClienteUseCase,
  ObtenerLeadUseCase,
  RegistrarClienteDirectoUseCase,
  RegistrarLeadUseCase,
  type IRegistrarLead,
} from "../lib/ventas/application";
import {
  D1ContratoRepository,
  D1VentasRepository,
  type VentasControllerDeps,
} from "../lib/ventas/infrastructure";
import { type D1DatabaseLike } from "../lib/shared/infrastructure";
import { UuidGeneradorId } from "../lib/shared/infrastructure/security/UuidGeneradorId";
import { EvaluadorAsignacionService } from "../lib/ventas/domain/services/EvaluadorAsignacion";
import { AutorizadorVentasAdapter } from "../lib/ventas/infrastructure/security/AutorizadorVentasAdapter";
import {
  ConsultaPropiedadInteresVentasAdapter,
  D1PropiedadRepository,
  RegistroPropiedadVendedorAdapter,
} from "../lib/propiedades/infrastructure";

function crearConsultaPropiedadInteres(db: D1DatabaseLike) {
  return new ConsultaPropiedadInteresVentasAdapter(new D1PropiedadRepository(db));
}

function crearRegistroPropiedadVendedor(db: D1DatabaseLike) {
  return new RegistroPropiedadVendedorAdapter(new D1PropiedadRepository(db), new UuidGeneradorId());
}

export function crearRegistrarLeadUseCase(db: D1DatabaseLike): IRegistrarLead {
  const repo = new D1VentasRepository(db);
  return new RegistrarLeadUseCase(
    repo,
    new UuidGeneradorId(),
    new EvaluadorAsignacionService(),
    new AutorizadorVentasAdapter(),
    crearConsultaPropiedadInteres(db),
    crearRegistroPropiedadVendedor(db),
  );
}

export function crearVentasControllerDeps(): VentasControllerDeps {
  const autorizador = new AutorizadorVentasAdapter();

  return {
    crearRegistrarLead: (c) => crearRegistrarLeadUseCase(c.env.DB),
    crearAgendarCita: (c) =>
      new AgendarCitaUseCase(new D1VentasRepository(c.env.DB), new UuidGeneradorId(), autorizador),
    crearRegistrarClienteDirecto: (c) =>
      new RegistrarClienteDirectoUseCase(new D1VentasRepository(c.env.DB), new UuidGeneradorId()),
    crearConvertirLeadACliente: (c) =>
      new ConvertirLeadAClienteUseCase(
        new D1VentasRepository(c.env.DB),
        new UuidGeneradorId(),
        autorizador,
      ),
    crearActualizarLead: (c) =>
      new ActualizarLeadUseCase(
        new D1VentasRepository(c.env.DB),
        autorizador,
        crearConsultaPropiedadInteres(c.env.DB),
      ),
    crearActualizarCita: (c) =>
      new ActualizarCitaUseCase(new D1VentasRepository(c.env.DB), autorizador),
    crearListarLeadsPorAsesor: (c) =>
      new ListarLeadsPorAsesorUseCase(new D1VentasRepository(c.env.DB)),
    crearListarClientes: (c) => new ListarClientesUseCase(new D1VentasRepository(c.env.DB)),
    crearCrearContrato: (c) => new CrearContratoUseCase(new D1ContratoRepository(c.env.DB)),
    crearListarContratos: (c) =>
      new ListarContratosUseCase(
        new D1ContratoRepository(c.env.DB),
        new D1VentasRepository(c.env.DB),
      ),
    crearListarContratosPorAsesor: (c) =>
      new ListarContratosPorAsesorUseCase(
        new D1ContratoRepository(c.env.DB),
        new D1VentasRepository(c.env.DB),
      ),
    crearCancelarContrato: (c) => new CancelarContratoUseCase(new D1ContratoRepository(c.env.DB)),
    crearFirmarContrato: (c) =>
      new FirmarContratoUseCase(
        new D1ContratoRepository(c.env.DB),
        new D1VentasRepository(c.env.DB),
        new UuidGeneradorId(),
      ),
    crearObtenerLead: (c) => new ObtenerLeadUseCase(new D1VentasRepository(c.env.DB)),
    crearListarLeads: (c) => new ListarLeadsUseCase(new D1VentasRepository(c.env.DB), autorizador),
    crearAsignarLeadAAsesor: (c) => new AsignarLeadAAsesorUseCase(new D1VentasRepository(c.env.DB)),
    crearListarAsesoresConLeads: (c) =>
      new ListarAsesoresConLeadsUseCase(new D1VentasRepository(c.env.DB)),
    crearListarCitas: (c) => new ListarCitasUseCase(new D1VentasRepository(c.env.DB)),
    crearObtenerCitaPorId: (c) => new ObtenerCitaPorIdUseCase(new D1VentasRepository(c.env.DB)),
    crearObtenerCliente: (c) => new ObtenerClienteUseCase(new D1VentasRepository(c.env.DB)),
    crearActualizarCliente: (c) => new ActualizarClienteUseCase(new D1VentasRepository(c.env.DB)),
    crearListarPropiedadesPorCliente: (c) =>
      new ListarPropiedadesPorClienteUseCase(new D1ContratoRepository(c.env.DB)),
    crearListarActividadLead: (c) =>
      new ListarActividadLeadUseCase(new D1VentasRepository(c.env.DB)),
  };
}
