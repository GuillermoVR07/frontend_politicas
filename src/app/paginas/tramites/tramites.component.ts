
import { Component, OnInit } from '@angular/core';
import { ServicioTramiteService } from '../../compartido/servicios/servicio-tramite.service';
import { Tramite } from '../../compartido/modelos/tramite.modelo';
import { EstadoTramite } from '../../compartido/modelos/estado-tramite.modelo';
import { Proceso } from '../../compartido/modelos/proceso.modelo';
import { Departamento } from '../../compartido/modelos/departamento.modelo';
import { ServicioProcesoService } from '../../compartido/servicios/servicio-proceso.service';
import { ServicioDepartamentoService } from '../../compartido/servicios/servicio-departamento.service';

@Component({
  selector: 'app-tramites',
  standalone: false,
  templateUrl: './tramites.component.html',
  styleUrls: ['./tramites.component.css']
})
export class TramitesComponent implements OnInit {

  tramites: Tramite[] = [];
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

  mensaje = '';

  constructor(
    private servicioTramite: ServicioTramiteService,
    private servicioProceso: ServicioProcesoService,
    private servicioDepartamento: ServicioDepartamentoService
  ) {}

  procesos: Proceso[] = [];
  departamentos: Departamento[] = [];
  modoEdicion = false;

  ngOnInit(): void {
    this.listarTramites();
    this.listarProcesos();
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
      this.mensaje = 'Debe ingresar el identificador del proceso.';
      return;
    }

    if (!this.tramiteNuevo.departamentoInicialId.trim()) {
      this.mensaje = 'Debe ingresar el identificador del departamento inicial.';
      return;
    }

    this.servicioTramite.crearTramite(this.tramiteNuevo).subscribe({
      next: tramiteCreado => {
        this.mensaje = 'Trámite creado correctamente.';
        this.tramiteSeleccionado = tramiteCreado;

        this.tramiteNuevo = {
          codigo: '',
          titulo: '',
          descripcion: '',
          identificacionCiudadano: '',
          procesoId: '',
          departamentoInicialId: '',
          nombreDepartamentoInicial: ''
        };

        this.listarTramites();
      },
      error: () => {
        this.mensaje = 'No se pudo crear el trámite.';
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

  recargarTramiteSeleccionado(): void {
    if (!this.tramiteSeleccionado || !this.tramiteSeleccionado.id) {
      return;
    }

    this.servicioTramite.buscarTramite(this.tramiteSeleccionado.id).subscribe({
      next: tramite => {
        this.tramiteSeleccionado = tramite;
      }
    });
  }

  cambiarEstado(): void {
    if (!this.tramiteSeleccionadoId) {
      this.mensaje = 'Debe seleccionar o ingresar el identificador del trámite.';
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
        this.listarTramites();
      },
      error: () => {
        this.mensaje = 'No se pudo cambiar el estado.';
      }
    });
  }

  cambiarDepartamento(): void {
    if (!this.tramiteSeleccionadoId) {
      this.mensaje = 'Debe seleccionar o ingresar el identificador del trámite.';
      return;
    }

    if (!this.nuevoDepartamentoId.trim() || !this.nombreNuevoDepartamento.trim()) {
      this.mensaje = 'Debe ingresar el nuevo departamento.';
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
        this.listarTramites();
      },
      error: () => {
        this.mensaje = 'No se pudo cambiar el departamento.';
      }
    });
  }


  listarProcesos(): void {
    this.servicioProceso.listarProcesos().subscribe({
      next: respuesta => this.procesos = respuesta,
      error: () => this.mensaje = 'No se pudieron cargar los procesos.'
    });
  }

  listarDepartamentos(): void {
    this.servicioDepartamento.listarDepartamentos().subscribe({
      next: respuesta => this.departamentos = respuesta,
      error: () => this.mensaje = 'No se pudieron cargar los departamentos.'
    });
  }

  alSeleccionarDepartamentoInicial(): void {
    const departamento = this.departamentos.find(
      item => item.id === this.tramiteNuevo.departamentoInicialId
    );

    if (departamento) {
      this.tramiteNuevo.nombreDepartamentoInicial = departamento.nombre;
    }
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

  guardarTramite(): void {
    if (this.modoEdicion && this.tramiteSeleccionadoId) {
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
        },
        error: () => this.mensaje = 'No se pudo actualizar el trámite.'
      });

      return;
    }

    this.crearTramite();
  }

  eliminarTramite(tramite: Tramite): void {
    if (!tramite.id) {
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
        this.listarTramites();
      },
      error: () => this.mensaje = 'No se pudo eliminar el trámite.'
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

    this.tramiteSeleccionadoId = '';
    this.modoEdicion = false;
  }


  alSeleccionarNuevoDepartamento(): void {
    const departamento = this.departamentos.find(
      item => item.id === this.nuevoDepartamentoId
    );

    if (departamento) {
      this.nombreNuevoDepartamento = departamento.nombre;
    }
  }
}