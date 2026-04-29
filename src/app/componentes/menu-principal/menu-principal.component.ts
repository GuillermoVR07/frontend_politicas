import { Component } from '@angular/core';
import { ServicioActualizacionService } from '../../compartido/servicios/servicio-actualizacion.service';

@Component({
  selector: 'app-menu-principal',
  standalone: false,
  templateUrl: './menu-principal.component.html',
  styleUrls: ['./menu-principal.component.css']
})
export class MenuPrincipalComponent {

  constructor(private servicioActualizacion: ServicioActualizacionService) {}

  notificarRecargaGeneral(): void {
    this.servicioActualizacion.notificarActualizacion('todo');
  }
}