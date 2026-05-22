export interface CrearContratoInputDTO {
  id: string;
  idLead: string;
  idPropiedad: string;
  fechaInicio: Date;
  fechaFin: Date;
}

export interface ContratoOutputDTO {
  id: string;
  idLead?: string;
  idCliente?: string;
  idPropiedad: string;
  idAsesor?: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface ListarContratosOutputDTO {
  contratos: ContratoOutputDTO[];
}
