import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, finalize, timeout } from 'rxjs';

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
  errorCarga = false;

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
    this.errorCarga = false;
    this.mensaje = 'Cargando KPIs...';

    this.servicioIndicador.obtenerIndicadoresGenerales()
      .pipe(
        timeout(8000),
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: respuesta => {
          this.indicadores = respuesta;
          this.errorCarga = false;
          this.mensaje = 'KPIs cargados correctamente.';
        },
        error: error => {
          console.error('Error al cargar KPIs:', error);
          this.indicadores = undefined;
          this.errorCarga = true;
          this.mensaje = 'No se pudieron cargar los KPIs. Verifique conexión con el backend o CORS.';
        }
      });
  }
}