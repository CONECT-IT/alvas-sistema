import { describe, expect, it } from "bun:test";

type LeadPipelineContract = Readonly<{
  id: string;
  nombre: string;
  estado: "NUEVO" | "CONTACTO" | "AGENDADO" | "TRABAJANDO" | "CONVERTIDO" | "PERDIDO";
  tipo: "COMPRA" | "VENTA";
  idAsesor?: string;
  nombreAsesor?: string;
  citasCount: number;
  citas: ReadonlyArray<{
    id: string;
    idLead: string;
    idPropiedad?: string;
    fechaInicio: string;
    fechaFin: string;
    estado: "PENDIENTE" | "REALIZADA" | "CANCELADA" | "REPROGRAMADA";
    observacion?: string;
  }>;
}>;

type UsuarioRespuestaContract = Readonly<{
  id: string;
  username: string;
  nombre: string;
  rol: "ADMIN" | "ASESOR";
  estado: "ACTIVO" | "DESHABILITADO";
}>;

type SesionContract = Readonly<{
  authToken: string;
  refreshToken: string;
  usuario: UsuarioRespuestaContract;
}>;

type PropiedadContract = Readonly<{
  id: string;
  titulo: string;
  descripcion?: string;
  precio: number;
  origen: "ALVAS" | "CLIENTE";
  estado: "BORRADOR" | "DISPONIBLE" | "RESERVADA" | "VENDIDA" | "ARCHIVADA";
  idLeadOrigen?: string;
  idClientePropietario?: string;
  captadaPorAsesorId?: string;
  asesorResponsableId?: string;
}>;

type CaptacionProcesadaContract = Readonly<{
  idLead: string;
  idPropiedadPreliminar?: string;
}>;

type CaptacionPendienteContract = Readonly<{
  id: string;
  canal: "WHATSAPP" | "FORMULARIO_WEB" | "LANDING" | "REFERIDO";
  origen: string;
  nombre: string;
  telefono: string;
  email: string;
  tipo: "COMPRA" | "VENTA" | "CAPTACION";
  estado: "PENDIENTE" | "REVISADA" | "DUPLICADA" | "CONVERTIDA" | "RECHAZADA";
  idPropiedadInteres?: string;
  metadata?: Readonly<Record<string, string>>;
  razonDuplicado?: string;
  creadoEn: string;
  actualizadoEn: string;
}>;

type ReporteGeneralContract = Readonly<{
  fechaGeneracion: string;
  metricas: Readonly<{
    conversionRate: number;
    leadsNuevosHoy: number;
    citasPendientes: number;
  }>;
  actividadReciente: ReadonlyArray<{
    idLead: string;
    evento: string;
    descripcion: string;
    fecha: string;
  }>;
}>;

type EstadisticasGlobalesContract = Readonly<{
  totalLeads: number;
  totalClientes: number;
  leadsPorEstado: Readonly<Record<string, number>>;
  asesoresActivos: number;
}>;

function esLeadPipelineContract(value: unknown): value is LeadPipelineContract {
  if (!value || typeof value !== "object") return false;
  const lead = value as Record<string, unknown>;
  return (
    typeof lead.id === "string" &&
    typeof lead.nombre === "string" &&
    ["NUEVO", "CONTACTO", "AGENDADO", "TRABAJANDO", "CONVERTIDO", "PERDIDO"].includes(
      String(lead.estado),
    ) &&
    ["COMPRA", "VENTA"].includes(String(lead.tipo)) &&
    typeof lead.citasCount === "number" &&
    Array.isArray(lead.citas)
  );
}

function esUsuarioRespuestaContract(value: unknown): value is UsuarioRespuestaContract {
  if (!value || typeof value !== "object") return false;
  const usuario = value as Record<string, unknown>;
  const clavesPermitidas = ["id", "username", "nombre", "rol", "estado"];
  return (
    Object.keys(usuario).every((key) => clavesPermitidas.includes(key)) &&
    typeof usuario.id === "string" &&
    typeof usuario.username === "string" &&
    typeof usuario.nombre === "string" &&
    ["ADMIN", "ASESOR"].includes(String(usuario.rol)) &&
    ["ACTIVO", "DESHABILITADO"].includes(String(usuario.estado))
  );
}

function esSesionContract(value: unknown): value is SesionContract {
  if (!value || typeof value !== "object") return false;
  const sesion = value as Record<string, unknown>;
  return (
    Object.keys(sesion).every((key) => ["authToken", "refreshToken", "usuario"].includes(key)) &&
    typeof sesion.authToken === "string" &&
    typeof sesion.refreshToken === "string" &&
    esUsuarioRespuestaContract(sesion.usuario)
  );
}

function esPropiedadContract(value: unknown): value is PropiedadContract {
  if (!value || typeof value !== "object") return false;
  const propiedad = value as Record<string, unknown>;
  const clavesPermitidas = [
    "id",
    "titulo",
    "descripcion",
    "precio",
    "origen",
    "estado",
    "idLeadOrigen",
    "idClientePropietario",
    "captadaPorAsesorId",
    "asesorResponsableId",
  ];
  return (
    Object.keys(propiedad).every((key) => clavesPermitidas.includes(key)) &&
    typeof propiedad.id === "string" &&
    typeof propiedad.titulo === "string" &&
    typeof propiedad.precio === "number" &&
    ["ALVAS", "CLIENTE"].includes(String(propiedad.origen)) &&
    ["BORRADOR", "DISPONIBLE", "RESERVADA", "VENDIDA", "ARCHIVADA"].includes(
      String(propiedad.estado),
    )
  );
}

function esCaptacionProcesadaContract(value: unknown): value is CaptacionProcesadaContract {
  if (!value || typeof value !== "object") return false;
  const captacion = value as Record<string, unknown>;
  return (
    Object.keys(captacion).every((key) => ["idLead", "idPropiedadPreliminar"].includes(key)) &&
    typeof captacion.idLead === "string" &&
    (captacion.idPropiedadPreliminar === undefined ||
      typeof captacion.idPropiedadPreliminar === "string")
  );
}

function esCaptacionPendienteContract(value: unknown): value is CaptacionPendienteContract {
  if (!value || typeof value !== "object") return false;
  const captacion = value as Record<string, unknown>;
  const clavesPermitidas = [
    "id",
    "canal",
    "origen",
    "nombre",
    "telefono",
    "email",
    "tipo",
    "estado",
    "idPropiedadInteres",
    "metadata",
    "razonDuplicado",
    "creadoEn",
    "actualizadoEn",
  ];

  return (
    Object.keys(captacion).every((key) => clavesPermitidas.includes(key)) &&
    typeof captacion.id === "string" &&
    ["WHATSAPP", "FORMULARIO_WEB", "LANDING", "REFERIDO"].includes(String(captacion.canal)) &&
    typeof captacion.origen === "string" &&
    typeof captacion.nombre === "string" &&
    typeof captacion.telefono === "string" &&
    typeof captacion.email === "string" &&
    ["COMPRA", "VENTA", "CAPTACION"].includes(String(captacion.tipo)) &&
    ["PENDIENTE", "REVISADA", "DUPLICADA", "CONVERTIDA", "RECHAZADA"].includes(
      String(captacion.estado),
    ) &&
    typeof captacion.creadoEn === "string" &&
    !Number.isNaN(Date.parse(captacion.creadoEn)) &&
    typeof captacion.actualizadoEn === "string" &&
    !Number.isNaN(Date.parse(captacion.actualizadoEn))
  );
}

function esReporteGeneralContract(value: unknown): value is ReporteGeneralContract {
  if (!value || typeof value !== "object") return false;
  const reporte = value as Record<string, unknown>;
  const metricas = reporte.metricas as Record<string, unknown> | undefined;
  return (
    Object.keys(reporte).every((key) =>
      ["fechaGeneracion", "metricas", "actividadReciente"].includes(key),
    ) &&
    typeof reporte.fechaGeneracion === "string" &&
    !Number.isNaN(Date.parse(reporte.fechaGeneracion)) &&
    !!metricas &&
    typeof metricas.conversionRate === "number" &&
    typeof metricas.leadsNuevosHoy === "number" &&
    typeof metricas.citasPendientes === "number" &&
    Array.isArray(reporte.actividadReciente) &&
    reporte.actividadReciente.every((item) => {
      if (!item || typeof item !== "object") return false;
      const actividad = item as Record<string, unknown>;
      return (
        typeof actividad.idLead === "string" &&
        typeof actividad.evento === "string" &&
        typeof actividad.descripcion === "string" &&
        typeof actividad.fecha === "string" &&
        !Number.isNaN(Date.parse(actividad.fecha))
      );
    })
  );
}

function esEstadisticasGlobalesContract(value: unknown): value is EstadisticasGlobalesContract {
  if (!value || typeof value !== "object") return false;
  const estadisticas = value as Record<string, unknown>;
  return (
    Object.keys(estadisticas).every((key) =>
      ["totalLeads", "totalClientes", "leadsPorEstado", "asesoresActivos"].includes(key),
    ) &&
    typeof estadisticas.totalLeads === "number" &&
    typeof estadisticas.totalClientes === "number" &&
    !!estadisticas.leadsPorEstado &&
    typeof estadisticas.leadsPorEstado === "object" &&
    Object.values(estadisticas.leadsPorEstado).every((valor) => typeof valor === "number") &&
    typeof estadisticas.asesoresActivos === "number"
  );
}

describe("contract / api-web", () => {
  it("mantiene estable el contrato serializado de sesion auth", () => {
    const payload = {
      authToken: "auth-token",
      refreshToken: "refresh-token",
      usuario: {
        id: "usuario-1",
        username: "asesor",
        nombre: "Luis Asesor",
        rol: "ASESOR",
        estado: "ACTIVO",
      },
    };

    expect(esSesionContract(payload)).toBe(true);
  });

  it("rechaza sesion auth si filtra credenciales internas", () => {
    const payload = {
      authToken: "auth-token",
      refreshToken: "refresh-token",
      usuario: {
        id: "usuario-1",
        username: "asesor",
        nombre: "Luis Asesor",
        rol: "ASESOR",
        estado: "ACTIVO",
        hashClave: "no-debe-salir",
      },
    };

    expect(esSesionContract(payload)).toBe(false);
  });

  it("mantiene estable el contrato serializado del pipeline de leads", () => {
    const payload = {
      id: "lead-1",
      nombre: "Ana Vendedora",
      estado: "NUEVO",
      tipo: "VENTA",
      idAsesor: "asesor-1",
      nombreAsesor: "Luis Asesor",
      citasCount: 1,
      citas: [
        {
          id: "cita-1",
          idLead: "lead-1",
          fechaInicio: "2026-05-23T14:00:00.000Z",
          fechaFin: "2026-05-23T15:00:00.000Z",
          estado: "PENDIENTE",
        },
      ],
    };

    expect(esLeadPipelineContract(payload)).toBe(true);
  });

  it("rechaza estados de lead fuera del lenguaje ubicuo acordado con la web", () => {
    const payload = {
      id: "lead-1",
      nombre: "Ana Vendedora",
      estado: "EN_REVISION",
      tipo: "VENTA",
      citasCount: 0,
      citas: [],
    };

    expect(esLeadPipelineContract(payload)).toBe(false);
  });

  it("impide que el contrato de usuario exponga campos sensibles", () => {
    const payload = {
      id: "usuario-1",
      username: "asesor",
      nombre: "Asesor Uno",
      rol: "ASESOR",
      estado: "ACTIVO",
      hashClave: "no-debe-salir",
    };

    expect(esUsuarioRespuestaContract(payload)).toBe(false);
  });

  it("mantiene estable el contrato serializado de propiedad disponible", () => {
    const payload = {
      id: "propiedad-1",
      titulo: "Casa disponible",
      descripcion: "Casa de cliente vendedor con contrato",
      precio: 120000,
      origen: "CLIENTE",
      estado: "DISPONIBLE",
      idLeadOrigen: "lead-1",
      idClientePropietario: "cliente-1",
      captadaPorAsesorId: "asesor-1",
      asesorResponsableId: "asesor-1",
    };

    expect(esPropiedadContract(payload)).toBe(true);
  });

  it("acepta el catalogo completo de estados comerciales de propiedad", () => {
    const estados = ["BORRADOR", "DISPONIBLE", "RESERVADA", "VENDIDA", "ARCHIVADA"] as const;

    for (const estado of estados) {
      expect(
        esPropiedadContract({
          id: `propiedad-${estado.toLowerCase()}`,
          titulo: `Propiedad ${estado}`,
          precio: 120000,
          origen: "CLIENTE",
          estado,
        }),
      ).toBe(true);
    }
  });

  it("rechaza propiedades con estado fuera del catalogo acordado con la web", () => {
    const payload = {
      id: "propiedad-1",
      titulo: "Casa disponible",
      precio: 120000,
      origen: "CLIENTE",
      estado: "EN_NEGOCIACION",
    };

    expect(esPropiedadContract(payload)).toBe(false);
  });

  it("rechaza estados legados de propiedad fuera del lenguaje ubicuo actual", () => {
    const estadosLegados = ["PRELIMINAR", "EN_VALIDACION", "DESCARTADA", "INACTIVA"] as const;

    for (const estado of estadosLegados) {
      expect(
        esPropiedadContract({
          id: `propiedad-${estado.toLowerCase()}`,
          titulo: `Propiedad ${estado}`,
          precio: 120000,
          origen: "CLIENTE",
          estado,
        }),
      ).toBe(false);
    }
  });

  it("mantiene estable el contrato serializado de captacion procesada", () => {
    const payload = {
      idLead: "lead-captacion-1",
      idPropiedadPreliminar: "propiedad-preliminar-1",
    };

    expect(esCaptacionProcesadaContract(payload)).toBe(true);
  });

  it("mantiene estable el contrato serializado de captacion pendiente de WhatsApp", () => {
    const payload = {
      id: "captacion-1",
      canal: "WHATSAPP",
      origen: "whatsapp_webhook",
      nombre: "Carlos Comprador",
      telefono: "59170000002",
      email: "59170000002@contacto.whatsapp.local",
      tipo: "COMPRA",
      estado: "PENDIENTE",
      idPropiedadInteres: "propiedad-1",
      metadata: { canal: "whatsapp" },
      creadoEn: "2026-05-24T04:00:00.000Z",
      actualizadoEn: "2026-05-24T04:00:00.000Z",
    };

    expect(esCaptacionPendienteContract(payload)).toBe(true);
  });

  it("rechaza captacion procesada si expone datos crudos de contacto", () => {
    const payload = {
      idLead: "lead-captacion-1",
      telefono: "+59170000001",
      email: "ana@example.com",
    };

    expect(esCaptacionProcesadaContract(payload)).toBe(false);
  });

  it("mantiene estable el contrato serializado de reporte general", () => {
    const payload = {
      fechaGeneracion: "2026-05-23T10:00:00.000Z",
      metricas: {
        conversionRate: 35,
        leadsNuevosHoy: 4,
        citasPendientes: 2,
      },
      actividadReciente: [
        {
          idLead: "lead-1",
          evento: "CITA_AGENDADA",
          descripcion: "Cita comercial agendada",
          fecha: "2026-05-23T09:00:00.000Z",
        },
      ],
    };

    expect(esReporteGeneralContract(payload)).toBe(true);
  });

  it("mantiene estable el contrato serializado de estadisticas globales", () => {
    const payload = {
      totalLeads: 12,
      totalClientes: 5,
      leadsPorEstado: {
        NUEVO: 4,
        CONVERTIDO: 5,
      },
      asesoresActivos: 3,
    };

    expect(esEstadisticasGlobalesContract(payload)).toBe(true);
  });
});
