import { Component, OnInit } from '@angular/core';

import {
  DocumentoComunicado,
  TipoDocumentoComunicado
} from '../../compartido/modelos/documento-comunicado.modelo';

import { Tramite } from '../../compartido/modelos/tramite.modelo';
import { Departamento } from '../../compartido/modelos/departamento.modelo';

import { ServicioDocumentoComunicadoService } from '../../compartido/servicios/servicio-documento-comunicado.service';
import { ServicioTramiteService } from '../../compartido/servicios/servicio-tramite.service';
import { ServicioDepartamentoService } from '../../compartido/servicios/servicio-departamento.service';

@Component({
  selector: 'app-documentos-comunicados',
  standalone: false,
  templateUrl: './documentos-comunicados.component.html',
  styleUrls: ['./documentos-comunicados.component.css']
})
export class DocumentosComunicadosComponent implements OnInit {

  tipos = Object.values(TipoDocumentoComunicado);

  tramites: Tramite[] = [];
  departamentos: Departamento[] = [];

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

  documentoEditandoId = '';
  modoEdicion = false;

  mensaje = '';

  constructor(
    private servicioDocumentoComunicado: ServicioDocumentoComunicadoService,
    private servicioTramite: ServicioTramiteService,
    private servicioDepartamento: ServicioDepartamentoService
  ) {}

  ngOnInit(): void {
    this.listarTramites();
    this.listarDepartamentos();
  }

  listarTramites(): void {
    this.servicioTramite.listarTramites().subscribe({
      next: respuesta => {
        this.tramites = respuesta;
      },
      error: () => {
        this.mensaje = 'No se pudieron cargar los trámites.';
      }
    });
  }

  listarDepartamentos(): void {
    this.servicioDepartamento.listarDepartamentos().subscribe({
      next: respuesta => {
        this.departamentos = respuesta;
      },
      error: () => {
        this.mensaje = 'No se pudieron cargar los departamentos.';
      }
    });
  }

  alSeleccionarDepartamento(): void {
    const departamento = this.departamentos.find(
      item => item.id === this.documentoNuevo.departamentoId
    );

    if (departamento) {
      this.documentoNuevo.nombreDepartamento = departamento.nombre;
    }
  }

  guardarDocumentoComunicado(): void {
    if (this.modoEdicion && this.documentoEditandoId) {
      this.servicioDocumentoComunicado.actualizarDocumentoComunicado(
        this.documentoEditandoId,
        this.documentoNuevo
      ).subscribe({
        next: () => {
          this.mensaje = 'Documento o comunicado actualizado correctamente.';
          this.limpiarFormulario();
          this.buscarPorTramite();
        },
        error: () => {
          this.mensaje = 'No se pudo actualizar el documento o comunicado.';
        }
      });

      return;
    }

    this.crearDocumentoComunicado();
  }

  crearDocumentoComunicado(): void {
    if (!this.documentoNuevo.tramiteId.trim()) {
      this.mensaje = 'Debe seleccionar el trámite.';
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
      this.mensaje = 'Debe seleccionar el trámite para consultar.';
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

  editarDocumentoComunicado(item: DocumentoComunicado): void {
    this.modoEdicion = true;
    this.documentoEditandoId = item.id || '';

    this.documentoNuevo = {
      id: item.id,
      tramiteId: item.tramiteId,
      tipo: item.tipo,
      nombre: item.nombre,
      descripcion: item.descripcion,
      departamentoId: item.departamentoId,
      nombreDepartamento: item.nombreDepartamento,
      visibleParaCliente: item.visibleParaCliente,
      fechaRegistro: item.fechaRegistro
    };

    this.mensaje = 'Editando documento o comunicado seleccionado.';
  }

  eliminarDocumentoComunicado(item: DocumentoComunicado): void {
    if (!item.id) {
      return;
    }

    const confirmar = confirm(`¿Seguro que desea eliminar "${item.nombre}"?`);

    if (!confirmar) {
      return;
    }

    this.servicioDocumentoComunicado.eliminarDocumentoComunicado(item.id).subscribe({
      next: () => {
        this.mensaje = 'Documento o comunicado eliminado correctamente.';
        this.buscarPorTramite();
      },
      error: () => {
        this.mensaje = 'No se pudo eliminar el documento o comunicado.';
      }
    });
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

    this.documentoEditandoId = '';
    this.modoEdicion = false;
    this.mensaje = 'Formulario limpiado.';
  }
}