import { describe, expect, test } from "bun:test";

import { Pbkdf2PasswordHasher } from "../../../../src/lib/usuarios/infrastructure/security/Pbkdf2PasswordHasher";

describe("Pbkdf2PasswordHasher", () => {
  test("hashea una clave válida", async () => {
    const hasher = new Pbkdf2PasswordHasher();
    const hash = await hasher.hashear("clave-segura-123");

    expect(hash.valor).toContain("pbkdf2$");
    expect(hash.valor.split("$")).toHaveLength(4);
  });

  test("rechaza clave menor a 8 caracteres", async () => {
    const hasher = new Pbkdf2PasswordHasher();

    await expect(hasher.hashear("corta")).rejects.toThrow("al menos 8 caracteres");
  });

  test("hashea misma clave con hashes diferentes (salt aleatorio)", async () => {
    const hasher = new Pbkdf2PasswordHasher();
    const hash1 = await hasher.hashear("clave-segura-123");
    const hash2 = await hasher.hashear("clave-segura-123");

    expect(hash1.valor).not.toBe(hash2.valor);
  });

  test("comparar retorna true con la misma clave", async () => {
    const hasher = new Pbkdf2PasswordHasher();
    const hash = await hasher.hashear("clave-segura-123");

    const resultado = await hasher.comparar("clave-segura-123", hash.valor);

    expect(resultado).toBe(true);
  });

  test("comparar retorna false con clave incorrecta", async () => {
    const hasher = new Pbkdf2PasswordHasher();
    const hash = await hasher.hashear("clave-segura-123");

    const resultado = await hasher.comparar("clave-incorrecta", hash.valor);

    expect(resultado).toBe(false);
  });

  test("comparar retorna false con hash en formato inválido", async () => {
    const hasher = new Pbkdf2PasswordHasher();

    const resultado = await hasher.comparar("clave", "hash-invalido");

    expect(resultado).toBe(false);
  });

  test("comparar retorna false con hash con partes faltantes", async () => {
    const hasher = new Pbkdf2PasswordHasher();

    const resultado = await hasher.comparar("clave", "pbkdf2$1000$salt");

    expect(resultado).toBe(false);
  });

  test("comparar retorna false con iteraciones no numéricas", async () => {
    const hasher = new Pbkdf2PasswordHasher();

    const resultado = await hasher.comparar("clave", "pbkdf2$abc$salt$hash");

    expect(resultado).toBe(false);
  });

  test("funciona con pepper personalizado", async () => {
    const hasher = new Pbkdf2PasswordHasher("pepper-secreto");
    const hash = await hasher.hashear("clave-segura-123");

    const resultado = await hasher.comparar("clave-segura-123", hash.valor);

    expect(resultado).toBe(true);
  });

  test("pepper diferente produce hash diferente", async () => {
    const hasher1 = new Pbkdf2PasswordHasher("pepper-1");
    const hasher2 = new Pbkdf2PasswordHasher("pepper-2");
    const hash1 = await hasher1.hashear("clave-segura-123");
    const hash2 = await hasher2.hashear("clave-segura-123");

    expect(hash1.valor).not.toBe(hash2.valor);
  });

  test("hashear normaliza espacios en la clave", async () => {
    const hasher = new Pbkdf2PasswordHasher();
    const hash = await hasher.hashear("  clave-segura-123  ");

    const resultado = await hasher.comparar("clave-segura-123", hash.valor);

    expect(resultado).toBe(true);
  });
});
