const ITERACIONES_PBKDF2 = 120_000;
const LARGO_HASH_BYTES = 32;
const LARGO_SALT_BYTES = 16;

const usage = `
Uso:
  AUTH_PEPPER="pepper-real" bun scripts/generate-user-sql.mjs \\
    --id admin \\
    --username admin \\
    --nombre "Admin ALVAS" \\
    --rol ADMIN \\
    --clave "clave-segura"

Aplica el SQL generado con Wrangler, por ejemplo:
  bun run --cwd apps/api wrangler d1 execute alvas-staging --remote --env staging --file .antigravitycli/seed-admin.sql
`;

const args = new Map();

for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (!arg.startsWith("--")) continue;
  const key = arg.slice(2);
  const value = process.argv[i + 1];
  if (!value || value.startsWith("--")) {
    args.set(key, "true");
  } else {
    args.set(key, value);
    i += 1;
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

const escapeSql = (value) => String(value).replaceAll("'", "''");

const aBase64Url = (bytes) =>
  Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

async function hashearClave(clavePlana, pepper) {
  const claveNormalizada = clavePlana.trim();

  if (claveNormalizada.length < 8) {
    throw new Error("La clave debe tener al menos 8 caracteres.");
  }

  const salt = crypto.getRandomValues(new Uint8Array(LARGO_SALT_BYTES));
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`${claveNormalizada}${pepper}`),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      iterations: ITERACIONES_PBKDF2,
      salt,
    },
    material,
    LARGO_HASH_BYTES * 8,
  );

  return `pbkdf2$${ITERACIONES_PBKDF2}$${aBase64Url(salt)}$${aBase64Url(new Uint8Array(bits))}`;
}

const id = requerido("id");
const username = requerido("username");
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

const hashClave = await hashearClave(clave, pepper);

console.log(`-- Usuario generado localmente. No guardes la clave plana en git.`);
console.log(
  `INSERT INTO usuarios (id, username, nombre, hash_clave, rol, estado, creado_en, actualizado_en)`,
);
console.log(
  `VALUES ('${escapeSql(id)}', '${escapeSql(username)}', '${escapeSql(nombre)}', '${escapeSql(
    hashClave,
  )}', '${escapeSql(rol)}', '${escapeSql(estado)}', '${escapeSql(ahora)}', '${escapeSql(ahora)}')`,
);
console.log(`ON CONFLICT(id) DO UPDATE SET`);
console.log(`  username = excluded.username,`);
console.log(`  nombre = excluded.nombre,`);
console.log(`  hash_clave = excluded.hash_clave,`);
console.log(`  rol = excluded.rol,`);
console.log(`  estado = excluded.estado,`);
console.log(`  actualizado_en = excluded.actualizado_en;`);
