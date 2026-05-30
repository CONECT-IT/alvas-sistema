import { Lead } from "../entities/Lead";
import { Cliente } from "../entities/Cliente";

export interface IVentasRepository {
  // Gestión de Leads
  obtenerLeadPorId(id: string): Promise<Lead | null>;
  guardarLead(lead: Lead): Promise<void>;
  listarLeads(): Promise<Lead[]>;
  listarLeadsPorAsesor(idAsesor: string): Promise<Lead[]>;
  listarLeadsPorEstado(estado: string): Promise<Lead[]>;

  // Gestión de Clientes
  obtenerClientePorId(id: string): Promise<Cliente | null>;
  guardarCliente(cliente: Cliente): Promise<void>;
  listarClientes(): Promise<Cliente[]>;
  listarClientesPorAsesor(idAsesor: string): Promise<Cliente[]>;

  // Actividad
  registrarActividad(idLead: string, evento: string, descripcion: string): Promise<void>;
  obtenerActividadReciente(
    limite: number,
  ): Promise<{ idLead: string; evento: string; descripcion: string; fecha: string }[]>;
  obtenerActividadPorLead(
    idLead: string,
  ): Promise<{ id: number; idLead: string; evento: string; descripcion: string; fecha: string }[]>;

  // Estadísticas y Reportes
  listarAsesoresConLeads(): Promise<{ idAsesor: string; totalLeads: number }[]>;
  contarAccionesPorTipo(): Promise<{ evento: string; total: number }[]>;
}
