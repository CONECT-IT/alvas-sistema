import type { CaptacionVendedor } from '../../domain/models/CaptacionVendedor';

export interface CaptacionRepository {
	registrarVendedor(input: CaptacionVendedor): Promise<{
		idLead: string;
		idPropiedadPreliminar?: string;
	}>;
}
