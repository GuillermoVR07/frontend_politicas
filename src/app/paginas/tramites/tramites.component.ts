
import { Component, OnInit } from '@angular/core';
import { ServicioTramiteService } from '../../compartido/servicios/servicio-tramite.service';
import { Tramite } from '../../compartido/modelos/tramite.modelo';
import { EstadoTramite } from '../../compartido/modelos/estado-tramite.modelo';

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

  constructor(private servicioTramite: ServicioTramiteService) {}

  ngOnInit(): void {
    this.listarTramites();
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
}