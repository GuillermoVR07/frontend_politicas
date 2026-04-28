import { Component, OnInit } from '@angular/core';
import { ServicioTramiteService } from '../../compartido/servicios/servicio-tramite.service';
import { Tramite } from '../../compartido/modelos/tramite.modelo';
import { EstadoTramite } from '../../compartido/modelos/estado-tramite.modelo';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-tramites',
  standalone: false,
  templateUrl: './tramites.component.html',
  styleUrls: ['./tramites.component.css']
})
export class TramitesComponent implements OnInit {

  tramites: Tramite[] = [];
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
      next: respuesta => this.tramites = respuesta,
      error: () => this.mensaje = 'No se pudieron cargar los trámites.'
    });
  }

  crearTramite(): void {
    this.servicioTramite.crearTramite(this.tramiteNuevo).subscribe({
      next: () => {
        this.mensaje = 'Trámite creado correctamente.';
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
      error: () => this.mensaje = 'No se pudo crear el trámite.'
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
      next: () => {
        this.mensaje = 'Estado actualizado correctamente.';
        this.listarTramites();
      },
      error: () => this.mensaje = 'No se pudo cambiar el estado.'
    });
  }

  cambiarDepartamento(): void {
    if (!this.tramiteSeleccionadoId) {
      this.mensaje = 'Debe seleccionar o ingresar el identificador del trámite.';
      return;
    }

    this.servicioTramite.cambiarDepartamento(
      this.tramiteSeleccionadoId,
      this.nuevoDepartamentoId,
      this.nombreNuevoDepartamento,
      this.observacion,
      this.visibleParaCliente
    ).subscribe({
      next: () => {
        this.mensaje = 'Departamento actualizado correctamente.';
        this.listarTramites();
      },
      error: () => this.mensaje = 'No se pudo cambiar el departamento.'
    });
  }
}