import { Component } from '@angular/core';
import {
  DocumentoComunicado,
  TipoDocumentoComunicado
} from '../../compartido/modelos/documento-comunicado.modelo';
import { ServicioDocumentoComunicadoService } from '../../compartido/servicios/servicio-documento-comunicado.service';

@Component({
  selector: 'app-documentos-comunicados',
  standalone: false,
  templateUrl: './documentos-comunicados.component.html',
  styleUrls: ['./documentos-comunicados.component.css']
})
export class DocumentosComunicadosComponent {

  tipos = Object.values(TipoDocumentoComunicado);

  tramiteIdConsulta = '';
  documentosComunicados: DocumentoComunicado[] = [];

  documentoNuevo: DocumentoComunicado = {
    tramiteId: '',
    tipo: TipoDocumentoComunicado.COMUNICADO,
    nombre: '',
    descripcion: '',
    departamentoId: '',
    nombreDepartamento: '',
    visibleParaCliente: true
  };

  soloVisiblesParaCliente = false;
  mensaje = '';

  constructor(
    private servicioDocumentoComunicado: ServicioDocumentoComunicadoService
  ) {}

  crearDocumentoComunicado(): void {
    if (!this.documentoNuevo.tramiteId.trim()) {
      this.mensaje = 'Debe ingresar el identificador del trámite.';
      return;
    }

    if (!this.documentoNuevo.nombre.trim()) {
      this.mensaje = 'Debe ingresar un nombre para el documento o comunicado.';
      return;
    }

    if (!this.documentoNuevo.descripcion.trim()) {
      this.mensaje = 'Debe ingresar una descripción.';
      return;
    }

    this.servicioDocumentoComunicado.crearDocumentoComunicado(this.documentoNuevo).subscribe({
      next: () => {
        this.mensaje = 'Documento o comunicado registrado correctamente.';

        const tramiteIdAnterior = this.documentoNuevo.tramiteId;

        this.documentoNuevo = {
          tramiteId: tramiteIdAnterior,
          tipo: TipoDocumentoComunicado.COMUNICADO,
          nombre: '',
          descripcion: '',
          departamentoId: '',
          nombreDepartamento: '',
          visibleParaCliente: true
        };

        this.tramiteIdConsulta = tramiteIdAnterior;
        this.buscarPorTramite();
      },
      error: () => {
        this.mensaje = 'No se pudo registrar el documento o comunicado.';
      }
    });
  }

  buscarPorTramite(): void {
    if (!this.tramiteIdConsulta.trim()) {
      this.mensaje = 'Debe ingresar el identificador del trámite.';
      return;
    }

    if (this.soloVisiblesParaCliente) {
      this.servicioDocumentoComunicado
        .listarVisiblesParaCliente(this.tramiteIdConsulta)
        .subscribe({
          next: respuesta => {
            this.documentosComunicados = respuesta;
            this.mensaje = 'Documentos y comunicados visibles para cliente cargados.';
          },
          error: () => {
            this.mensaje = 'No se pudieron cargar los documentos visibles para cliente.';
          }
        });

      return;
    }

    this.servicioDocumentoComunicado.listarPorTramite(this.tramiteIdConsulta).subscribe({
      next: respuesta => {
        this.documentosComunicados = respuesta;
        this.mensaje = 'Documentos y comunicados del trámite cargados.';
      },
      error: () => {
        this.mensaje = 'No se pudieron cargar los documentos o comunicados.';
      }
    });
  }

  usarTramiteDelFormulario(): void {
    this.tramiteIdConsulta = this.documentoNuevo.tramiteId;
    this.buscarPorTramite();
  }

  limpiarFormulario(): void {
    this.documentoNuevo = {
      tramiteId: '',
      tipo: TipoDocumentoComunicado.COMUNICADO,
      nombre: '',
      descripcion: '',
      departamentoId: '',
      nombreDepartamento: '',
      visibleParaCliente: true
    };

    this.mensaje = 'Formulario limpiado.';
  }
}