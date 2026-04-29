import { Component, OnInit } from '@angular/core';
import { Proceso } from '../../compartido/modelos/proceso.modelo';
import { ServicioProcesoService } from '../../compartido/servicios/servicio-proceso.service';

@Component({
  selector: 'app-procesos',
  standalone: false,
  templateUrl: './procesos.component.html',
  styleUrls: ['./procesos.component.css']
})
export class ProcesosComponent implements OnInit {

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

  constructor(private servicioProceso: ServicioProcesoService) {}

  ngOnInit(): void {
    this.listarProcesos();
  }

  listarProcesos(): void {
    this.servicioProceso.listarProcesos().subscribe({
      next: respuesta => this.procesos = respuesta,
      error: () => this.mensaje = 'No se pudieron cargar los procesos.'
    });
  }

  guardarProceso(): void {
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
        },
        error: () => this.mensaje = 'No se pudo actualizar el proceso.'
      });

      return;
    }

    this.servicioProceso.crearProceso(this.procesoFormulario).subscribe({
      next: () => {
        this.mensaje = 'Proceso creado correctamente.';
        this.limpiarFormulario();
        this.listarProcesos();
      },
      error: () => this.mensaje = 'No se pudo crear el proceso.'
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
  }

  eliminarProceso(proceso: Proceso): void {
    if (!proceso.id) {
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
      },
      error: () => this.mensaje = 'No se pudo eliminar el proceso.'
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