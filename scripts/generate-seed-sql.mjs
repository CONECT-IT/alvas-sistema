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

function main() {
  const pepper =
    process.env.AUTH_PEPPER ?? "20fa23043ee3167d78a65ed110d9fccdf4b7478804f930c9965d0363bae3ecf2";
  const ahora = new Date();
  const ahoraIso = ahora.toISOString();

  // IDs are deterministic so seed relationships are predictable
  // (auto-generation via UUID is for real users, seed data needs stable refs)
  const IDS = {
    USUARIO_ADMIN: "admin",
    USUARIO_ASESOR1: "jramirez",
    USUARIO_ASESOR2: "lmartinez",
    PROPIEDADES: ["prop-001", "prop-002", "prop-003", "prop-004"],
    PROPIEDAD_PREL: ["prop-prel-001", "prop-prel-002", "prop-prel-003"],
    LEADS: [
      "lead-001",
      "lead-002",
      "lead-003",
      "lead-004",
      "lead-005",
      "lead-006",
      "lead-007",
      "lead-008",
      "lead-009",
    ],
    CITAS: ["cita-001", "cita-002", "cita-003", "cita-004"],
    CONTRATOS: ["contrato-001", "contrato-002", "contrato-003"],
    CLIENTES: ["cliente-001", "cliente-002", "cliente-003"],
  };

  const sqlLines = [];

  sqlLines.push(`-- Seed generado el ${ahoraIso}`);
  sqlLines.push(`-- Usa IDs deterministicos para mantener referencias entre tablas`);
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
    const hash = hashearClave(u.clave, pepper);
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
    {
      id: IDS.LEADS[5],
      nombre: "Ricardo Mendoza",
      email: "ricardo@example.com",
      telefono: "999222333",
      tipo: "COMPRA",
      idAsesor: IDS.USUARIO_ASESOR1,
      idPropiedadInteres: IDS.PROPIEDADES[0],
      estadoOverride: "NUEVO",
    },
    {
      id: IDS.LEADS[6],
      nombre: "Carmen Flores",
      email: "carmen@example.com",
      telefono: "999444555",
      tipo: "VENTA",
      idAsesor: IDS.USUARIO_ASESOR2,
      estadoOverride: "NUEVO",
    },
    {
      id: IDS.LEADS[7],
      nombre: "Diego Castillo",
      email: "diego@example.com",
      telefono: "999666777",
      tipo: "COMPRA",
      idAsesor: IDS.USUARIO_ASESOR1,
      estadoOverride: "NUEVO",
    },
    {
      id: IDS.LEADS[8],
      nombre: "Valeria Ríos",
      email: "valeria@example.com",
      telefono: "999888999",
      tipo: "VENTA",
      idAsesor: IDS.USUARIO_ASESOR2,
      estadoOverride: "PERDIDO",
    },
  ];

  sqlLines.push("-- Leads");
  for (const l of leadsSeed) {
    sqlLines.push(
      `INSERT INTO ventas_leads (id, nombre, email, telefono, tipo, estado, id_asesor, id_cliente, id_propiedad_interes, creado_en, actualizado_en)` +
        ` VALUES (${escapeSql(l.id)}, ${escapeSql(l.nombre)}, ${escapeSql(l.email)}, ${escapeSql(l.telefono)}, ${escapeSql(l.tipo)}, ${escapeSql(l.estadoOverride)}, ${escapeSql(l.idAsesor)}, NULL, ${escapeSql(l.idPropiedadInteres)}, ${escapeSql(ahoraIso)}, ${escapeSql(ahoraIso)})` +
        ` ON CONFLICT(id) DO UPDATE SET nombre=excluded.nombre, email=excluded.email, telefono=excluded.telefono, tipo=excluded.tipo, estado=excluded.estado, id_asesor=excluded.id_asesor, id_propiedad_interes=excluded.id_propiedad_interes, actualizado_en=excluded.actualizado_en;`,
    );
  }
  sqlLines.push("");

  // ── Actividades ──
  sqlLines.push("-- Actividades de Leads");
  for (const l of leadsSeed) {
    sqlLines.push(
      `INSERT INTO ventas_actividad (id_lead, evento, descripcion, fecha)` +
        ` VALUES (${escapeSql(l.id)}, ${escapeSql("LEAD_CREADO")}, ${escapeSql("Lead registrado vía seed")}, ${escapeSql(ahoraIso)});`,
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
    {
      id: IDS.PROPIEDAD_PREL[1],
      idLead: IDS.LEADS[4],
      titulo: "Departamento en Barranco (Venta - Sofía Díaz)",
      descripcion: "Departamento de 3 dormitorios con terraza",
      precio: 380000,
    },
    {
      id: IDS.PROPIEDAD_PREL[2],
      idLead: IDS.LEADS[6],
      titulo: "Casa en Chorrillos (Venta - Carmen Flores)",
      descripcion: "Casa de 2 dormitorios cerca al malecón",
      precio: 250000,
    },
  ];

  sqlLines.push("-- Propiedades preliminares (BORRADOR)");
  for (const p of preliminaresSeed) {
    sqlLines.push(
      `INSERT INTO propiedades (id, titulo, descripcion, precio, origen, estado, id_lead_origen, id_cliente_propietario, captada_por_asesor_id, asesor_responsable_id, creado_en, actualizado_en)` +
        ` VALUES (${escapeSql(p.id)}, ${escapeSql(p.titulo)}, ${escapeSql(p.descripcion)}, ${p.precio}, ${escapeSql("ALVAS")}, ${escapeSql("BORRADOR")}, ${escapeSql(p.idLead)}, NULL, NULL, NULL, ${escapeSql(ahoraIso)}, ${escapeSql(ahoraIso)})` +
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
    {
      id: IDS.CITAS[1],
      idLead: IDS.LEADS[1],
      idPropiedad: IDS.PROPIEDADES[1],
      offsetDays: 2,
      durationHours: 1,
      observacion: "Segunda visita - Depto Miraflores",
    },
    {
      id: IDS.CITAS[2],
      idLead: IDS.LEADS[3],
      idPropiedad: IDS.PROPIEDADES[3],
      offsetDays: 3,
      durationHours: 1,
      observacion: "Primera visita - Local San Isidro",
    },
    {
      id: IDS.CITAS[3],
      idLead: IDS.LEADS[5],
      idPropiedad: IDS.PROPIEDADES[0],
      offsetDays: -1,
      durationHours: 1,
      observacion: "Visita realizada - Casa en Surco",
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
        ` VALUES (${escapeSql(c.idLead)}, ${escapeSql("CITA_AGENDADA")}, ${escapeSql(`Cita agendada: ${c.observacion}`)}, ${escapeSql(ahoraIso)});`,
    );
  }
  sqlLines.push("");

  // ── Contratos ──
  const contratosSeed = [
    { id: IDS.CONTRATOS[0], idLead: IDS.LEADS[0], idPropiedad: IDS.PROPIEDADES[0], meses: 12 },
    { id: IDS.CONTRATOS[1], idLead: IDS.LEADS[2], idPropiedad: IDS.PROPIEDADES[2], meses: 6 },
    { id: IDS.CONTRATOS[2], idLead: IDS.LEADS[3], idPropiedad: IDS.PROPIEDADES[3], meses: 24 },
  ];

  sqlLines.push("-- Contratos");
  for (const c of contratosSeed) {
    const fechaFin = new Date(ahora.getFullYear(), ahora.getMonth() + c.meses, ahora.getDate());
    sqlLines.push(
      `INSERT INTO ventas_contratos (id, id_lead, id_cliente, id_propiedad, fecha_inicio, fecha_fin, estado, creado_en, actualizado_en)` +
        ` VALUES (${escapeSql(c.id)}, ${escapeSql(c.idLead)}, NULL, ${escapeSql(c.idPropiedad)}, ${escapeSql(ahoraIso)}, ${escapeSql(fechaFin.toISOString())}, ${escapeSql("BORRADOR")}, ${escapeSql(ahoraIso)}, ${escapeSql(ahoraIso)})` +
        ` ON CONFLICT(id) DO UPDATE SET id_lead=excluded.id_lead, id_cliente=excluded.id_cliente, id_propiedad=excluded.id_propiedad, fecha_inicio=excluded.fecha_inicio, fecha_fin=excluded.fecha_fin, estado=excluded.estado, actualizado_en=excluded.actualizado_en;`,
    );
    sqlLines.push(
      `INSERT INTO ventas_actividad (id_lead, evento, descripcion, fecha)` +
        ` VALUES (${escapeSql(c.idLead)}, ${escapeSql("CONTRATO_CREADO")}, ${escapeSql(`Contrato ${c.id} creado vía seed`)}, ${escapeSql(ahoraIso)});`,
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
    {
      id: IDS.CLIENTES[1],
      nombre: "Pedro Sánchez (Cliente)",
      email: "pedro.cliente@example.com",
      telefono: "999777888",
      idAsesor: IDS.USUARIO_ASESOR2,
      idLeadOrigen: IDS.LEADS[3],
    },
    {
      id: IDS.CLIENTES[2],
      nombre: "Ana García (Cliente)",
      email: "ana.cliente@example.com",
      telefono: "999555666",
      idAsesor: IDS.USUARIO_ASESOR2,
      idLeadOrigen: IDS.LEADS[2],
    },
  ];

  sqlLines.push("-- Clientes");
  for (const cl of clientesSeed) {
    sqlLines.push(
      `INSERT INTO ventas_clientes (id, nombre, email, telefono, id_asesor, id_lead_origen, creado_en, actualizado_en)` +
        ` VALUES (${escapeSql(cl.id)}, ${escapeSql(cl.nombre)}, ${escapeSql(cl.email)}, ${escapeSql(cl.telefono)}, ${escapeSql(cl.idAsesor)}, ${escapeSql(cl.idLeadOrigen)}, ${escapeSql(ahoraIso)}, ${escapeSql(ahoraIso)})` +
        ` ON CONFLICT(id) DO UPDATE SET nombre=excluded.nombre, email=excluded.email, telefono=excluded.telefono, id_asesor=excluded.id_asesor, id_lead_origen=excluded.id_lead_origen, actualizado_en=excluded.actualizado_en;`,
    );
  }
  sqlLines.push("");

  const sqlContent = sqlLines.join("\n");
  fs.writeFileSync(path.join(process.cwd(), "apps/api/src/seed.sql"), sqlContent);
  fs.writeFileSync(path.join(process.cwd(), "seed.sql"), sqlContent);
  console.log("SQL seed files generated successfully in apps/api/src/seed.sql and seed.sql");
}

main();
