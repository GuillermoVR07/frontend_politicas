import { Component } from '@angular/core';
import { ServicioTramiteService } from '../../compartido/servicios/servicio-tramite.service';
import { Tramite } from '../../compartido/modelos/tramite.modelo';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-panel-funcionario',
  standalone: false,
  templateUrl: './panel-funcionario.component.html',
  styleUrls: ['./panel-funcionario.component.css']
})
export class PanelFuncionarioComponent {

  departamentoId = '';
  tramites: Tramite[] = [];
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
        this.mensaje = '';
      },
      error: () => {
        this.mensaje = 'No se pudieron cargar los trámites del departamento.';
      }
    });
  }
}