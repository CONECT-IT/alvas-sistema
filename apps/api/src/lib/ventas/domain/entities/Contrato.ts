import {
  type IdContrato,
  type IdCliente,
  type IdLead,
  type IdPropiedad,
} from "../value-objects/Ids";
import { ErrorDeValidacion } from "../../../shared/domain";
import { EstadoContrato } from "../value-objects/EstadoContrato";

export type PropsContrato = {
  id: IdContrato;
  idLead?: IdLead;
  idCliente?: IdCliente;
  idPropiedad: IdPropiedad;
  fechaInicio: Date;
  fechaFin: Date;
  estado: EstadoContrato;
  creadoEn: Date;
  actualizadoEn: Date;
};

/** @group Entidades */
export class Contrato {
  private constructor(private props: PropsContrato) {
    this.validarFechas();
  }

  /** Crea contrato en estado BORRADOR. */
  static crear(params: {
    id: IdContrato;
    idLead: IdLead;
    idPropiedad: IdPropiedad;
    fechaInicio: Date;
    fechaFin: Date;
  }): Contrato {
    const ahora = new Date();
    return new Contrato({
      id: params.id,
      idLead: params.idLead,
      idPropiedad: params.idPropiedad,
      fechaInicio: params.fechaInicio,
      fechaFin: params.fechaFin,
      estado: EstadoContrato.borrador(),
      creadoEn: ahora,
      actualizadoEn: ahora,
    });
  }

  /** Reconstituye contrato desde persistencia. */
  static reconstituir(props: PropsContrato): Contrato {
    return new Contrato(props);
  }

  get id(): IdContrato {
    return this.props.id;
  }
  get idLead(): IdLead | undefined {
    return this.props.idLead;
  }
  get idCliente(): IdCliente | undefined {
    return this.props.idCliente;
  }
  get idPropiedad(): IdPropiedad {
    return this.props.idPropiedad;
  }
  get fechaInicio(): Date {
    return this.props.fechaInicio;
  }
  get fechaFin(): Date {
    return this.props.fechaFin;
  }
  get estado(): EstadoContrato {
    return this.props.estado;
  }
  get creadoEn(): Date {
    return this.props.creadoEn;
  }
  get actualizadoEn(): Date {
    return this.props.actualizadoEn;
  }

  asignarCliente(idCliente: IdCliente): void {
    if (this.props.idCliente) {
      throw new ErrorDeValidacion("El contrato ya tiene un cliente asignado.");
    }
    this.props.idCliente = idCliente;
    this.props.actualizadoEn = new Date();
  }

  /** Firma el contrato (BORRADOR → VIGENTE). */
  firmar(): void {
    if (!this.props.estado.esBorrador()) {
      throw new ErrorDeValidacion("Solo se pueden firmar contratos en estado borrador.");
    }
    this.props.estado = EstadoContrato.vigente();
    this.props.actualizadoEn = new Date();
  }

  finalizar(): void {
    this.props.estado = EstadoContrato.finalizado();
    this.props.actualizadoEn = new Date();
  }

  /** Cancela el contrato si no está finalizado. */
  cancelar(): void {
    if (this.props.estado.esFinalizado()) {
      throw new ErrorDeValidacion("No se puede cancelar un contrato finalizado.");
    }
    if (this.props.estado.esCancelado()) {
      throw new ErrorDeValidacion("El contrato ya está cancelado.");
    }
    this.props.estado = EstadoContrato.cancelado();
    this.props.actualizadoEn = new Date();
  }

  private validarFechas(): void {
    if (this.props.fechaFin <= this.props.fechaInicio) {
      throw new ErrorDeValidacion("La fecha de fin debe ser posterior a la fecha de inicio.");
    }
  }
}
