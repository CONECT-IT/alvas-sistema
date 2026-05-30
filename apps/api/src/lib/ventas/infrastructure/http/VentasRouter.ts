import { Hono } from "hono";
import { type SessionClaims } from "../../../shared/infrastructure";
import { CitasController } from "./CitasController";
import { ClientesController } from "./ClientesController";
import { ContratosController } from "./ContratosController";
import { LeadsController } from "./LeadsController";
import { PipelineController } from "./PipelineController";
import { type BindingsVentas, type VentasControllerDeps } from "./VentasHttp";

export function crearVentasRouter(deps: VentasControllerDeps) {
  const ventasRouter = new Hono<{
    Bindings: BindingsVentas;
    Variables: { authPayload: SessionClaims };
  }>();
  const leads = new LeadsController(deps);
  const citas = new CitasController(deps);
  const clientes = new ClientesController(deps);
  const contratos = new ContratosController(deps);
  const pipeline = new PipelineController(deps);

  ventasRouter.get("/pipeline", (c) => pipeline.listar(c));
  ventasRouter.post("/lead", (c) => leads.registrar(c));
  ventasRouter.get("/lead/:id", (c) => leads.obtener(c));
  ventasRouter.put("/lead/:id", (c) => leads.actualizar(c));
  ventasRouter.put("/lead/:id/asesor", (c) => leads.asignarAsesor(c));
  ventasRouter.post("/convertir", (c) => leads.convertirACliente(c));
  ventasRouter.get("/leads", (c) => leads.listarTodos(c));
  ventasRouter.get("/asesores", (c) => leads.listarAsesores(c));

  ventasRouter.post("/cita", (c) => citas.agendar(c));
  ventasRouter.get("/citas", (c) => citas.listar(c));
  ventasRouter.put("/lead/:idLead/cita/:idCita", (c) => citas.actualizar(c));
  ventasRouter.get("/lead/:idLead/cita/:idCita", (c) => citas.obtener(c));

  ventasRouter.get("/clientes", (c) => clientes.listar(c));
  ventasRouter.get("/cliente/:id", (c) => clientes.obtener(c));
  ventasRouter.put("/cliente/:id", (c) => clientes.actualizar(c));
  ventasRouter.get("/cliente/:id/propiedades", (c) => clientes.listarPropiedades(c));
  ventasRouter.post("/cliente", (c) => clientes.registrarDirecto(c));

  ventasRouter.get("/contratos", (c) => contratos.listar(c));
  ventasRouter.get("/contratos/mios", (c) => contratos.listarPorAsesor(c));
  ventasRouter.post("/contratos", (c) => contratos.crear(c));
  ventasRouter.post("/contratos/:idContrato/firmar", (c) => contratos.firmar(c));
  ventasRouter.post("/contratos/:idContrato/cancelar", (c) => contratos.cancelar(c));

  ventasRouter.get("/lead/:idLead/actividad", (c) => leads.listarActividad(c));

  return ventasRouter;
}
