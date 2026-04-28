import { Component } from '@angular/core';
import { ServicioTramiteService } from '../../compartido/servicios/servicio-tramite.service';
import { Tramite } from '../../compartido/modelos/tramite.modelo';
import { EstadoTramite } from '../../compartido/modelos/estado-tramite.modelo';

@Component({
  selector: 'app-panel-funcionario',
  standalone: false,
  templateUrl: './panel-funcionario.component.html',
  styleUrls: ['./panel-funcionario.component.css']
})
export class PanelFuncionarioComponent {

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

  constructor(private servicioTramite: ServicioTramiteService) {}

  buscarTramitesPorDepartamento(): void {
    if (!this.departamentoId.trim()) {
      this.mensaje = 'Debe ingresar el identificador del departamento.';
      return;
    }

    this.servicioTramite.buscarPorDepartamento(this.departamentoId).subscribe({
      next: respuesta => {
        this.tramites = respuesta;
        this.tramiteSeleccionado = undefined;
        this.mensaje = '';
      },
      error: () => {
        this.mensaje = 'No se pudieron cargar los trámites del departamento.';
      }
    });
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
      this.mensaje = 'Debe ingresar el nuevo departamento.';
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
      },
      error: () => {
        this.mensaje = 'No se pudo cambiar el departamento del trámite.';
      }
    });
  }
}