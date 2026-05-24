import { Captacion } from "./Captacion";
import { EstadoCaptacion } from "../value-objects";

type CaptacionPendienteProps = Readonly<{
  id: string;
  captacion: Captacion;
  estado: EstadoCaptacion;
  razonDuplicado?: string;
  creadoEn: Date;
  actualizadoEn: Date;
}>;

export class CaptacionPendiente {
  private constructor(private props: CaptacionPendienteProps) {}

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

  static reconstituir(props: CaptacionPendienteProps): CaptacionPendiente {
    return new CaptacionPendiente(props);
  }

  marcarDuplicada(razon: string): void {
    this.props = {
      ...this.props,
      estado: EstadoCaptacion.duplicada(),
      razonDuplicado: razon.trim() || undefined,
      actualizadoEn: new Date(),
    };
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
