/**
 * DTO para la creacion de una propiedad.
 * @group DTOs
 */
export type CrearPropiedadDTO = Readonly<{
  titulo: string;
  descripcion: string;
  precio: number;
  origen?: string;
  estado?: string;
  idLeadOrigen?: string;
  idClientePropietario?: string;
  captadaPorAsesorId?: string;
  asesorResponsableId?: string;
}>;

/**
 * DTO para la actualizacion de una propiedad.
 * @group DTOs
 */
export type ActualizarPropiedadDTO = Readonly<{
  titulo?: string;
  descripcion?: string;
  precio?: number;
  estado?: string;
  idClientePropietario?: string;
  asesorResponsableId?: string;
}>;

/**
 * DTO para la respuesta HTTP de una propiedad.
 * @group DTOs
 */
export type PropiedadRespuestaDTO = Readonly<{
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  origen: string;
  estado: string;
  idLeadOrigen?: string;
  idClientePropietario?: string;
  captadaPorAsesorId?: string;
  asesorResponsableId?: string;
}>;
