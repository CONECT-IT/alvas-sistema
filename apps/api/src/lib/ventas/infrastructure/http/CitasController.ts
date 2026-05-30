import {
  type ContextoVentas,
  responderErrorDeDominio,
  responderErrorInterno,
  type VentasControllerDeps,
} from "./VentasHttp";
import { parseBody } from "../../../shared/infrastructure/validation/helpers";
import { AgendarCitaSchema, ActualizarCitaBodySchema } from "../validation/schemas";

export class CitasController {
  constructor(private readonly deps: VentasControllerDeps) {}

  async agendar(c: ContextoVentas): Promise<Response> {
    try {
      const body = parseBody(AgendarCitaSchema, await c.req.json());
      const authPayload = c.get("authPayload");
      const useCase = this.deps.crearAgendarCita(c);

      const resultado = await useCase.ejecutar({
        ...body,
        usuarioAutenticado: { id: authPayload.idUsuario, rol: authPayload.rol },
      });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, message: "Cita agendada" });
    } catch (error) {
      return responderErrorInterno(c, "CitasController.agendar:", error);
    }
  }

  async actualizar(c: ContextoVentas): Promise<Response> {
    try {
      const idLead = c.req.param("idLead") ?? "";
      const idCita = c.req.param("idCita") ?? "";
      const body = parseBody(ActualizarCitaBodySchema, await c.req.json());
      const authPayload = c.get("authPayload");
      const useCase = this.deps.crearActualizarCita(c);

      const resultado = await useCase.ejecutar({
        idLead,
        idCita,
        ...body,
        fechaInicio: body.fechaInicio ? new Date(body.fechaInicio) : undefined,
        usuarioAutenticado: { id: authPayload.idUsuario, rol: authPayload.rol },
      });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, message: "Cita actualizada" });
    } catch (error) {
      return responderErrorInterno(c, "CitasController.actualizar:", error);
    }
  }

  async listar(c: ContextoVentas): Promise<Response> {
    try {
      const useCase = this.deps.crearListarCitas(c);
      const resultado = await useCase.ejecutar();

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      const ventasRepo = this.deps.crearVentasRepo(c);
      const propRepo = this.deps.crearPropiedadRepo(c);
      const userRepo = this.deps.crearUsuarioRepo(c);

      const data = await Promise.all(
        resultado.valor.map(async (cita) => {
          let nombreLead: string | undefined;
          let nombrePropiedad: string | undefined;
          let nombreAsesor: string | undefined;

          try {
            const lead = await ventasRepo.obtenerLeadPorId(cita.idLead);
            nombreLead = lead?.nombre;
          } catch {
            console.warn(`CitasController: No se pudo obtener lead ${cita.idLead}`);
          }

          if (cita.idPropiedad) {
            try {
              const propiedad = await propRepo.obtenerPorId(cita.idPropiedad);
              nombrePropiedad = propiedad?.titulo;
            } catch {
              console.warn(`CitasController: No se pudo obtener propiedad ${cita.idPropiedad}`);
            }
          }

          try {
            const asesor = await userRepo.obtenerPorId(cita.idAsesor);
            nombreAsesor = asesor?.nombre?.valor;
          } catch {
            console.warn(`CitasController: No se pudo obtener asesor ${cita.idAsesor}`);
          }

          return {
            id: cita.id,
            idLead: cita.idLead,
            nombreLead,
            idPropiedad: cita.idPropiedad,
            nombrePropiedad,
            idAsesor: cita.idAsesor,
            nombreAsesor,
            fechaInicio: cita.fechaInicio.toISOString(),
            fechaFin: cita.fechaFin.toISOString(),
            estado: cita.estado,
            observacion: cita.observacion,
          };
        }),
      );

      return c.json({ success: true, data });
    } catch (error) {
      return responderErrorInterno(c, "CitasController.listar:", error);
    }
  }

  async obtener(c: ContextoVentas): Promise<Response> {
    try {
      const idLead = c.req.param("idLead") ?? "";
      const idCita = c.req.param("idCita") ?? "";
      const useCase = this.deps.crearObtenerCitaPorId(c);
      const resultado = await useCase.ejecutar({ idLead, idCita });

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      const cita = resultado.valor;
      const data = {
        id: cita.id as string,
        idLead: cita.idLead as string,
        idPropiedad: cita.idPropiedad,
        fechaInicio: cita.fechaInicio.toISOString(),
        fechaFin: cita.fechaFin.toISOString(),
        estado: cita.estado,
        observacion: cita.observacion,
      };

      return c.json({ success: true, data });
    } catch (error) {
      return responderErrorInterno(c, "CitasController.obtener:", error);
    }
  }
}
