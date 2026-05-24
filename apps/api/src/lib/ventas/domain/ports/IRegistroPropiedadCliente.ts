export interface IRegistroPropiedadCliente {
  registrarClientePropietario(idPropiedad: string, idCliente: string): Promise<void>;
}
