/**
 * Contrato base para todos los casos de uso del sistema.
 *
 * @group Casos de Uso
 */
export interface CasoDeUso<TEntrada, TSalida> {
  ejecutar(entrada: TEntrada): Promise<TSalida> | TSalida;
}
