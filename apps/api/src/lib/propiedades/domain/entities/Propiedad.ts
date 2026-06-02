import { idPropiedad, type IdPropiedad, type IdUsuarioRef } from "../value-objects";
import { EstadoPropiedad } from "../value-objects/EstadoPropiedad";
import { PropiedadError } from "../errors/PropiedadError";

/**
 * Origen comercial permitido para una propiedad dentro del inventario ALVAS.
 *
 * - `ALVAS`: inventario registrado directamente por administracion.
 * - `CLIENTE`: propiedad vinculada a un cliente propietario.
 * - `CAPTACION`: propiedad nacida desde una captacion o lead vendedor.
 */
export const ORIGENES_PROPIEDAD = ["ALVAS", "CLIENTE", "CAPTACION"] as const;
export type OrigenPropiedad = (typeof ORIGENES_PROPIEDAD)[number];

type PropsPropiedad = {
  id: IdPropiedad;
  titulo: string;
  descripcion: string;
  precio: number;
  origen: OrigenPropiedad;
  estado: EstadoPropiedad;
  idLeadOrigen?: string;
  idClientePropietario?: string;
  captadaPorAsesorId?: IdUsuarioRef;
  asesorResponsableId?: IdUsuarioRef;
  creadoEn: Date;
  actualizadoEn: Date;
};

type DatosPropiedad = {
  titulo?: string;
  descripcion?: string;
  precio?: number;
  estado?: string;
  idClientePropietario?: string;
  asesorResponsableId?: string;
};

const normalizarOrigen = (valor?: string): OrigenPropiedad => {
  const normalizado = (valor ?? "ALVAS").trim().toUpperCase();
  if (!ORIGENES_PROPIEDAD.includes(normalizado as OrigenPropiedad)) {
    throw new PropiedadError("El origen de la propiedad no es valido.", "ORIGEN_INVALIDO");
  }
  return normalizado as OrigenPropiedad;
};

const textoOpcional = (valor?: string): string | undefined => valor?.trim() || undefined;

/**
 * Aggregate root del modulo Propiedades.
 *
 * Representa un bien inmobiliario gestionado por ALVAS. Centraliza el estado
 * comercial, el origen del inventario y la relacion con lead, cliente o asesor
 * responsable. Las reglas de visibilidad y permisos se aplican desde casos de
 * uso, pero esta entidad mantiene invariantes propios como origen valido,
 * titulo obligatorio y precio no negativo.
 *
 * @group Entidades
 */
export class Propiedad {
  private props: PropsPropiedad;

  private constructor(props: PropsPropiedad) {
    this.props = props;
  }

  /**
   * Crea una propiedad nueva desde datos de entrada normalizados por la capa de aplicacion.
   *
   * Si no se indica origen, se asume `ALVAS`. Si no se indica estado, se asume
   * `DISPONIBLE`. Los identificadores opcionales vacios se limpian a `undefined`.
   */
  static crear(params: {
    id: string;
    titulo: string;
    descripcion: string;
    precio: number;
    origen?: string;
    estado?: string;
    idLeadOrigen?: string;
    idClientePropietario?: string;
    captadaPorAsesorId?: string;
    asesorResponsableId?: string;
  }): Propiedad {
    const ahora = new Date();
    return new Propiedad({
      id: idPropiedad(params.id),
      titulo: params.titulo.trim(),
      descripcion: params.descripcion.trim(),
      precio: params.precio,
      origen: normalizarOrigen(params.origen),
      estado: EstadoPropiedad.desde(params.estado ?? "DISPONIBLE"),
      idLeadOrigen: textoOpcional(params.idLeadOrigen),
      idClientePropietario: textoOpcional(params.idClientePropietario),
      captadaPorAsesorId: params.captadaPorAsesorId
        ? (textoOpcional(params.captadaPorAsesorId) as IdUsuarioRef)
        : undefined,
      asesorResponsableId: params.asesorResponsableId
        ? (textoOpcional(params.asesorResponsableId) as IdUsuarioRef)
        : undefined,
      creadoEn: ahora,
      actualizadoEn: ahora,
    });
  }

  /**
   * Reconstituye una propiedad existente desde persistencia sin alterar fechas ni estado.
   */
  static reconstituir(props: PropsPropiedad): Propiedad {
    return new Propiedad(props);
  }

  get id(): IdPropiedad {
    return this.props.id;
  }
  get titulo(): string {
    return this.props.titulo;
  }
  get descripcion(): string {
    return this.props.descripcion;
  }
  get precio(): number {
    return this.props.precio;
  }
  get origen(): OrigenPropiedad {
    return this.props.origen;
  }
  get estado(): EstadoPropiedad {
    return this.props.estado;
  }
  get idLeadOrigen(): string | undefined {
    return this.props.idLeadOrigen;
  }
  get idClientePropietario(): string | undefined {
    return this.props.idClientePropietario;
  }
  get captadaPorAsesorId(): IdUsuarioRef | undefined {
    return this.props.captadaPorAsesorId;
  }
  get asesorResponsableId(): IdUsuarioRef | undefined {
    return this.props.asesorResponsableId;
  }
  get creadoEn(): Date {
    return this.props.creadoEn;
  }
  get actualizadoEn(): Date {
    return this.props.actualizadoEn;
  }

  /**
   * Actualiza datos comerciales manteniendo invariantes del agregado.
   *
   * Solo modifica campos presentes. Un titulo vacio o precio negativo produce
   * `PropiedadError`, porque dejaria la ficha comercial en un estado invalido.
   *
   * @param datos - Campos opcionales a modificar.
   * @throws {PropiedadError} Si titulo vacio o precio negativo.
   */
  actualizar(datos: DatosPropiedad): void {
    if (datos.titulo !== undefined) {
      const titulo = datos.titulo.trim();
      if (!titulo) {
        throw new PropiedadError("El titulo de la propiedad es obligatorio.", "TITULO_INVALIDO");
      }
      this.props.titulo = titulo;
    }

    if (datos.descripcion !== undefined) {
      this.props.descripcion = datos.descripcion.trim();
    }

    if (datos.precio !== undefined) {
      if (datos.precio < 0) {
        throw new PropiedadError(
          "El precio de la propiedad no puede ser negativo.",
          "PRECIO_INVALIDO",
        );
      }
      this.props.precio = datos.precio;
    }

    if (datos.estado !== undefined) {
      this.props.estado = EstadoPropiedad.desde(datos.estado);
    }

    if (datos.idClientePropietario !== undefined) {
      this.props.idClientePropietario = textoOpcional(datos.idClientePropietario);
    }

    if (datos.asesorResponsableId !== undefined) {
      this.props.asesorResponsableId = textoOpcional(datos.asesorResponsableId) as
        | IdUsuarioRef
        | undefined;
    }

    this.props.actualizadoEn = new Date();
  }
}
