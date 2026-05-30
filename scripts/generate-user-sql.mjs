import crypto from "crypto";

const ITERACIONES_PBKDF2 = 100_000;
const LARGO_HASH_BYTES = 32;
const LARGO_SALT_BYTES = 16;

const usage = `
Uso:
  AUTH_PEPPER="pepper-real" bun scripts/generate-user-sql.mjs \\
    --username admin \\
    --nombre "Admin ALVAS" \\
    --rol ADMIN \\
    --clave "clave-segura"

El ID se genera automaticamente (UUID v4).
El username se normaliza: min 3 chars, solo [a-z0-9._-].

Aplica el SQL generado con Wrangler, por ejemplo:
  bun run --cwd apps/api wrangler d1 execute alvas-dev --local --file seed-admin.sql
`;

const escapeSql = (value) => String(value).replaceAll("'", "''");

const aBase64Url = (bytes) =>
  Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

function hashearClave(clavePlana, pepper) {
  const claveNormalizada = clavePlana.trim();
  if (claveNormalizada.length < 8) throw new Error("La clave debe tener al menos 8 caracteres.");

  const salt = crypto.randomBytes(LARGO_SALT_BYTES);
  const bits = crypto.pbkdf2Sync(
    claveNormalizada + pepper,
    salt,
    ITERACIONES_PBKDF2,
    LARGO_HASH_BYTES,
    "sha256",
  );
  return `pbkdf2$${ITERACIONES_PBKDF2}$${aBase64Url(salt)}$${aBase64Url(bits)}`;
}

const args = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (!arg.startsWith("--")) continue;
  const key = arg.slice(2);
  const value = process.argv[i + 1];
  if (!value || value.startsWith("--")) {
    args.set(key, "true");
  } else {
    args.set(key, value);
    i++;
  }
}

const requerido = (key) => {
  const value = args.get(key);
  if (!value) {
    console.error(`Falta --${key}`);
    console.error(usage.trim());
    process.exit(1);
  }
  return value;
};

const usernameRaw = requerido("username");
const username = usernameRaw.trim().toLowerCase();

if (username.length < 3) {
  console.error("El username debe tener al menos 3 caracteres.");
  process.exit(1);
}
if (username.length > 50) {
  console.error("El username no puede exceder 50 caracteres.");
  process.exit(1);
}
if (!/^[a-z0-9._-]+$/.test(username)) {
  console.error("El username solo puede contener letras, numeros, puntos, guiones y guion bajo.");
  process.exit(1);
}

const id = crypto.randomUUID();
const nombre = requerido("nombre");
const rol = requerido("rol").toUpperCase();
const clave = requerido("clave");
const estado = (args.get("estado") ?? "ACTIVO").toUpperCase();
const pepper = args.get("pepper") ?? process.env.AUTH_PEPPER ?? "";
const ahora = new Date().toISOString();

if (!["ADMIN", "ASESOR"].includes(rol)) {
  console.error("--rol debe ser ADMIN o ASESOR.");
  process.exit(1);
}

const hashClave = hashearClave(clave, pepper);

console.log(`-- Usuario generado localmente. No guardes la clave plana en git.`);
console.log(
  `INSERT INTO usuarios (id, username, nombre, hash_clave, rol, estado, creado_en, actualizado_en)`,
);
console.log(
  `VALUES ('${escapeSql(id)}', '${escapeSql(username)}', '${escapeSql(nombre)}', '${escapeSql(hashClave)}', '${escapeSql(rol)}', '${escapeSql(estado)}', '${escapeSql(ahora)}', '${escapeSql(ahora)}')`,
);
console.log(`ON CONFLICT(id) DO UPDATE SET`);
console.log(`  username = excluded.username,`);
console.log(`  nombre = excluded.nombre,`);
console.log(`  hash_clave = excluded.hash_clave,`);
console.log(`  rol = excluded.rol,`);
console.log(`  estado = excluded.estado,`);
console.log(`  actualizado_en = excluded.actualizado_en;`);
console.log(`-- ID generado: ${id}`);
