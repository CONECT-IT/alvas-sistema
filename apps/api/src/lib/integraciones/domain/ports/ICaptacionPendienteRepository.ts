import { type CaptacionPendiente } from "../entities";

export interface ICaptacionPendienteRepository {
  guardar(captacion: CaptacionPendiente): Promise<void>;
  obtenerPorId(id: string): Promise<CaptacionPendiente | null>;
  listarPendientes(): Promise<CaptacionPendiente[]>;
}
