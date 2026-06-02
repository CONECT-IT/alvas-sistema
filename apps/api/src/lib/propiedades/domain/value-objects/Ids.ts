import { type Marca } from "../../../shared/domain/types/Marca";

/**
 * Marca tipada para el identificador unico de una propiedad.
 *
 * @group Value Objects
 */
export type IdPropiedad = Marca<string, "IdPropiedad">;

/**
 * Crea un IdPropiedad a partir de un string.
 * @param valor - Identificador en crudo.
 */
export const idPropiedad = (valor: string): IdPropiedad => valor as IdPropiedad;
