export enum TipoDocumentoComunicado {
  DOCUMENTO_ENTREGADO = 'DOCUMENTO_ENTREGADO',
  DOCUMENTO_GENERADO = 'DOCUMENTO_GENERADO',
  COMUNICADO = 'COMUNICADO'
}

export interface DocumentoComunicado {
  id?: string;
  tramiteId: string;
  tipo: TipoDocumentoComunicado;
  nombre: string;
  descripcion: string;
  departamentoId: string;
  nombreDepartamento: string;
  visibleParaCliente: boolean;
  fechaRegistro?: string;
}