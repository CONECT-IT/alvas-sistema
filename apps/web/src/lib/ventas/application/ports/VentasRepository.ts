import type { LeadPipeline } from '../../domain/models/LeadPipeline';

export interface VentasRepository {
	listarPipeline(): Promise<LeadPipeline[]>;
}
