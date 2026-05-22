import type { LeadPipeline } from '../../domain/models/LeadPipeline';
import type { AgendarCitaInput } from '../use-cases/agendarCita';
import type { RegistrarLeadInput } from '../use-cases/registrarLead';

export interface VentasRepository {
	listarPipeline(): Promise<LeadPipeline[]>;
	registrarLead(input: RegistrarLeadInput): Promise<string>;
	agendarCita(input: AgendarCitaInput): Promise<void>;
}
