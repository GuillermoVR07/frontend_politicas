import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, finalize, timeout } from 'rxjs';

import { Proceso } from '../../compartido/modelos/proceso.modelo';
import { ServicioProcesoService } from '../../compartido/servicios/servicio-proceso.service';
import { ServicioActualizacionService } from '../../compartido/servicios/servicio-actualizacion.service';

@Component({
  selector: 'app-procesos',
  standalone: false,
  templateUrl: './procesos.component.html',
  styleUrls: ['./procesos.component.css']
})
export class ProcesosComponent implements OnInit, OnDestroy {

  procesos: Proceso[] = [];

  procesoFormulario: Proceso = {
    nombre: '',
    descripcion: '',
    departamentos: []
  };

  departamentosTexto = '';
  procesoEditandoId = '';
  modoEdicion = false;
  mensaje = '';
  cargando = false;

  private suscripcionActualizacion?: Subscription;

  constructor(
    private servicioProceso: ServicioProcesoService,
    private servicioActualizacion: ServicioActualizacionService,
    private detectorCambios: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.listarProcesos();

    this.suscripcionActualizacion = this.servicioActualizacion.actualizacion$
      .subscribe(tipo => {
        if (tipo === 'procesos' || tipo === 'todo') {
          this.listarProcesos();
        }
      });
  }

  ngOnDestroy(): void {
    this.suscripcionActualizacion?.unsubscribe();
  }

  listarProcesos(): void {
    this.cargando = true;
    this.mensaje = 'Cargando procesos...';

    this.servicioProceso.listarProcesos()
      .pipe(
        timeout(8000),
        finalize(() => {
          this.cargando = false;
          this.actualizarVista();
        })
      )
      .subscribe({
        next: respuesta => {
          this.procesos = respuesta;
          this.mensaje = respuesta.length === 0
            ? 'No hay procesos registrados.'
            : 'Procesos cargados correctamente.';
        },
        error: () => {
          this.procesos = [];
          this.mensaje = 'No se pudieron cargar los procesos.';
        }
      });
  }

  private actualizarVista(): void {
    this.detectorCambios.detectChanges();
  }

  guardarProceso(): void {
    if (!this.procesoFormulario.nombre.trim()) {
      this.mensaje = 'Debe ingresar el nombre del proceso.';
      this.actualizarVista();
      return;
    }

    this.procesoFormulario.departamentos = this.departamentosTexto
      .split(',')
      .map(valor => valor.trim())
      .filter(valor => valor.length > 0);

    if (this.modoEdicion && this.procesoEditandoId) {
      this.servicioProceso.actualizarProceso(
        this.procesoEditandoId,
        this.procesoFormulario
      ).subscribe({
        next: () => {
          this.mensaje = 'Proceso actualizado correctamente.';
          this.limpiarFormulario();
          this.listarProcesos();
          this.servicioActualizacion.notificarActualizacion('procesos');
          this.servicioActualizacion.notificarActualizacion('tramites');
          this.servicioActualizacion.notificarActualizacion('diagramas');
          this.actualizarVista();
        },
        error: () => {
          this.mensaje = 'No se pudo actualizar el proceso.';
          this.actualizarVista();
        }
      });

      return;
    }

    this.servicioProceso.crearProceso(this.procesoFormulario).subscribe({
      next: () => {
        this.mensaje = 'Proceso creado correctamente.';
        this.limpiarFormulario();
        this.listarProcesos();
        this.servicioActualizacion.notificarActualizacion('procesos');
        this.servicioActualizacion.notificarActualizacion('tramites');
        this.servicioActualizacion.notificarActualizacion('diagramas');
        this.actualizarVista();
      },
      error: () => {
        this.mensaje = 'No se pudo crear el proceso.';
        this.actualizarVista();
      }
    });
  }

  editarProceso(proceso: Proceso): void {
    this.modoEdicion = true;
    this.procesoEditandoId = proceso.id || '';

    this.procesoFormulario = {
      nombre: proceso.nombre,
      descripcion: proceso.descripcion,
      departamentos: [...proceso.departamentos],
      diagrama: proceso.diagrama
    };

    this.departamentosTexto = proceso.departamentos.join(', ');
    this.mensaje = 'Editando proceso seleccionado.';
    this.actualizarVista();
  }

  eliminarProceso(proceso: Proceso): void {
    if (!proceso.id) {
      this.mensaje = 'No se encontró el identificador del proceso.';
      return;
    }

    const confirmar = confirm(`¿Seguro que desea eliminar el proceso "${proceso.nombre}"?`);

    if (!confirmar) {
      return;
    }

    this.servicioProceso.eliminarProceso(proceso.id).subscribe({
      next: () => {
        this.mensaje = 'Proceso eliminado correctamente.';
        this.listarProcesos();
        this.servicioActualizacion.notificarActualizacion('procesos');
        this.servicioActualizacion.notificarActualizacion('tramites');
        this.servicioActualizacion.notificarActualizacion('diagramas');
        this.actualizarVista();
      },
      error: () => {
        this.mensaje = 'No se pudo eliminar el proceso.';
        this.actualizarVista();
      }
    });
  }

  limpiarFormulario(): void {
    this.procesoFormulario = {
      nombre: '',
      descripcion: '',
      departamentos: []
    };

    this.departamentosTexto = '';
    this.procesoEditandoId = '';
    this.modoEdicion = false;
  }
}
