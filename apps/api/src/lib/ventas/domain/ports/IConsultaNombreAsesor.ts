/** @group Puertos */
export interface IConsultaNombreAsesor {
  obtenerNombre(idAsesor: string): Promise<string | undefined>;
}
