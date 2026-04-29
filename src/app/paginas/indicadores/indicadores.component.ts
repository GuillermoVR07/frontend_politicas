import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, finalize, timeout } from 'rxjs';

import { ServicioIndicadorService } from '../../compartido/servicios/servicio-indicador.service';
import { ServicioActualizacionService } from '../../compartido/servicios/servicio-actualizacion.service';
import { RespuestaIndicadores } from '../../compartido/modelos/indicador.modelo';

@Component({
  selector: 'app-indicadores',
  standalone: false,
  templateUrl: './indicadores.component.html',
  styleUrls: ['./indicadores.component.css']
})
export class IndicadoresComponent implements OnInit, OnDestroy {

  indicadores?: RespuestaIndicadores;

  departamentoId = '';
  resultadoCuelloBotella: any;

  mensaje = '';
  cargando = false;
  cargandoCuelloBotella = false;
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

          if (this.departamentoId) {
            this.verificarCuelloBotella();
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.suscripcionActualizacion?.unsubscribe();
  }

  obtenerIndicadores(): void {
    this.cargando = true;
    this.errorCarga = false;
    this.mensaje = 'Cargando indicadores...';

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
          this.mensaje = 'Indicadores actualizados.';
        },
        error: error => {
          console.error('Error al cargar indicadores:', error);
          this.indicadores = undefined;
          this.errorCarga = true;
          this.mensaje = 'No se pudieron cargar los indicadores. Verifique conexión con el backend o CORS.';
        }
      });
  }

  verificarCuelloBotella(): void {
    if (!this.departamentoId.trim()) {
      this.mensaje = 'Debe ingresar el identificador del departamento.';
      return;
    }

    this.cargandoCuelloBotella = true;
    this.resultadoCuelloBotella = null;

    this.servicioIndicador.verificarCuelloBotella(this.departamentoId)
      .pipe(
        timeout(8000),
        finalize(() => {
          this.cargandoCuelloBotella = false;
        })
      )
      .subscribe({
        next: respuesta => {
          this.resultadoCuelloBotella = respuesta;
          this.mensaje = 'Verificación de cuello de botella realizada.';
        },
        error: error => {
          console.error('Error al verificar cuello de botella:', error);
          this.mensaje = 'No se pudo verificar el cuello de botella.';
        }
      });
  }
}