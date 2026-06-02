import { ErrorDeValidacion } from "../../../shared/domain";
import { type IdCita, type IdLead } from "../value-objects/Ids";
import { EstadoCita } from "../value-objects/EstadoCita";

export type PropsCita = {
  id: IdCita;
  idLead: IdLead;
  idPropiedad?: string;
  fechaInicio: Date;
  fechaFin: Date;
  estado: EstadoCita;
  observacion?: string;
};

/** @group Entidades */
export class Cita {
  private constructor(private props: PropsCita) {
    this.validarFechas();
  }

  /** Crea cita en estado PENDIENTE con validacion de fechas. */
  static crear(params: Omit<PropsCita, "id" | "estado"> & { id: IdCita }): Cita {
    return new Cita({ ...params, estado: EstadoCita.pendiente() });
  }

  /** Reconstituye cita desde persistencia. */
  static reconstituir(props: PropsCita): Cita {
    return new Cita(props);
  }

  get id(): IdCita {
    return this.props.id;
  }
  get idLead(): IdLead {
    return this.props.idLead;
  }
  get idPropiedad(): string | undefined {
    return this.props.idPropiedad;
  }
  get fechaInicio(): Date {
    return this.props.fechaInicio;
  }
  get fechaFin(): Date {
    return this.props.fechaFin;
  }
  get estado(): EstadoCita {
    return this.props.estado;
  }
  get observacion(): string | undefined {
    return this.props.observacion;
  }

  /** Marca cita como realizada si no está cancelada. */
  marcarComoRealizada(): void {
    if (this.props.estado.esCancelada()) {
      throw new ErrorDeValidacion("No se puede marcar como realizada una cita cancelada.");
    }
    this.props.estado = EstadoCita.realizada();
  }

  cancelar(motivo?: string): void {
    this.props.estado = EstadoCita.cancelada();
    if (motivo) {
      this.props.observacion = this.props.observacion
        ? `${this.props.observacion} | Cancelado: ${motivo}`
        : `Cancelado: ${motivo}`;
    }
  }

  /** Reprograma cita con nueva fecha y duracion. */
  reprogramar(fechaInicio: Date, duracionMinutos: number, observacion?: string): void {
    if (this.props.estado.esRealizada()) {
      throw new ErrorDeValidacion("No se puede reprogramar una cita ya realizada.");
    }

    if (duracionMinutos <= 0) {
      throw new ErrorDeValidacion("La duracion de la cita debe ser mayor que cero.");
    }

    this.props.fechaInicio = fechaInicio;
    this.props.fechaFin = new Date(fechaInicio.getTime() + duracionMinutos * 60000);
    this.props.estado = EstadoCita.reprogramada();

    if (observacion !== undefined) {
      this.props.observacion = observacion.trim() || undefined;
    }

    this.validarFechas();
  }

  actualizarObservacion(observacion?: string): void {
    this.props.observacion = observacion?.trim() || undefined;
  }

  actualizarPropiedad(idPropiedad?: string): void {
    this.props.idPropiedad = idPropiedad?.trim() || undefined;
  }

  cambiarEstado(estado: string, observacion?: string): void {
    const nuevoEstado = EstadoCita.desde(estado);

    switch (nuevoEstado.valor) {
      case "REALIZADA":
        this.marcarComoRealizada();
        break;
      case "CANCELADA":
        this.cancelar(observacion);
        return;
      case "REPROGRAMADA":
        this.props.estado = EstadoCita.reprogramada();
        break;
      case "PENDIENTE":
        this.props.estado = EstadoCita.pendiente();
        break;
    }

    if (observacion !== undefined) {
      this.actualizarObservacion(observacion);
    }
  }

  private validarFechas(): void {
    if (this.props.fechaFin <= this.props.fechaInicio) {
      throw new ErrorDeValidacion("La fecha de fin debe ser posterior a la fecha de inicio.");
    }
  }
}
