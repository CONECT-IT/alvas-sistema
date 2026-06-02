/**
 * Tipo discriminado que representa el resultado exitoso de una operacion.
 * @group Tipos
 */
export type Exito<T> = {
  readonly esExito: true;
  readonly valor: T;
};

/**
 * Tipo discriminado que representa el resultado fallido de una operacion.
 * @group Tipos
 */
export type Fallo<E> = {
  readonly esExito: false;
  readonly error: E;
};

/**
 * Tipo resultante de la union de {@link Exito} y {@link Fallo}.
 * @group Tipos
 */
export type Resultado<T, E> = Exito<T> | Fallo<E>;

/**
 * Crea un resultado exitoso.
 * @param valor - Valor encapsulado.
 */
export const resultadoExitoso = <T>(valor: T): Exito<T> => ({
  esExito: true,
  valor,
});

/**
 * Crea un resultado fallido.
 * @param error - Error de dominio encapsulado.
 */
export const resultadoFallido = <E>(error: E): Fallo<E> => ({
  esExito: false,
  error,
});
