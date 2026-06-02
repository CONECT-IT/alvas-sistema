import {
  type ContextoVentas,
  responderErrorDeDominio,
  responderErrorInterno,
  type VentasControllerDeps,
} from "./VentasHttp";
import { parseBody } from "../../../shared/infrastructure/validation/helpers";
import { RegistrarClienteDirectoSchema, ActualizarClienteSchema } from "../validation/schemas";

/** @group Controladores HTTP */
export class ClientesController {
  constructor(private readonly deps: VentasControllerDeps) {}

  async registrarDirecto(c: ContextoVentas): Promise<Response> {
    try {
      const body = parseBody(RegistrarClienteDirectoSchema, await c.req.json());
      const authPayload = c.get("authPayload");
      const useCase = this.deps.crearRegistrarClienteDirecto(c);

      const resultado = await useCase.ejecutar({
        ...body,
        idAsesor: authPayload.idUsuario,
      });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, data: { id: resultado.valor.id as string } }, 201);
    } catch (error) {
      return responderErrorInterno(c, "ClientesController.registrarDirecto:", error);
    }
  }

  async listar(c: ContextoVentas): Promise<Response> {
    try {
      const authPayload = c.get("authPayload");
      const useCase = this.deps.crearListarClientes(c);
      const resultado = await useCase.ejecutar();

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      const clientes =
        authPayload.rol === "ADMIN"
          ? resultado.valor
          : resultado.valor.filter((cliente) => cliente.idAsesor === authPayload.idUsuario);

      const ventasRepo = this.deps.crearVentasRepo(c);
      const userRepo = this.deps.crearUsuarioRepo(c);

      const data = await Promise.all(
        clientes.map(async (cliente) => {
          let nombreAsesor: string | undefined;
          let nombreLead: string | undefined;

          if (cliente.idAsesor) {
            const usuario = await userRepo.obtenerPorId(cliente.idAsesor as string);
            nombreAsesor = usuario?.nombre?.valor;
          }
          if (cliente.idLeadOrigen) {
            const lead = await ventasRepo.obtenerLeadPorId(cliente.idLeadOrigen as string);
            nombreLead = lead?.nombre;
          }

          return {
            id: cliente.id as string,
            nombre: cliente.nombre,
            email: cliente.email,
            telefono: cliente.telefono,
            idAsesor: cliente.idAsesor as string,
            nombreAsesor,
            idLeadOrigen: cliente.idLeadOrigen as string | undefined,
            nombreLead,
            creadoEn: cliente.creadoEn.toISOString(),
            actualizadoEn: cliente.actualizadoEn.toISOString(),
          };
        }),
      );

      return c.json({ success: true, data });
    } catch (error) {
      return responderErrorInterno(c, "ClientesController.listar:", error);
    }
  }

  async obtener(c: ContextoVentas): Promise<Response> {
    try {
      const id = c.req.param("id") ?? "";
      const useCase = this.deps.crearObtenerCliente(c);
      const resultado = await useCase.ejecutar({ id });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      const cliente = resultado.valor;
      const userRepo = this.deps.crearUsuarioRepo(c);
      const ventasRepo = this.deps.crearVentasRepo(c);

      let nombreAsesor: string | undefined;
      let nombreLead: string | undefined;

      if (cliente.idAsesor) {
        const usuario = await userRepo.obtenerPorId(cliente.idAsesor as string);
        nombreAsesor = usuario?.nombre?.valor;
      }
      if (cliente.idLeadOrigen) {
        const lead = await ventasRepo.obtenerLeadPorId(cliente.idLeadOrigen as string);
        nombreLead = lead?.nombre;
      }

      const data = {
        id: cliente.id as string,
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono,
        idAsesor: cliente.idAsesor as string,
        nombreAsesor,
        idLeadOrigen: cliente.idLeadOrigen as string | undefined,
        nombreLead,
        creadoEn: cliente.creadoEn.toISOString(),
        actualizadoEn: cliente.actualizadoEn.toISOString(),
      };

      return c.json({ success: true, data });
    } catch (error) {
      return responderErrorInterno(c, "ClientesController.obtener:", error);
    }
  }

  async actualizar(c: ContextoVentas): Promise<Response> {
    try {
      const id = c.req.param("id") ?? "";
      const body = parseBody(ActualizarClienteSchema, await c.req.json());
      const useCase = this.deps.crearActualizarCliente(c);
      const resultado = await useCase.ejecutar({ ...body, idCliente: id });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, data: resultado.valor });
    } catch (error) {
      return responderErrorInterno(c, "ClientesController.actualizar:", error);
    }
  }

  async listarPropiedades(c: ContextoVentas): Promise<Response> {
    try {
      const id = c.req.param("id") ?? "";
      const useCase = this.deps.crearListarPropiedadesPorCliente(c);
      const resultado = await useCase.ejecutar({ idCliente: id });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, data: resultado.valor });
    } catch (error) {
      return responderErrorInterno(c, "ClientesController.listarPropiedades:", error);
    }
  }
}
