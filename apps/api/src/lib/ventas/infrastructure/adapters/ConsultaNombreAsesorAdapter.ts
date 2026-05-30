import type { IConsultaNombreAsesor } from "../../domain/ports/IConsultaNombreAsesor";
import type { IUsuarioRepository } from "../../../usuarios/domain/ports/IUsuarioRepository";

export class ConsultaNombreAsesorAdapter implements IConsultaNombreAsesor {
  constructor(private readonly usuarioRepository: IUsuarioRepository) {}

  async obtenerNombre(idAsesor: string): Promise<string | undefined> {
    try {
      const usuario = await this.usuarioRepository.obtenerPorId(idAsesor);
      return usuario?.nombre?.valor;
    } catch {
      console.warn(`ConsultaNombreAsesorAdapter: Error al obtener nombre del asesor ${idAsesor}`);
      return undefined;
    }
  }
}
