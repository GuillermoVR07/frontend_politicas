export interface Diagrama {
  contenidoXml?: string;
  contenidoJson?: string;
  generadoPorIa?: string;
  fechaActualizacion?: string;
}

export interface Proceso {
  id?: string;
  nombre: string;
  descripcion: string;
  departamentos: string[];
  diagrama?: Diagrama;
}