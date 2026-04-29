import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { ServicioIndicadorService } from '../../compartido/servicios/servicio-indicador.service';
import { ServicioActualizacionService } from '../../compartido/servicios/servicio-actualizacion.service';
import { RespuestaIndicadores } from '../../compartido/modelos/indicador.modelo';

@Component({
  selector: 'app-panel-administrador',
  standalone: false,
  templateUrl: './panel-administrador.component.html',
  styleUrls: ['./panel-administrador.component.css']
})
export class PanelAdministradorComponent implements OnInit, OnDestroy {

  indicadores?: RespuestaIndicadores;
  mensaje = '';
  cargando = false;

  private suscripcionActualizacion?: Subscription;

  constructor(
    private servicioIndicador: ServicioIndicadorService,
    private servicioActualizacion: ServicioActualizacionService
  ) {}

  ngOnInit(): void {
    this.obtenerIndicadores();

    this.suscripcionActualizacion = this.servicioActualizacion.actualizacion$
      .subscribe(tipo => {
        if (
          tipo === 'indicadores' ||
          tipo === 'tramites' ||
          tipo === 'todo'
        ) {
          this.obtenerIndicadores();
        }
      });
  }

  ngOnDestroy(): void {
    this.suscripcionActualizacion?.unsubscribe();
  }

  obtenerIndicadores(): void {
    this.cargando = true;
    this.mensaje = 'Cargando indicadores...';

    this.servicioIndicador.obtenerIndicadoresGenerales().subscribe({
      next: respuesta => {
        this.indicadores = respuesta;
        this.cargando = false;
        this.mensaje = 'Indicadores cargados correctamente.';
      },
      error: () => {
        this.cargando = false;
        this.mensaje = 'No se pudieron cargar los indicadores.';
      }
    });
  }
}