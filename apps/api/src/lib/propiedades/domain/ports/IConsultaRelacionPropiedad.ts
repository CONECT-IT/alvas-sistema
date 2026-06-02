/**
 * Relacion de una propiedad con lead o cliente propietario.
 * @group Tipos
 */
export type RelacionPropiedad = Readonly<{
  idLeadOrigen?: string;
  idClientePropietario?: string;
}>;

/**
 * Puerto para consultar si un asesor gestiona la entidad vinculada a una propiedad.
 *
 * @group Puertos
 */
export interface IConsultaRelacionPropiedad {
  asesorGestionaPropiedad(idAsesor: string, relacion: RelacionPropiedad): Promise<boolean>;
}
