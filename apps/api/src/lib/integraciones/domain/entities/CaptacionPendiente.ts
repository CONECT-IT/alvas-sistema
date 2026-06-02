import { Captacion } from "./Captacion";
import { EstadoCaptacion } from "../value-objects";
import { ErrorDeDominio } from "../../../shared/domain";

type CaptacionPendienteProps = Readonly<{
  id: string;
  captacion: Captacion;
  estado: EstadoCaptacion;
  razonDuplicado?: string;
  creadoEn: Date;
  actualizadoEn: Date;
}>;

/** @group Entidades */
export class CaptacionPendiente {
  private constructor(private props: CaptacionPendienteProps) {}

  /** Crea una captacion pendiente tras validar que no esté cerrada. */
  static registrar(params: { id: string; captacion: Captacion }): CaptacionPendiente {
    const ahora = new Date();
    return new CaptacionPendiente({
      id: params.id.trim(),
      captacion: params.captacion,
      estado: EstadoCaptacion.pendiente(),
      creadoEn: ahora,
      actualizadoEn: ahora,
    });
  }

  /** Reconstituye desde persistencia. */
  static reconstituir(props: CaptacionPendienteProps): CaptacionPendiente {
    return new CaptacionPendiente(props);
  }

  /** Marca como revisada si es procesable. */
  marcarRevisada(): void {
    this.validarProcesable();
    this.props = {
      ...this.props,
      estado: EstadoCaptacion.revisada(),
      actualizadoEn: new Date(),
    };
  }

  /** Marca como duplicada con razón. */
  marcarDuplicada(razon: string): void {
    this.validarProcesable();
    this.props = {
      ...this.props,
      estado: EstadoCaptacion.duplicada(),
      razonDuplicado: razon.trim() || undefined,
      actualizadoEn: new Date(),
    };
  }

  /** Rechaza la captacion con razón opcional. */
  rechazar(razon?: string): void {
    this.validarProcesable();
    this.props = {
      ...this.props,
      estado: EstadoCaptacion.rechazada(),
      razonDuplicado: razon?.trim() || undefined,
      actualizadoEn: new Date(),
    };
  }

  /** Marca como convertida a lead. */
  marcarConvertida(): void {
    this.validarProcesable();
    this.props = {
      ...this.props,
      estado: EstadoCaptacion.convertida(),
      actualizadoEn: new Date(),
    };
  }

  private validarProcesable(): void {
    if (!this.props.estado.esProcesable()) {
      throw new ErrorDeDominio("La captacion ya fue cerrada y no puede procesarse otra vez.", {
        codigo: "CAPTACION_NO_PROCESABLE",
        detalle: { estado: this.props.estado.valor },
      });
    }
  }

  get id(): string {
    return this.props.id;
  }

  get captacion(): Captacion {
    return this.props.captacion;
  }

  get estado(): EstadoCaptacion {
    return this.props.estado;
  }

  get razonDuplicado(): string | undefined {
    return this.props.razonDuplicado;
  }

  get creadoEn(): Date {
    return this.props.creadoEn;
  }

  get actualizadoEn(): Date {
    return this.props.actualizadoEn;
  }
}
