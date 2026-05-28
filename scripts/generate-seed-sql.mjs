import fs from "fs";
import path from "path";

const ITERACIONES_PBKDF2 = 100_000;
const LARGO_HASH_BYTES = 32;
const LARGO_SALT_BYTES = 16;

const aBase64Url = (bytes) =>
  Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

async function hashearClave(clavePlana, pepper) {
  const claveNormalizada = clavePlana.trim();
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

const escapeSql = (value) => {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
};

async function main() {
  const pepper = "20fa23043ee3167d78a65ed110d9fccdf4b7478804f930c9965d0363bae3ecf2";
  const ahora = new Date();
  const ahoraIso = ahora.toISOString();

  const sqlLines = [];

  sqlLines.push("-- Seed data generated from seed.ts");
  sqlLines.push("");

  // ── Usuarios ──────────────────────────────────────────────
  const usuariosSeed = [
    { id: "admin", username: "admin", nombre: "Admin ALVAS", clave: "admin123", rol: "ADMIN" },
    {
      id: "jramirez",
      username: "jramirez",
      nombre: "Juan Ramírez",
      clave: "asesor123",
      rol: "ASESOR",
    },
    {
      id: "lmartinez",
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

  // ── Propiedades ───────────────────────────────────────────
  const propiedadesSeed = [
    {
      id: "prop-001",
      titulo: "Casa en Surco",
      descripcion: "Casa de 3 dormitorios con jardín y piscina",
      precio: 350000,
    },
    {
      id: "prop-002",
      titulo: "Departamento en Miraflores",
      descripcion: "Departamento de 2 dormitorios frente al malecón",
      precio: 280000,
    },
    {
      id: "prop-003",
      titulo: "Terreno en San Bartolo",
      descripcion: "Terreno de 500m² con vista al mar",
      precio: 180000,
    },
    {
      id: "prop-004",
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

  // ── Leads ─────────────────────────────────────────────────
  const leadsSeed = [
    {
      id: "lead-001",
      nombre: "María Torres",
      email: "maria@example.com",
      telefono: "999111222",
      tipo: "COMPRA",
      idAsesor: "jramirez",
      idPropiedadInteres: "prop-001",
      estadoOverride: "CONTACTO",
    },
    {
      id: "lead-002",
      nombre: "Carlos López",
      email: "carlos@example.com",
      telefono: "999333444",
      tipo: "COMPRA",
      idAsesor: "jramirez",
      idPropiedadInteres: "prop-002",
      estadoOverride: "NUEVO",
    },
    {
      id: "lead-003",
      nombre: "Ana García",
      email: "ana@example.com",
      telefono: "999555666",
      tipo: "VENTA",
      idAsesor: "lmartinez",
      estadoOverride: "TRABAJANDO",
    },
    {
      id: "lead-004",
      nombre: "Pedro Sánchez",
      email: "pedro@example.com",
      telefono: "999777888",
      tipo: "COMPRA",
      idAsesor: "lmartinez",
      idPropiedadInteres: "prop-004",
      estadoOverride: "NUEVO",
    },
    {
      id: "lead-005",
      nombre: "Sofía Díaz",
      email: "sofia@example.com",
      telefono: "999000111",
      tipo: "VENTA",
      idAsesor: "jramirez",
      estadoOverride: "NUEVO",
    },
    {
      id: "lead-006",
      nombre: "Ricardo Mendoza",
      email: "ricardo@example.com",
      telefono: "999222333",
      tipo: "COMPRA",
      idAsesor: "jramirez",
      idPropiedadInteres: "prop-001",
      estadoOverride: "NUEVO",
    },
    {
      id: "lead-007",
      nombre: "Carmen Flores",
      email: "carmen@example.com",
      telefono: "999444555",
      tipo: "VENTA",
      idAsesor: "lmartinez",
      estadoOverride: "NUEVO",
    },
    {
      id: "lead-008",
      nombre: "Diego Castillo",
      email: "diego@example.com",
      telefono: "999666777",
      tipo: "COMPRA",
      idAsesor: "jramirez",
      estadoOverride: "NUEVO",
    },
    {
      id: "lead-009",
      nombre: "Valeria Ríos",
      email: "valeria@example.com",
      telefono: "999888999",
      tipo: "VENTA",
      idAsesor: "lmartinez",
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

  // ── Actividad inicial para Leads ──────────────────────────
  sqlLines.push("-- Actividades de Leads");
  for (const l of leadsSeed) {
    sqlLines.push(
      `INSERT INTO ventas_actividad (id_lead, evento, descripcion, fecha)` +
        ` VALUES (${escapeSql(l.id)}, ${escapeSql("LEAD_CREADO")}, ${escapeSql("Lead registrado vía seed")}, ${escapeSql(ahoraIso)});`,
    );
  }
  sqlLines.push("");

  // ── Propiedades BORRADOR para leads vendedor ───────────
  const preliminaresSeed = [
    {
      id: "prop-prel-001",
      idLead: "lead-003",
      titulo: "Casa en La Molina (Venta - Ana García)",
      descripcion: "Casa de 4 dormitorios con amplio jardín",
      precio: 520000,
    },
    {
      id: "prop-prel-002",
      idLead: "lead-005",
      titulo: "Departamento en Barranco (Venta - Sofía Díaz)",
      descripcion: "Departamento de 3 dormitorios con terraza",
      precio: 380000,
    },
    {
      id: "prop-prel-003",
      idLead: "lead-007",
      titulo: "Casa en Chorrillos (Venta - Carmen Flores)",
      descripcion: "Casa de 2 dormitorios cerca al malecón",
      precio: 250000,
    },
  ];

  sqlLines.push("-- Propiedades Borrador (Preliminares)");
  for (const p of preliminaresSeed) {
    sqlLines.push(
      `INSERT INTO propiedades (id, titulo, descripcion, precio, origen, estado, id_lead_origen, id_cliente_propietario, captada_por_asesor_id, asesor_responsable_id, creado_en, actualizado_en)` +
        ` VALUES (${escapeSql(p.id)}, ${escapeSql(p.titulo)}, ${escapeSql(p.descripcion)}, ${p.precio}, ${escapeSql("ALVAS")}, ${escapeSql("BORRADOR")}, ${escapeSql(p.idLead)}, NULL, NULL, NULL, ${escapeSql(ahoraIso)}, ${escapeSql(ahoraIso)})` +
        ` ON CONFLICT(id) DO UPDATE SET titulo=excluded.titulo, descripcion=excluded.descripcion, precio=excluded.precio, origen=excluded.origen, estado=excluded.estado, id_lead_origen=excluded.id_lead_origen, actualizado_en=excluded.actualizado_en;`,
    );
  }
  sqlLines.push("");

  // ── Citas ─────────────────────────────────────────────────
  const citasSeed = [
    {
      id: "cita-001",
      idLead: "lead-001",
      idPropiedad: "prop-001",
      offsetDays: 1,
      durationHours: 1,
      observacion: "Primera visita - Casa en Surco",
    },
    {
      id: "cita-002",
      idLead: "lead-002",
      idPropiedad: "prop-002",
      offsetDays: 2,
      durationHours: 1,
      observacion: "Segunda visita - Depto Miraflores",
    },
    {
      id: "cita-003",
      idLead: "lead-004",
      idPropiedad: "prop-004",
      offsetDays: 3,
      durationHours: 1,
      observacion: "Primera visita - Local San Isidro",
    },
    {
      id: "cita-004",
      idLead: "lead-006",
      idPropiedad: "prop-001",
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

  // ── Contratos ─────────────────────────────────────────────
  const contratosSeed = [
    { id: "contrato-001", idLead: "lead-001", idPropiedad: "prop-001", meses: 12 },
    { id: "contrato-002", idLead: "lead-003", idPropiedad: "prop-003", meses: 6 },
    { id: "contrato-003", idLead: "lead-004", idPropiedad: "prop-004", meses: 24 },
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

  // ── Clientes ──────────────────────────────────────────────
  const clientesSeed = [
    {
      id: "cliente-001",
      nombre: "María Torres (Cliente)",
      email: "maria.cliente@example.com",
      telefono: "999111222",
      idAsesor: "jramirez",
      idLeadOrigen: "lead-001",
    },
    {
      id: "cliente-002",
      nombre: "Pedro Sánchez (Cliente)",
      email: "pedro.cliente@example.com",
      telefono: "999777888",
      idAsesor: "lmartinez",
      idLeadOrigen: "lead-004",
    },
    {
      id: "cliente-003",
      nombre: "Ana García (Cliente)",
      email: "ana.cliente@example.com",
      telefono: "999555666",
      idAsesor: "lmartinez",
      idLeadOrigen: "lead-003",
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

main().catch(console.error);
