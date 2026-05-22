import type { LeadPipeline } from '../../domain/models/LeadPipeline';
import type { ActualizarCitaInput } from '../use-cases/actualizarCita';
import type { ActualizarLeadInput } from '../use-cases/actualizarLead';
import type { AgendarCitaInput } from '../use-cases/agendarCita';
import type { ConvertirLeadInput } from '../use-cases/convertirLead';
import type { RegistrarLeadInput } from '../use-cases/registrarLead';

import type { ActividadLeadDTO } from '../../infrastructure/dto/VentasDTOs';

export interface VentasRepository {
	listarPipeline(): Promise<LeadPipeline[]>;
	registrarLead(input: RegistrarLeadInput): Promise<string>;
	actualizarLead(input: ActualizarLeadInput): Promise<void>;
	convertirLead(input: ConvertirLeadInput): Promise<string>;
	agendarCita(input: AgendarCitaInput): Promise<void>;
	actualizarCita(input: ActualizarCitaInput): Promise<void>;
	listarActividadLead(idLead: string): Promise<ActividadLeadDTO[]>;
}
