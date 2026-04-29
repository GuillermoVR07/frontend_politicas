import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, timeout } from 'rxjs';

import { ServicioTramiteService } from '../../compartido/servicios/servicio-tramite.service';
import { ServicioProcesoService } from '../../compartido/servicios/servicio-proceso.service';
import { ServicioDepartamentoService } from '../../compartido/servicios/servicio-departamento.service';
import { ServicioActualizacionService } from '../../compartido/servicios/servicio-actualizacion.service';

import { Tramite } from '../../compartido/modelos/tramite.modelo';
import { EstadoTramite } from '../../compartido/modelos/estado-tramite.modelo';
import { Proceso } from '../../compartido/modelos/proceso.modelo';
import { Departamento } from '../../compartido/modelos/departamento.modelo';

@Component({
  selector: 'app-tramites',
  standalone: false,
  templateUrl: './tramites.component.html',
  styleUrls: ['./tramites.component.css']
})
export class TramitesComponent implements OnInit, OnDestroy {

  tramites: Tramite[] = [];
  procesos: Proceso[] = [];
  departamentos: Departamento[] = [];

  tramiteSeleccionado?: Tramite;
  estados = Object.values(EstadoTramite);

  tramiteNuevo: any = {
    codigo: '',
    titulo: '',
    descripcion: '',
    identificacionCiudadano: '',
    procesoId: '',
    departamentoInicialId: '',
    nombreDepartamentoInicial: ''
  };

  tramiteSeleccionadoId = '';

  nuevoEstado: EstadoTramite = EstadoTramite.EN_REVISION;
  nuevoDepartamentoId = '';
  nombreNuevoDepartamento = '';
  observacion = '';
  visibleParaCliente = true;

  modoEdicion = false;
  mensaje = '';
  cargando = false;

  private suscripcionActualizacion?: Subscription;

  constructor(
    private servicioTramite: ServicioTramiteService,
    private servicioProceso: ServicioProcesoService,
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
          tipo === 'procesos' ||
          tipo === 'departamentos' ||
          tipo === 'todo'
        ) {
          this.cargarDatosIniciales();
        }
      });
  }

  ngOnDestroy(): void {
    this.suscripcionActualizacion?.unsubscribe();
  }

  cargarDatosIniciales(): void {
    this.listarTramites();
    this.listarProcesos();
    this.listarDepartamentos();
  }

  listarTramites(): void {
    this.cargando = true;

    this.servicioTramite.listarTramites().pipe(timeout(8000)).subscribe({
      next: respuesta => {
        this.tramites = respuesta;
        this.cargando = false;
        this.actualizarVista();
      },
      error: () => {
        this.cargando = false;
        this.mensaje = 'No se pudieron cargar los trámites.';
        this.actualizarVista();
      }
    });
  }

  listarProcesos(): void {
    this.servicioProceso.listarProcesos().pipe(timeout(8000)).subscribe({
      next: respuesta => {
        this.procesos = respuesta;
        this.actualizarVista();
      },
      error: () => {
        this.mensaje = 'No se pudieron cargar los procesos.';
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

  alSeleccionarDepartamentoInicial(): void {
    const departamento = this.departamentos.find(
      item => item.id === this.tramiteNuevo.departamentoInicialId
    );

    if (departamento) {
      this.tramiteNuevo.nombreDepartamentoInicial = departamento.nombre;
    }
  }

  alSeleccionarNuevoDepartamento(): void {
    const departamento = this.departamentos.find(
      item => item.id === this.nuevoDepartamentoId
    );

    if (departamento) {
      this.nombreNuevoDepartamento = departamento.nombre;
    }
  }

  alSeleccionarTramiteParaActualizar(): void {
    const tramite = this.tramites.find(
      item => item.id === this.tramiteSeleccionadoId
    );

    if (!tramite) {
      this.tramiteSeleccionado = undefined;
      this.mensaje = 'No se encontró el trámite seleccionado.';
      return;
    }

    this.tramiteSeleccionado = tramite;
    this.nuevoEstado = tramite.estadoActual;
    this.nuevoDepartamentoId = tramite.departamentoActualId;
    this.nombreNuevoDepartamento = tramite.nombreDepartamentoActual;
    this.observacion = '';
    this.visibleParaCliente = true;
    this.mensaje = 'Trámite seleccionado para actualizar.';
  }

  guardarTramite(): void {
    if (this.modoEdicion && this.tramiteSeleccionadoId) {
      this.actualizarTramite();
      return;
    }

    this.crearTramite();
  }

  crearTramite(): void {
    if (!this.tramiteNuevo.codigo.trim()) {
      this.mensaje = 'Debe ingresar el código del trámite.';
      return;
    }

    if (!this.tramiteNuevo.identificacionCiudadano.trim()) {
      this.mensaje = 'Debe ingresar la identificación del ciudadano.';
      return;
    }

    if (!this.tramiteNuevo.procesoId.trim()) {
      this.mensaje = 'Debe seleccionar el proceso.';
      return;
    }

    if (!this.tramiteNuevo.departamentoInicialId.trim()) {
      this.mensaje = 'Debe seleccionar el departamento inicial.';
      return;
    }

    this.servicioTramite.crearTramite(this.tramiteNuevo).subscribe({
      next: tramiteCreado => {
        this.mensaje = 'Trámite creado correctamente.';
        this.tramiteSeleccionado = tramiteCreado;
        this.tramiteSeleccionadoId = tramiteCreado.id || '';

        this.limpiarFormularioTramite();
        this.listarTramites();

        this.servicioActualizacion.notificarActualizacion('tramites');
        this.servicioActualizacion.notificarActualizacion('indicadores');
        this.servicioActualizacion.notificarActualizacion('documentos');
      },
      error: () => {
        this.mensaje = 'No se pudo crear el trámite.';
      }
    });
  }

  actualizarTramite(): void {
    this.servicioTramite.actualizarTramite(this.tramiteSeleccionadoId, {
      codigo: this.tramiteNuevo.codigo,
      titulo: this.tramiteNuevo.titulo,
      descripcion: this.tramiteNuevo.descripcion,
      identificacionCiudadano: this.tramiteNuevo.identificacionCiudadano,
      procesoId: this.tramiteNuevo.procesoId
    }).subscribe({
      next: tramiteActualizado => {
        this.mensaje = 'Trámite actualizado correctamente.';
        this.tramiteSeleccionado = tramiteActualizado;

        this.limpiarFormularioTramite();
        this.listarTramites();

        this.servicioActualizacion.notificarActualizacion('tramites');
        this.servicioActualizacion.notificarActualizacion('indicadores');
        this.servicioActualizacion.notificarActualizacion('documentos');
      },
      error: () => {
        this.mensaje = 'No se pudo actualizar el trámite.';
      }
    });
  }

  seleccionarTramite(tramite: Tramite): void {
    this.tramiteSeleccionado = tramite;
    this.tramiteSeleccionadoId = tramite.id || '';
    this.nuevoEstado = tramite.estadoActual;
    this.nuevoDepartamentoId = tramite.departamentoActualId;
    this.nombreNuevoDepartamento = tramite.nombreDepartamentoActual;
    this.observacion = '';
    this.visibleParaCliente = true;
    this.mensaje = 'Trámite seleccionado.';
  }

  editarTramite(tramite: Tramite): void {
    this.modoEdicion = true;
    this.tramiteSeleccionado = tramite;
    this.tramiteSeleccionadoId = tramite.id || '';

    this.tramiteNuevo = {
      codigo: tramite.codigo,
      titulo: tramite.titulo,
      descripcion: tramite.descripcion,
      identificacionCiudadano: tramite.identificacionCiudadano,
      procesoId: tramite.procesoId,
      departamentoInicialId: tramite.departamentoActualId,
      nombreDepartamentoInicial: tramite.nombreDepartamentoActual
    };

    this.mensaje = 'Editando trámite seleccionado.';
  }

  eliminarTramite(tramite: Tramite): void {
    if (!tramite.id) {
      this.mensaje = 'No se encontró el identificador del trámite.';
      return;
    }

    const confirmar = confirm(`¿Seguro que desea eliminar el trámite "${tramite.codigo}"?`);

    if (!confirmar) {
      return;
    }

    this.servicioTramite.eliminarTramite(tramite.id).subscribe({
      next: () => {
        this.mensaje = 'Trámite eliminado correctamente.';
        this.tramiteSeleccionado = undefined;
        this.tramiteSeleccionadoId = '';
        this.listarTramites();

        this.servicioActualizacion.notificarActualizacion('tramites');
        this.servicioActualizacion.notificarActualizacion('indicadores');
        this.servicioActualizacion.notificarActualizacion('documentos');
      },
      error: () => {
        this.mensaje = 'No se pudo eliminar el trámite.';
      }
    });
  }

  cambiarEstado(): void {
    if (!this.tramiteSeleccionadoId) {
      this.mensaje = 'Debe seleccionar un trámite.';
      return;
    }

    this.servicioTramite.cambiarEstado(
      this.tramiteSeleccionadoId,
      this.nuevoEstado,
      this.observacion,
      this.visibleParaCliente
    ).subscribe({
      next: tramiteActualizado => {
        this.mensaje = 'Estado actualizado correctamente.';
        this.tramiteSeleccionado = tramiteActualizado;
        this.tramiteSeleccionadoId = tramiteActualizado.id || this.tramiteSeleccionadoId;

        this.listarTramites();

        this.servicioActualizacion.notificarActualizacion('tramites');
        this.servicioActualizacion.notificarActualizacion('indicadores');
      },
      error: () => {
        this.mensaje = 'No se pudo cambiar el estado.';
      }
    });
  }

  cambiarDepartamento(): void {
    if (!this.tramiteSeleccionadoId) {
      this.mensaje = 'Debe seleccionar un trámite.';
      return;
    }

    if (!this.nuevoDepartamentoId.trim() || !this.nombreNuevoDepartamento.trim()) {
      this.mensaje = 'Debe seleccionar el nuevo departamento.';
      return;
    }

    this.servicioTramite.cambiarDepartamento(
      this.tramiteSeleccionadoId,
      this.nuevoDepartamentoId,
      this.nombreNuevoDepartamento,
      this.observacion,
      this.visibleParaCliente
    ).subscribe({
      next: tramiteActualizado => {
        this.mensaje = 'Departamento actualizado correctamente.';
        this.tramiteSeleccionado = tramiteActualizado;
        this.tramiteSeleccionadoId = tramiteActualizado.id || this.tramiteSeleccionadoId;

        this.listarTramites();

        this.servicioActualizacion.notificarActualizacion('tramites');
        this.servicioActualizacion.notificarActualizacion('indicadores');
      },
      error: () => {
        this.mensaje = 'No se pudo cambiar el departamento.';
      }
    });
  }

  limpiarFormularioTramite(): void {
    this.tramiteNuevo = {
      codigo: '',
      titulo: '',
      descripcion: '',
      identificacionCiudadano: '',
      procesoId: '',
      departamentoInicialId: '',
      nombreDepartamentoInicial: ''
    };

    this.modoEdicion = false;
  }
}
