import { Component } from '@angular/core';
import { DocumentoComunicado, TipoDocumentoComunicado } from '../../compartido/modelos/documento-comunicado.modelo';
import { ServicioDocumentoComunicadoService } from '../../compartido/servicios/servicio-documento-comunicado.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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

  mensaje = '';

  constructor(private servicioDocumentoComunicado: ServicioDocumentoComunicadoService) {}

  crearDocumentoComunicado(): void {
    this.servicioDocumentoComunicado.crearDocumentoComunicado(this.documentoNuevo).subscribe({
      next: () => {
        this.mensaje = 'Documento o comunicado registrado correctamente.';
        this.documentoNuevo = {
          tramiteId: '',
          tipo: TipoDocumentoComunicado.COMUNICADO,
          nombre: '',
          descripcion: '',
          departamentoId: '',
          nombreDepartamento: '',
          visibleParaCliente: true
        };
      },
      error: () => this.mensaje = 'No se pudo registrar el documento o comunicado.'
    });
  }

  buscarPorTramite(): void {
    this.servicioDocumentoComunicado.listarPorTramite(this.tramiteIdConsulta).subscribe({
      next: respuesta => this.documentosComunicados = respuesta,
      error: () => this.mensaje = 'No se pudieron cargar los documentos o comunicados.'
    });
  }
}