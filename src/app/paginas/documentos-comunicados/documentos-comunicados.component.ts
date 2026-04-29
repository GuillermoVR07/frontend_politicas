import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, timeout } from 'rxjs';

import {
  DocumentoComunicado,
  TipoDocumentoComunicado
} from '../../compartido/modelos/documento-comunicado.modelo';

import { Tramite } from '../../compartido/modelos/tramite.modelo';
import { Departamento } from '../../compartido/modelos/departamento.modelo';

import { ServicioDocumentoComunicadoService } from '../../compartido/servicios/servicio-documento-comunicado.service';
import { ServicioTramiteService } from '../../compartido/servicios/servicio-tramite.service';
import { ServicioDepartamentoService } from '../../compartido/servicios/servicio-departamento.service';
import { ServicioActualizacionService } from '../../compartido/servicios/servicio-actualizacion.service';

@Component({
  selector: 'app-documentos-comunicados',
  standalone: false,
  templateUrl: './documentos-comunicados.component.html',
  styleUrls: ['./documentos-comunicados.component.css']
})
export class DocumentosComunicadosComponent implements OnInit, OnDestroy {

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

  private suscripcionActualizacion?: Subscription;

  constructor(
    private servicioDocumentoComunicado: ServicioDocumentoComunicadoService,
    private servicioTramite: ServicioTramiteService,
    private servicioDepartamento: ServicioDepartamentoService,
    private servicioActualizacion: ServicioActualizacionService,
    private detectorCambios: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();

    this.suscripcionActualizacion = this.servicioActualizacion.actualizacion$
      .subscribe(tipo => {
        if (
          tipo === 'tramites' ||
          tipo === 'departamentos' ||
          tipo === 'documentos' ||
          tipo === 'todo'
        ) {
          this.cargarDatosIniciales();

          if (this.tramiteIdConsulta) {
            this.buscarPorTramite();
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.suscripcionActualizacion?.unsubscribe();
  }

  cargarDatosIniciales(): void {
    this.listarTramites();
    this.listarDepartamentos();
  }

  listarTramites(): void {
    this.servicioTramite.listarTramites().pipe(timeout(8000)).subscribe({
      next: respuesta => {
        this.tramites = respuesta;
        this.actualizarVista();
      },
      error: () => {
        this.mensaje = 'No se pudieron cargar los trámites.';
        this.actualizarVista();
      }
    });
  }

  listarDepartamentos(): void {
    this.servicioDepartamento.listarDepartamentos().pipe(timeout(8000)).subscribe({
      next: respuesta => {
        this.departamentos = respuesta;
        this.actualizarVista();
      },
      error: () => {
        this.mensaje = 'No se pudieron cargar los departamentos.';
        this.actualizarVista();
      }
    });
  }

  private actualizarVista(): void {
    this.detectorCambios.detectChanges();
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
          this.servicioActualizacion.notificarActualizacion('documentos');
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
        this.servicioActualizacion.notificarActualizacion('documentos');
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
        this.servicioActualizacion.notificarActualizacion('documentos');
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
