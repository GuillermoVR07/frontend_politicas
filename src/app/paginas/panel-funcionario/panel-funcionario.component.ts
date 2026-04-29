import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, timeout } from 'rxjs';

import { ServicioTramiteService } from '../../compartido/servicios/servicio-tramite.service';
import { ServicioDepartamentoService } from '../../compartido/servicios/servicio-departamento.service';
import { ServicioActualizacionService } from '../../compartido/servicios/servicio-actualizacion.service';

import { Tramite } from '../../compartido/modelos/tramite.modelo';
import { Departamento } from '../../compartido/modelos/departamento.modelo';
import { EstadoTramite } from '../../compartido/modelos/estado-tramite.modelo';

@Component({
  selector: 'app-panel-funcionario',
  standalone: false,
  templateUrl: './panel-funcionario.component.html',
  styleUrls: ['./panel-funcionario.component.css']
})
export class PanelFuncionarioComponent implements OnInit, OnDestroy {

  departamentos: Departamento[] = [];

  departamentoId = '';
  tramites: Tramite[] = [];
  tramiteSeleccionado?: Tramite;

  estados = Object.values(EstadoTramite);

  nuevoEstado: EstadoTramite = EstadoTramite.EN_REVISION;
  nuevoDepartamentoId = '';
  nombreNuevoDepartamento = '';
  observacion = '';
  visibleParaCliente = true;

  mensaje = '';

  private suscripcionActualizacion?: Subscription;

  constructor(
    private servicioTramite: ServicioTramiteService,
    private servicioDepartamento: ServicioDepartamentoService,
    private servicioActualizacion: ServicioActualizacionService,
    private detectorCambios: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.listarDepartamentos();

    this.suscripcionActualizacion = this.servicioActualizacion.actualizacion$
      .subscribe(tipo => {
        if (tipo === 'departamentos' || tipo === 'todo') {
          this.listarDepartamentos();
        }

        if ((tipo === 'tramites' || tipo === 'todo') && this.departamentoId) {
          this.buscarTramitesPorDepartamento();
        }
      });
  }

  ngOnDestroy(): void {
    this.suscripcionActualizacion?.unsubscribe();
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

  buscarTramitesPorDepartamento(): void {
    if (!this.departamentoId.trim()) {
      this.mensaje = 'Debe seleccionar un departamento.';
      return;
    }

    this.servicioTramite.buscarPorDepartamento(this.departamentoId).pipe(timeout(8000)).subscribe({
      next: respuesta => {
        this.tramites = respuesta;
        this.tramiteSeleccionado = undefined;
        this.mensaje = '';
        this.actualizarVista();
      },
      error: () => {
        this.mensaje = 'No se pudieron cargar los trámites del departamento.';
        this.actualizarVista();
      }
    });
  }

  private actualizarVista(): void {
    this.detectorCambios.detectChanges();
  }

  seleccionarTramite(tramite: Tramite): void {
    this.tramiteSeleccionado = tramite;
    this.nuevoEstado = tramite.estadoActual;
    this.nuevoDepartamentoId = tramite.departamentoActualId;
    this.nombreNuevoDepartamento = tramite.nombreDepartamentoActual;
    this.observacion = '';
    this.visibleParaCliente = true;
    this.mensaje = 'Trámite seleccionado.';
  }

  alSeleccionarNuevoDepartamento(): void {
    const departamento = this.departamentos.find(
      item => item.id === this.nuevoDepartamentoId
    );

    if (departamento) {
      this.nombreNuevoDepartamento = departamento.nombre;
    }
  }

  cambiarEstado(): void {
    if (!this.tramiteSeleccionado || !this.tramiteSeleccionado.id) {
      this.mensaje = 'Debe seleccionar un trámite.';
      return;
    }

    this.servicioTramite.cambiarEstado(
      this.tramiteSeleccionado.id,
      this.nuevoEstado,
      this.observacion,
      this.visibleParaCliente
    ).subscribe({
      next: tramiteActualizado => {
        this.tramiteSeleccionado = tramiteActualizado;
        this.mensaje = 'Estado actualizado correctamente.';
        this.buscarTramitesPorDepartamento();
        this.servicioActualizacion.notificarActualizacion('tramites');
        this.servicioActualizacion.notificarActualizacion('indicadores');
      },
      error: () => {
        this.mensaje = 'No se pudo cambiar el estado del trámite.';
      }
    });
  }

  cambiarDepartamento(): void {
    if (!this.tramiteSeleccionado || !this.tramiteSeleccionado.id) {
      this.mensaje = 'Debe seleccionar un trámite.';
      return;
    }

    if (!this.nuevoDepartamentoId.trim() || !this.nombreNuevoDepartamento.trim()) {
      this.mensaje = 'Debe seleccionar el nuevo departamento.';
      return;
    }

    this.servicioTramite.cambiarDepartamento(
      this.tramiteSeleccionado.id,
      this.nuevoDepartamentoId,
      this.nombreNuevoDepartamento,
      this.observacion,
      this.visibleParaCliente
    ).subscribe({
      next: tramiteActualizado => {
        this.tramiteSeleccionado = tramiteActualizado;
        this.mensaje = 'Departamento actualizado correctamente.';
        this.buscarTramitesPorDepartamento();
        this.servicioActualizacion.notificarActualizacion('tramites');
        this.servicioActualizacion.notificarActualizacion('indicadores');
      },
      error: () => {
        this.mensaje = 'No se pudo cambiar el departamento del trámite.';
      }
    });
  }
}
