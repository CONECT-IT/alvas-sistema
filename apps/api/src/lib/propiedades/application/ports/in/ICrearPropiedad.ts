import { type Resultado } from "../../../../shared";
import { type PropiedadError } from "../../../domain/errors/PropiedadError";
import { type Propiedad } from "../../../domain/entities";
import { type CrearPropiedadDTO } from "../../dto/PropiedadDTOs";

/**
 * Comando para crear una propiedad con datos del usuario autenticado.
 * @group Puertos
 */
export type CrearPropiedadCommand = CrearPropiedadDTO & {
  usuarioAutenticado: {
    id: string;
    rol: string;
  };
};

/**
 * Puerto de entrada para el caso de uso crear propiedad.
 * @group Puertos
 */
export interface ICrearPropiedad {
  ejecutar(input: CrearPropiedadCommand): Promise<Resultado<Propiedad, PropiedadError>>;
}
