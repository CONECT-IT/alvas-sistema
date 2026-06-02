/** @group DTOs */
export type CaptacionEntranteDTO = Readonly<{
  canal: string;
  origen: string;
  nombre: string;
  telefono: string;
  email?: string;
  tipo: string;
  idPropiedadInteres?: string;
  metadata?: Readonly<Record<string, string>>;
}>;

export type EntradaWhatsAppWebhookDTO = Readonly<{
  wa_id: string;
  wa_name: string;
  pregunta_tipo?: string;
  propiedad_id?: string;
}>;

export type CaptacionProcesadaDTO = Readonly<{
  idLead: string;
  idPropiedadPreliminar?: string;
}>;

export type CaptacionPendienteDTO = Readonly<{
  id: string;
  canal: string;
  origen: string;
  nombre: string;
  telefono: string;
  email: string;
  tipo: string;
  estado: "PENDIENTE" | "REVISADA" | "DUPLICADA" | "CONVERTIDA" | "RECHAZADA";
  idPropiedadInteres?: string;
  metadata?: Readonly<Record<string, string>>;
  razonDuplicado?: string;
  creadoEn: string;
  actualizadoEn: string;
}>;

export type RevisarCaptacionPendienteDTO = Readonly<{
  idCaptacion: string;
}>;

export type MarcarCaptacionDuplicadaDTO = Readonly<{
  idCaptacion: string;
  razon: string;
}>;

export type RechazarCaptacionPendienteDTO = Readonly<{
  idCaptacion: string;
  razon?: string;
}>;

export type ConvertirCaptacionPendienteDTO = Readonly<{
  idCaptacion: string;
  idAsesor?: string;
}>;

export type CaptacionConvertidaDTO = CaptacionProcesadaDTO &
  Readonly<{
    captacion: CaptacionPendienteDTO;
  }>;
