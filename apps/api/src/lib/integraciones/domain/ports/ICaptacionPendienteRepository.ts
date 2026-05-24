import { type CaptacionPendiente } from "../entities";

export interface ICaptacionPendienteRepository {
  guardar(captacion: CaptacionPendiente): Promise<void>;
  listarPendientes(): Promise<CaptacionPendiente[]>;
}
