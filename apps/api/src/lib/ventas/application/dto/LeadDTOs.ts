/** @group DTOs */
export interface ObtenerLeadInputDTO {
  id: string;
}

export interface RegistrarLeadInputDTO {
  nombre: string;
  email: string;
  telefono: string;
  tipo: string;
  idPropiedadInteres?: string;
  idAsesor?: string;
  idCliente?: string;
  datosPropiedad?: {
    titulo: string;
    descripcion: string;
    precio: number;
  };
}

export interface ActualizarLeadInputDTO {
  id: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  tipo?: string;
  idPropiedadInteres?: string;
}

export interface ActualizarLeadBodyDTO {
  nombre?: string;
  email?: string;
  telefono?: string;
  tipo?: string;
  idPropiedadInteres?: string;
  estado?: string;
}

export interface AsignarLeadAAsesorInputDTO {
  idLead: string;
  idAsesor: string;
  usuarioAutenticado?: {
    id: string;
    rol: string;
  };
}

export interface ObtenerCitaPorIdInputDTO {
  idLead: string;
  idCita: string;
}

export interface AgendarCitaInputDTO {
  idLead: string;
  idPropiedad?: string;
  fechaInicio: string;
  duracionMinutos: number;
  observacion?: string;
}

export interface ActualizarCitaInputDTO {
  idLead: string;
  idCita: string;
  fechaInicio?: string;
  duracionMinutos?: number;
  observacion?: string;
  estado?: string;
}

export interface ActualizarCitaBodyDTO {
  fechaInicio?: string;
  duracionMinutos?: number;
  observacion?: string;
  estado?: string;
}

export interface ConvertirLeadInputDTO {
  idLead: string;
}

export interface ActividadLeadDTO {
  id: number;
  evento: string;
  descripcion: string;
  fecha: string;
}
