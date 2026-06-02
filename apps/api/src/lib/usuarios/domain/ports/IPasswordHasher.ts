import { type HashClave } from "../../domain/value-objects";

/** Puerto para hashear y comparar claves de usuario. @group Puertos */
export interface IPasswordHasher {
  hashear(clavePlana: string): Promise<HashClave>;
  comparar(clavePlana: string, hashGuardado: string): Promise<boolean>;
}
