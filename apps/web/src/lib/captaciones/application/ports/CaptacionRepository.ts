import type { CaptacionVendedor } from '../../domain/models/CaptacionVendedor';
import type {
	CaptacionConvertida,
	CaptacionPendiente
} from '../../domain/models/CaptacionPendiente';

export interface CaptacionRepository {
	registrarVendedor(input: CaptacionVendedor): Promise<{
		idLead: string;
		idPropiedadPreliminar?: string;
	}>;
	listarPendientes(): Promise<CaptacionPendiente[]>;
	revisar(idCaptacion: string): Promise<CaptacionPendiente>;
	marcarDuplicada(idCaptacion: string, razon: string): Promise<CaptacionPendiente>;
	rechazar(idCaptacion: string, razon?: string): Promise<CaptacionPendiente>;
	convertir(idCaptacion: string, idAsesor?: string): Promise<CaptacionConvertida>;
}
