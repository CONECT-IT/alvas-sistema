import fs from "fs";
import path from "path";
import crypto from "crypto";

const ITERACIONES_PBKDF2 = 100_000;
const LARGO_HASH_BYTES = 32;
const LARGO_SALT_BYTES = 16;

const aBase64Url = (bytes) =>
  Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

async function hashearClave(clavePlana, pepper) {
  const claveNormalizada = clavePlana.trim();
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

const escapeSql = (value) => {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
};

async function main() {
  const pepper =
    process.env.AUTH_PEPPER ?? "20fa23043ee3167d78a65ed110d9fccdf4b7478804f930c9965d0363bae3ecf2";
  const ahora = new Date();
  const ahoraIso = ahora.toISOString();
  let actividadOffsetMs = 0;

  const siguienteFechaActividad = () => {
    actividadOffsetMs += 1000;
    return new Date(ahora.getTime() + actividadOffsetMs).toISOString();
  };

  // Deterministic UUIDs for seed data
  const IDS = {
    USUARIO_ADMIN: "00000000-0000-4000-a000-000000000001",
    USUARIO_ASESOR1: "00000000-0000-4000-a000-000000000002",
    USUARIO_ASESOR2: "00000000-0000-4000-a000-000000000003",
    PROPIEDADES: [
      "11111111-1111-4000-a000-000000000001",
      "11111111-1111-4000-a000-000000000002",
      "11111111-1111-4000-a000-000000000003",
      "11111111-1111-4000-a000-000000000004",
    ],
    PROPIEDAD_PREL: [
      "11111111-2222-4000-a000-000000000001",
      "11111111-2222-4000-a000-000000000002",
      "11111111-2222-4000-a000-000000000003",
    ],
    LEADS: [
      "22222222-1111-4000-a000-000000000001",
      "22222222-1111-4000-a000-000000000002",
      "22222222-1111-4000-a000-000000000003",
      "22222222-1111-4000-a000-000000000004",
      "22222222-1111-4000-a000-000000000005",
      "22222222-1111-4000-a000-000000000006",
      "22222222-1111-4000-a000-000000000007",
      "22222222-1111-4000-a000-000000000008",
      "22222222-1111-4000-a000-000000000009",
    ],
    CITAS: [
      "33333333-1111-4000-a000-000000000001",
      "33333333-1111-4000-a000-000000000002",
      "33333333-1111-4000-a000-000000000003",
      "33333333-1111-4000-a000-000000000004",
    ],
    CONTRATOS: [
      "44444444-1111-4000-a000-000000000001",
      "44444444-1111-4000-a000-000000000002",
      "44444444-1111-4000-a000-000000000003",
    ],
    CLIENTES: [
      "55555555-1111-4000-a000-000000000001",
      "55555555-1111-4000-a000-000000000002",
      "55555555-1111-4000-a000-000000000003",
    ],
    CAPTACIONES: [
      "66666666-1111-4000-a000-000000000001",
      "66666666-1111-4000-a000-000000000002",
      "66666666-1111-4000-a000-000000000003",
    ],
  };

  const sqlLines = [];

  sqlLines.push(`-- Seed generado el ${ahoraIso}`);
  sqlLines.push(`-- Usa UUIDs v4 para alinearse con el dominio actual`);
  sqlLines.push("");
  sqlLines.push("-- Datos derivados del seed");
  sqlLines.push("DELETE FROM integraciones_captaciones_pendientes;");
  sqlLines.push("DELETE FROM ventas_actividad;");
  sqlLines.push("");

  // ── Usuarios ──
  const usuariosSeed = [
    {
      id: IDS.USUARIO_ADMIN,
      username: "admin",
      nombre: "Admin ALVAS",
      clave: "admin123",
      rol: "ADMIN",
    },
    {
      id: IDS.USUARIO_ASESOR1,
      username: "jramirez",
      nombre: "Juan Ramírez",
      clave: "asesor123",
      rol: "ASESOR",
    },
    {
      id: IDS.USUARIO_ASESOR2,
      username: "lmartinez",
      nombre: "Lucía Martínez",
      clave: "asesor123",
      rol: "ASESOR",
    },
  ];

  sqlLines.push("-- Usuarios");
  for (const u of usuariosSeed) {
    const hash = await hashearClave(u.clave, pepper);
    sqlLines.push(
      `INSERT INTO usuarios (id, username, nombre, hash_clave, rol, estado, creado_en, actualizado_en)` +
        ` VALUES (${escapeSql(u.id)}, ${escapeSql(u.username)}, ${escapeSql(u.nombre)}, ${escapeSql(hash)}, ${escapeSql(u.rol)}, ${escapeSql("ACTIVO")}, ${escapeSql(ahoraIso)}, ${escapeSql(ahoraIso)})` +
        ` ON CONFLICT(id) DO UPDATE SET username=excluded.username, nombre=excluded.nombre, hash_clave=excluded.hash_clave, rol=excluded.rol, estado=excluded.estado, actualizado_en=excluded.actualizado_en;`,
    );
  }
  sqlLines.push("");

  // ── Propiedades ──
  const propiedadesSeed = [
    {
      id: IDS.PROPIEDADES[0],
      titulo: "Casa en Surco",
      descripcion: "Casa de 3 dormitorios con jardín y piscina",
      precio: 350000,
    },
    {
      id: IDS.PROPIEDADES[1],
      titulo: "Departamento en Miraflores",
      descripcion: "Departamento de 2 dormitorios frente al malecón",
      precio: 280000,
    },
    {
      id: IDS.PROPIEDADES[2],
      titulo: "Terreno en San Bartolo",
      descripcion: "Terreno de 500m² con vista al mar",
      precio: 180000,
    },
    {
      id: IDS.PROPIEDADES[3],
      titulo: "Local Comercial en San Isidro",
      descripcion: "Local de 120m² en plena av. principal",
      precio: 420000,
    },
  ];

  sqlLines.push("-- Propiedades");
  for (const p of propiedadesSeed) {
    sqlLines.push(
      `INSERT INTO propiedades (id, titulo, descripcion, precio, origen, estado, id_lead_origen, id_cliente_propietario, captada_por_asesor_id, asesor_responsable_id, creado_en, actualizado_en)` +
        ` VALUES (${escapeSql(p.id)}, ${escapeSql(p.titulo)}, ${escapeSql(p.descripcion)}, ${p.precio}, ${escapeSql("ALVAS")}, ${escapeSql("DISPONIBLE")}, NULL, NULL, NULL, NULL, ${escapeSql(ahoraIso)}, ${escapeSql(ahoraIso)})` +
        ` ON CONFLICT(id) DO UPDATE SET titulo=excluded.titulo, descripcion=excluded.descripcion, precio=excluded.precio, origen=excluded.origen, estado=excluded.estado, actualizado_en=excluded.actualizado_en;`,
    );
  }
  sqlLines.push("");

  // ── Captaciones Pendientes ──
  const captacionesSeed = [
    {
      id: IDS.CAPTACIONES[0],
      canal: "WHATSAPP",
      origen: "WEB",
      nombre: "Roberto Gomez",
      telefono: "988123456",
      email: "roberto@mail.com",
      tipo: "COMPRA",
    },
    {
      id: IDS.CAPTACIONES[1],
      canal: "FORMULARIO_WEB",
      origen: "FACEBOOK",
      nombre: "Elena Paz",
      telefono: "977234567",
      email: "elena@mail.com",
      tipo: "VENTA",
    },
  ];

  sqlLines.push("-- Captaciones Pendientes");
  for (const c of captacionesSeed) {
    sqlLines.push(
      `INSERT INTO integraciones_captaciones_pendientes (id, canal, origen, nombre, telefono, email, tipo, estado, creado_en, actualizado_en)` +
        ` VALUES (${escapeSql(c.id)}, ${escapeSql(c.canal)}, ${escapeSql(c.origen)}, ${escapeSql(c.nombre)}, ${escapeSql(c.telefono)}, ${escapeSql(c.email)}, ${escapeSql(c.tipo)}, 'PENDIENTE', ${escapeSql(ahoraIso)}, ${escapeSql(ahoraIso)});`,
    );
  }
  sqlLines.push("");

  // ── Leads ──
  const leadsSeed = [
    {
      id: IDS.LEADS[0],
      nombre: "María Torres",
      email: "maria@example.com",
      telefono: "999111222",
      tipo: "COMPRA",
      idAsesor: IDS.USUARIO_ASESOR1,
      idPropiedadInteres: IDS.PROPIEDADES[0],
      estadoOverride: "CONTACTO",
    },
    {
      id: IDS.LEADS[1],
      nombre: "Carlos López",
      email: "carlos@example.com",
      telefono: "999333444",
      tipo: "COMPRA",
      idAsesor: IDS.USUARIO_ASESOR1,
      idPropiedadInteres: IDS.PROPIEDADES[1],
      estadoOverride: "NUEVO",
    },
    {
      id: IDS.LEADS[2],
      nombre: "Ana García",
      email: "ana@example.com",
      telefono: "999555666",
      tipo: "VENTA",
      idAsesor: IDS.USUARIO_ASESOR2,
      estadoOverride: "TRABAJANDO",
    },
    {
      id: IDS.LEADS[3],
      nombre: "Pedro Sánchez",
      email: "pedro@example.com",
      telefono: "999777888",
      tipo: "COMPRA",
      idAsesor: IDS.USUARIO_ASESOR2,
      idPropiedadInteres: IDS.PROPIEDADES[3],
      estadoOverride: "NUEVO",
    },
    {
      id: IDS.LEADS[4],
      nombre: "Sofía Díaz",
      email: "sofia@example.com",
      telefono: "999000111",
      tipo: "VENTA",
      idAsesor: IDS.USUARIO_ASESOR1,
      estadoOverride: "NUEVO",
    },
  ];

  sqlLines.push("-- Leads");
  for (const l of leadsSeed) {
    sqlLines.push(
      `INSERT INTO ventas_leads (id, nombre, email, telefono, tipo, estado, id_asesor, id_cliente, id_propiedad_interes, creado_en, actualizado_en)` +
        ` VALUES (${escapeSql(l.id)}, ${escapeSql(l.nombre)}, ${escapeSql(l.email)}, ${escapeSql(l.telefono)}, ${escapeSql(l.tipo)}, ${escapeSql(l.estadoOverride)}, ${escapeSql(l.idAsesor)}, NULL, ${escapeSql(l.idPropiedadInteres)}, ${escapeSql(ahoraIso)}, ${escapeSql(ahoraIso)})` +
        ` ON CONFLICT(id) DO UPDATE SET nombre=excluded.nombre, email=excluded.email, telefono=excluded.telefono, tipo=excluded.tipo, estado=excluded.estado, id_asesor=excluded.id_asesor, id_propiedad_interes=excluded.id_propiedad_interes, actualizado_en=excluded.actualizado_en;`,
    );
    sqlLines.push(
      `INSERT INTO ventas_actividad (id_lead, evento, descripcion, fecha)` +
        ` VALUES (${escapeSql(l.id)}, ${escapeSql("LEAD_CREADO")}, ${escapeSql(`Lead registrado: ${l.nombre}`)}, ${escapeSql(siguienteFechaActividad())});`,
    );
  }
  sqlLines.push("");

  // ── Propiedades BORRADOR ──
  const preliminaresSeed = [
    {
      id: IDS.PROPIEDAD_PREL[0],
      idLead: IDS.LEADS[2],
      titulo: "Casa en La Molina (Venta - Ana García)",
      descripcion: "Casa de 4 dormitorios con amplio jardín",
      precio: 520000,
    },
  ];

  sqlLines.push("-- Propiedades preliminares (BORRADOR)");
  for (const p of preliminaresSeed) {
    sqlLines.push(
      `INSERT INTO propiedades (id, titulo, descripcion, precio, origen, estado, id_lead_origen, id_cliente_propietario, captada_por_asesor_id, asesor_responsable_id, creado_en, actualizado_en)` +
        ` VALUES (${escapeSql(p.id)}, ${escapeSql(p.titulo)}, ${escapeSql(p.descripcion)}, ${p.precio}, ${escapeSql("CLIENTE")}, ${escapeSql("BORRADOR")}, ${escapeSql(p.idLead)}, NULL, NULL, ${escapeSql(IDS.USUARIO_ASESOR2)}, ${escapeSql(ahoraIso)}, ${escapeSql(ahoraIso)})` +
        ` ON CONFLICT(id) DO UPDATE SET titulo=excluded.titulo, descripcion=excluded.descripcion, precio=excluded.precio, origen=excluded.origen, estado=excluded.estado, id_lead_origen=excluded.id_lead_origen, actualizado_en=excluded.actualizado_en;`,
    );
  }
  sqlLines.push("");

  // ── Citas ──
  const citasSeed = [
    {
      id: IDS.CITAS[0],
      idLead: IDS.LEADS[0],
      idPropiedad: IDS.PROPIEDADES[0],
      offsetDays: 1,
      durationHours: 1,
      observacion: "Primera visita - Casa en Surco",
    },
  ];

  sqlLines.push("-- Citas");
  for (const c of citasSeed) {
    const start = new Date(ahora.getTime() + c.offsetDays * 86400000);
    const end = new Date(start.getTime() + c.durationHours * 3600000);
    sqlLines.push(
      `INSERT INTO ventas_citas (id, id_lead, id_propiedad, fecha_inicio, fecha_fin, estado, observacion)` +
        ` VALUES (${escapeSql(c.id)}, ${escapeSql(c.idLead)}, ${escapeSql(c.idPropiedad)}, ${escapeSql(start.toISOString())}, ${escapeSql(end.toISOString())}, ${escapeSql("PENDIENTE")}, ${escapeSql(c.observacion)})` +
        ` ON CONFLICT(id) DO UPDATE SET id_lead=excluded.id_lead, id_propiedad=excluded.id_propiedad, fecha_inicio=excluded.fecha_inicio, fecha_fin=excluded.fecha_fin, estado=excluded.estado, observacion=excluded.observacion;`,
    );
    sqlLines.push(
      `INSERT INTO ventas_actividad (id_lead, evento, descripcion, fecha)` +
        ` VALUES (${escapeSql(c.idLead)}, ${escapeSql("CITA_AGENDADA")}, ${escapeSql(`Cita agendada para ${c.observacion}`)}, ${escapeSql(siguienteFechaActividad())});`,
    );
  }
  sqlLines.push("");

  // ── Contratos ──
  const contratosSeed = [
    { id: IDS.CONTRATOS[0], idLead: IDS.LEADS[0], idPropiedad: IDS.PROPIEDADES[0], meses: 12 },
  ];

  sqlLines.push("-- Contratos");
  for (const c of contratosSeed) {
    const fechaFin = new Date(ahora.getFullYear() + 1, ahora.getMonth(), ahora.getDate());
    sqlLines.push(
      `INSERT INTO ventas_contratos (id, id_lead, id_cliente, id_propiedad, fecha_inicio, fecha_fin, estado, creado_en, actualizado_en)` +
        ` VALUES (${escapeSql(c.id)}, ${escapeSql(c.idLead)}, NULL, ${escapeSql(c.idPropiedad)}, ${escapeSql(ahoraIso)}, ${escapeSql(fechaFin.toISOString())}, ${escapeSql("BORRADOR")}, ${escapeSql(ahoraIso)}, ${escapeSql(ahoraIso)})` +
        ` ON CONFLICT(id) DO UPDATE SET id_lead=excluded.id_lead, id_cliente=excluded.id_cliente, id_propiedad=excluded.id_propiedad, fecha_inicio=excluded.fecha_inicio, fecha_fin=excluded.fecha_fin, estado=excluded.estado, actualizado_en=excluded.actualizado_en;`,
    );
    sqlLines.push(
      `INSERT INTO ventas_actividad (id_lead, evento, descripcion, fecha)` +
        ` VALUES (${escapeSql(c.idLead)}, ${escapeSql("CONTRATO_CREADO")}, ${escapeSql("Contrato comercial creado para la propiedad seleccionada")}, ${escapeSql(siguienteFechaActividad())});`,
    );
  }
  sqlLines.push("");

  // ── Clientes ──
  const clientesSeed = [
    {
      id: IDS.CLIENTES[0],
      nombre: "María Torres (Cliente)",
      email: "maria.cliente@example.com",
      telefono: "999111222",
      idAsesor: IDS.USUARIO_ASESOR1,
      idLeadOrigen: IDS.LEADS[0],
    },
  ];

  sqlLines.push("-- Clientes");
  for (const cl of clientesSeed) {
    sqlLines.push(
      `INSERT INTO ventas_clientes (id, nombre, email, telefono, id_asesor, id_lead_origen, creado_en, actualizado_en)` +
        ` VALUES (${escapeSql(cl.id)}, ${escapeSql(cl.nombre)}, ${escapeSql(cl.email)}, ${escapeSql(cl.telefono)}, ${escapeSql(cl.idAsesor)}, ${escapeSql(cl.idLeadOrigen)}, ${escapeSql(ahoraIso)}, ${escapeSql(ahoraIso)})` +
        ` ON CONFLICT(id) DO UPDATE SET nombre=excluded.nombre, email=excluded.email, telefono=excluded.telefono, id_asesor=excluded.id_asesor, id_lead_origen=excluded.id_lead_origen, actualizado_en=excluded.actualizado_en;`,
    );
    sqlLines.push(
      `INSERT INTO ventas_actividad (id_lead, evento, descripcion, fecha)` +
        ` VALUES (${escapeSql(cl.idLeadOrigen)}, ${escapeSql("CLIENTE_CONVERTIDO")}, ${escapeSql(`Lead convertido a cliente: ${cl.nombre}`)}, ${escapeSql(siguienteFechaActividad())});`,
    );
  }
  sqlLines.push("");

  const sqlContent = sqlLines.join("\n");
  const scriptDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
  const projectRoot = path.join(scriptDir, "..");

  const seedDir = path.join(projectRoot, "database/seeds");
  const seedPath = path.join(seedDir, "seed.sql");
  fs.mkdirSync(seedDir, { recursive: true });
  fs.writeFileSync(seedPath, sqlContent);
  console.log(`SQL seed file generated successfully in ${seedPath}`);
}

main().catch((err) => {
  console.error("Error generating seed:", err);
  process.exit(1);
});
