import { IdUsuario } from "../../../usuarios/domain/value-objects/IdUsuario";
import type { IConsultaNombreAsesor } from "../../domain/ports/IConsultaNombreAsesor";
import type { IUsuarioRepository } from "../../../usuarios/domain/ports/IUsuarioRepository";

export class ConsultaNombreAsesorAdapter implements IConsultaNombreAsesor {
  constructor(private readonly usuarioRepository: IUsuarioRepository) {}

  async obtenerNombre(idAsesor: string): Promise<string | undefined> {
    try {
      const usuario = await this.usuarioRepository.obtenerPorId(new IdUsuario(idAsesor));
      return usuario?.nombre?.valor;
    } catch {
      return undefined;
    }
  }
}
