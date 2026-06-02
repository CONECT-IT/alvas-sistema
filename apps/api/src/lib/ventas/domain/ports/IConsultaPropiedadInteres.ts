/** @group Puertos */
export interface IConsultaPropiedadInteres {
  propiedadDisponibleParaCompra(idPropiedad: string): Promise<boolean>;
}
