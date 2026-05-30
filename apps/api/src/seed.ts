// Seed programático usando repositorios y entidades de dominio.
// Útil para importar desde un wrangler entry point o tests.
// Para seed vía SQL directo (recomendado), usar:
//   npm run seed:generate    # genera apps/api/src/seed.sql
//   npm run seed:local       # ejecuta contra D1 local
//   npm run db:recreate:local  # reset + migrate + seed

import { Pbkdf2PasswordHasher } from "./lib/usuarios/infrastructure/security/Pbkdf2PasswordHasher";
import { D1UsuarioRepository } from "./lib/usuarios/infrastructure";
import { D1VentasRepository } from "./lib/ventas/infrastructure";
import { D1ContratoRepository } from "./lib/ventas/infrastructure";
import { D1PropiedadRepository } from "./lib/propiedades/infrastructure";
import { Usuario } from "./lib/usuarios/domain/entities";
import { Lead } from "./lib/ventas/domain/entities/Lead";
import { Cliente } from "./lib/ventas/domain/entities/Cliente";
import { Cita } from "./lib/ventas/domain/entities/Cita";
import { Contrato } from "./lib/ventas/domain/entities/Contrato";
import { Propiedad } from "./lib/propiedades/domain/entities";
import { EstadoLead } from "./lib/ventas/domain/value-objects/EstadoLead";
import { type D1DatabaseLike } from "./lib/shared/infrastructure";
import {
  idCita,
  idCliente,
  idContrato,
  idLead,
  idPropiedad,
} from "./lib/ventas/domain/value-objects/Ids";
import { idUsuarioRef } from "./lib/shared/domain/value-objects/IdUsuarioRef";

interface SeedEnv {
  DB: D1DatabaseLike;
  AUTH_PEPPER?: string;
}

export async function ejecutarSeed(env: SeedEnv): Promise<string[]> {
  const log: string[] = [];
  const push = (msg: string) => log.push(msg);

  const usuarioRepo = new D1UsuarioRepository(env.DB);
  const ventasRepo = new D1VentasRepository(env.DB);
  const contratoRepo = new D1ContratoRepository(env.DB);
  const propiedadRepo = new D1PropiedadRepository(env.DB);
  const hasher = new Pbkdf2PasswordHasher(env.AUTH_PEPPER);

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

  for (const u of usuariosSeed) {
    const existe = await usuarioRepo.existePorId(u.id);
    if (existe) {
      push(`  ↺ Usuario ${u.id} ya existe, se omite`);
      continue;
    }
    const hash = await hasher.hashear(u.clave);
    const usuario = Usuario.crear({
      id: u.id,
      username: u.username,
      nombre: u.nombre,
      hashClave: hash.valor,
      rol: u.rol,
    });
    await usuarioRepo.guardar(usuario);
    push(`  ✔ Usuario ${u.id} (${u.username})`);
  }

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

  for (const p of propiedadesSeed) {
    const existe = await propiedadRepo.existePorId(idPropiedad(p.id));
    if (existe) {
      push(`  ↺ Propiedad ${p.id} ya existe, se omite`);
      continue;
    }
    const prop = Propiedad.crear(p);
    await propiedadRepo.guardar(prop);
    push(`  ✔ Propiedad ${p.id} (${p.titulo})`);
  }

  // ── Leads ─────────────────────────────────────────────────
  const ahora = new Date();

  type LeadSeed = {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    tipo: string;
    idAsesor: string;
    idPropiedadInteres?: string;
    estadoOverride?: EstadoLead;
  };

  const leadsSeed: LeadSeed[] = [
    {
      id: "lead-001",
      nombre: "María Torres",
      email: "maria@example.com",
      telefono: "999111222",
      tipo: "COMPRA",
      idAsesor: "jramirez",
      idPropiedadInteres: "prop-001",
      estadoOverride: EstadoLead.desde("CONTACTO"),
    },
    {
      id: "lead-002",
      nombre: "Carlos López",
      email: "carlos@example.com",
      telefono: "999333444",
      tipo: "COMPRA",
      idAsesor: "jramirez",
      idPropiedadInteres: "prop-002",
    },
    {
      id: "lead-003",
      nombre: "Ana García",
      email: "ana@example.com",
      telefono: "999555666",
      tipo: "VENTA",
      idAsesor: "lmartinez",
      estadoOverride: EstadoLead.desde("TRABAJANDO"),
    },
    {
      id: "lead-004",
      nombre: "Pedro Sánchez",
      email: "pedro@example.com",
      telefono: "999777888",
      tipo: "COMPRA",
      idAsesor: "lmartinez",
      idPropiedadInteres: "prop-004",
    },
    {
      id: "lead-005",
      nombre: "Sofía Díaz",
      email: "sofia@example.com",
      telefono: "999000111",
      tipo: "VENTA",
      idAsesor: "jramirez",
    },
    {
      id: "lead-006",
      nombre: "Ricardo Mendoza",
      email: "ricardo@example.com",
      telefono: "999222333",
      tipo: "COMPRA",
      idAsesor: "jramirez",
      idPropiedadInteres: "prop-001",
    },
    {
      id: "lead-007",
      nombre: "Carmen Flores",
      email: "carmen@example.com",
      telefono: "999444555",
      tipo: "VENTA",
      idAsesor: "lmartinez",
    },
    {
      id: "lead-008",
      nombre: "Diego Castillo",
      email: "diego@example.com",
      telefono: "999666777",
      tipo: "COMPRA",
      idAsesor: "jramirez",
    },
    {
      id: "lead-009",
      nombre: "Valeria Ríos",
      email: "valeria@example.com",
      telefono: "999888999",
      tipo: "VENTA",
      idAsesor: "lmartinez",
      estadoOverride: EstadoLead.desde("PERDIDO"),
    },
  ];

  for (const l of leadsSeed) {
    const idL = idLead(l.id);
    const leadExistente = await ventasRepo.obtenerLeadPorId(idL);
    if (leadExistente) {
      push(`  ↺ Lead ${l.id} ya existe, se omite`);
      continue;
    }
    const lead = Lead.registrar({
      id: l.id,
      nombre: l.nombre,
      email: l.email,
      telefono: l.telefono,
      tipo: l.tipo,
      idAsesor: l.idAsesor,
      idPropiedadInteres: l.idPropiedadInteres,
    });

    if (l.estadoOverride) {
      lead.cambiarEstado(l.estadoOverride.valor);
    }

    await ventasRepo.guardarLead(lead);
    await ventasRepo.registrarActividad(idL, "LEAD_CREADO", "Lead registrado vía seed");
    push(`  ✔ Lead ${l.id} (${l.nombre})`);
  }

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

  for (const p of preliminaresSeed) {
    const existe = await propiedadRepo.existePorId(idPropiedad(p.id));
    if (existe) {
      push(`  ↺ Propiedad preliminar ${p.id} ya existe, se omite`);
      continue;
    }
    const prop = Propiedad.crear({
      id: p.id,
      titulo: p.titulo,
      descripcion: p.descripcion,
      precio: p.precio,
      estado: "BORRADOR",
      idLeadOrigen: p.idLead,
    });
    await propiedadRepo.guardar(prop);
    push(`  ✔ Propiedad preliminar ${p.id} (${p.titulo})`);
  }

  // ── Citas ─────────────────────────────────────────────────
  const citasSeed = [
    {
      id: "cita-001",
      idLead: "lead-001",
      idPropiedad: "prop-001",
      fechaInicio: new Date(ahora.getTime() + 86400000),
      fechaFin: new Date(ahora.getTime() + 86400000 + 3600000),
      observacion: "Primera visita - Casa en Surco",
    },
    {
      id: "cita-002",
      idLead: "lead-002",
      idPropiedad: "prop-002",
      fechaInicio: new Date(ahora.getTime() + 172800000),
      fechaFin: new Date(ahora.getTime() + 172800000 + 3600000),
      observacion: "Segunda visita - Depto Miraflores",
    },
    {
      id: "cita-003",
      idLead: "lead-004",
      idPropiedad: "prop-004",
      fechaInicio: new Date(ahora.getTime() + 259200000),
      fechaFin: new Date(ahora.getTime() + 259200000 + 3600000),
      observacion: "Primera visita - Local San Isidro",
    },
    {
      id: "cita-004",
      idLead: "lead-006",
      idPropiedad: "prop-001",
      fechaInicio: new Date(ahora.getTime() - 86400000),
      fechaFin: new Date(ahora.getTime() - 86400000 + 3600000),
      observacion: "Visita realizada - Casa en Surco",
    },
  ];

  for (const c of citasSeed) {
    const lead = await ventasRepo.obtenerLeadPorId(idLead(c.idLead));
    if (!lead) {
      push(`  ✗ Lead ${c.idLead} no encontrado para cita ${c.id}`);
      continue;
    }
    if (lead.obtenerCitaPorId(idCita(c.id))) {
      push(`  ↺ Cita ${c.id} ya existe en lead ${c.idLead}`);
      continue;
    }
    const cita = Cita.crear({
      id: idCita(c.id),
      idLead: idLead(c.idLead),
      idPropiedad: c.idPropiedad ? idPropiedad(c.idPropiedad) : undefined,
      fechaInicio: c.fechaInicio,
      fechaFin: c.fechaFin,
      observacion: c.observacion,
    });
    lead.agendarCita(cita);
    await ventasRepo.guardarLead(lead);
    await ventasRepo.registrarActividad(
      idLead(c.idLead),
      "CITA_AGENDADA",
      `Cita agendada: ${c.observacion}`,
    );
    push(`  ✔ Cita ${c.id} para lead ${c.idLead}`);
  }

  // ── Contratos ─────────────────────────────────────────────
  const contratosSeed = [
    { id: "contrato-001", idLead: "lead-001", idPropiedad: "prop-001", meses: 12 },
    { id: "contrato-002", idLead: "lead-003", idPropiedad: "prop-003", meses: 6 },
    { id: "contrato-003", idLead: "lead-004", idPropiedad: "prop-004", meses: 24 },
  ];

  for (const c of contratosSeed) {
    const existe = await contratoRepo.buscarPorId(idContrato(c.id));
    if (existe) {
      push(`  ↺ Contrato ${c.id} ya existe, se omite`);
      continue;
    }
    const fechaInicio = new Date();
    const fechaFin = new Date(
      fechaInicio.getFullYear(),
      fechaInicio.getMonth() + c.meses,
      fechaInicio.getDate(),
    );
    const contrato = Contrato.crear({
      id: idContrato(c.id),
      idLead: idLead(c.idLead),
      idPropiedad: idPropiedad(c.idPropiedad),
      fechaInicio,
      fechaFin,
    });
    await contratoRepo.guardar(contrato);
    await ventasRepo.registrarActividad(
      idLead(c.idLead),
      "CONTRATO_CREADO",
      `Contrato ${c.id} creado vía seed`,
    );
    push(`  ✔ Contrato ${c.id} (lead ${c.idLead})`);
  }

  // ── Clientes (algunos leads convertidos) ──────────────────
  const clientesSeed = [
    {
      id: "cliente-001",
      nombre: "María Torres (Cliente)",
      email: "maria.cliente@example.com",
      telefono: "999111222",
      idAsesor: idUsuarioRef("jramirez"),
      idLeadOrigen: idLead("lead-001"),
    },
    {
      id: "cliente-002",
      nombre: "Pedro Sánchez (Cliente)",
      email: "pedro.cliente@example.com",
      telefono: "999777888",
      idAsesor: idUsuarioRef("lmartinez"),
      idLeadOrigen: idLead("lead-004"),
    },
    {
      id: "cliente-003",
      nombre: "Ana García (Cliente)",
      email: "ana.cliente@example.com",
      telefono: "999555666",
      idAsesor: idUsuarioRef("lmartinez"),
      idLeadOrigen: idLead("lead-003"),
    },
  ];

  for (const cl of clientesSeed) {
    const existe = await ventasRepo.obtenerClientePorId(idCliente(cl.id));
    if (existe) {
      push(`  ↺ Cliente ${cl.id} ya existe, se omite`);
      continue;
    }
    const cliente = Cliente.crear(cl);
    await ventasRepo.guardarCliente(cliente);
    push(`  ✔ Cliente ${cl.id} (${cl.nombre})`);
  }

  return log;
}
