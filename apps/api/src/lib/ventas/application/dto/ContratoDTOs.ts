/** @group DTOs */
export interface CrearContratoInputDTO {
  id?: string;
  idLead: string;
  idPropiedad: string;
  fechaInicio: Date;
  fechaFin: Date;
}

export interface ContratoOutputDTO {
  id: string;
  idLead?: string;
  nombreLead?: string;
  idCliente?: string;
  nombreCliente?: string;
  idPropiedad: string;
  nombrePropiedad?: string;
  idAsesor?: string;
  nombreAsesor?: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface ListarContratosOutputDTO {
  contratos: ContratoOutputDTO[];
}
