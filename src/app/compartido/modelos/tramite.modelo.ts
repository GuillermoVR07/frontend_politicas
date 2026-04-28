import { EstadoTramite } from './estado-tramite.modelo';

export interface SeguimientoTramite {
  departamentoId: string;
  nombreDepartamento: string;
  estado: EstadoTramite;
  observacion: string;
  fechaRegistro: string;
  visibleParaCliente: boolean;
}

export interface Tramite {
  id?: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  identificacionCiudadano: string;
  procesoId: string;
  estadoActual: EstadoTramite;
  departamentoActualId: string;
  nombreDepartamentoActual: string;
  fechaCreacion?: string;
  fechaUltimaActualizacion?: string;
  seguimientos: SeguimientoTramite[];
}