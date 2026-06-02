/** Puerto para verificar claves contra hashes guardados. @group Puertos */
export interface IVerificadorDeClave {
  comparar(clavePlana: string, hashGuardado: string): Promise<boolean>;
}
