import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Departamento } from '../../compartido/modelos/departamento.modelo';
import { ServicioDepartamentoService } from '../../compartido/servicios/servicio-departamento.service';
import { ServicioActualizacionService } from '../../compartido/servicios/servicio-actualizacion.service';

@Component({
  selector: 'app-departamentos',
  standalone: false,
  templateUrl: './departamentos.component.html',
  styleUrls: ['./departamentos.component.css']
})
export class DepartamentosComponent implements OnInit, OnDestroy {

  departamentos: Departamento[] = [];

  departamentoFormulario: Departamento = {
    nombre: '',
    descripcion: ''
  };

  departamentoEditandoId = '';
  modoEdicion = false;
  mensaje = '';
  cargando = false;

  private suscripcionActualizacion?: Subscription;

  constructor(
    private servicioDepartamento: ServicioDepartamentoService,
    private servicioActualizacion: ServicioActualizacionService
  ) {}

  ngOnInit(): void {
    this.listarDepartamentos();

    this.suscripcionActualizacion = this.servicioActualizacion.actualizacion$
      .subscribe(tipo => {
        if (tipo === 'departamentos' || tipo === 'todo') {
          this.listarDepartamentos();
        }
      });
  }

  ngOnDestroy(): void {
    this.suscripcionActualizacion?.unsubscribe();
  }

  listarDepartamentos(): void {
    this.cargando = true;
    this.mensaje = 'Cargando departamentos...';

    this.servicioDepartamento.listarDepartamentos().subscribe({
      next: respuesta => {
        this.departamentos = respuesta;
        this.cargando = false;
        this.mensaje = respuesta.length === 0
          ? 'No hay departamentos registrados.'
          : 'Departamentos cargados correctamente.';
      },
      error: () => {
        this.cargando = false;
        this.mensaje = 'No se pudieron cargar los departamentos.';
      }
    });
  }

  guardarDepartamento(): void {
    if (!this.departamentoFormulario.nombre.trim()) {
      this.mensaje = 'Debe ingresar el nombre del departamento.';
      return;
    }

    if (this.modoEdicion && this.departamentoEditandoId) {
      this.servicioDepartamento.actualizarDepartamento(
        this.departamentoEditandoId,
        this.departamentoFormulario
      ).subscribe({
        next: () => {
          this.mensaje = 'Departamento actualizado correctamente.';
          this.limpiarFormulario();
          this.listarDepartamentos();
          this.servicioActualizacion.notificarActualizacion('departamentos');
          this.servicioActualizacion.notificarActualizacion('tramites');
        },
        error: () => {
          this.mensaje = 'No se pudo actualizar el departamento.';
        }
      });

      return;
    }

    this.servicioDepartamento.crearDepartamento(this.departamentoFormulario).subscribe({
      next: () => {
        this.mensaje = 'Departamento creado correctamente.';
        this.limpiarFormulario();
        this.listarDepartamentos();
        this.servicioActualizacion.notificarActualizacion('departamentos');
        this.servicioActualizacion.notificarActualizacion('tramites');
      },
      error: () => {
        this.mensaje = 'No se pudo crear el departamento.';
      }
    });
  }

  editarDepartamento(departamento: Departamento): void {
    this.modoEdicion = true;
    this.departamentoEditandoId = departamento.id || '';

    this.departamentoFormulario = {
      nombre: departamento.nombre,
      descripcion: departamento.descripcion
    };

    this.mensaje = 'Editando departamento seleccionado.';
  }

  eliminarDepartamento(departamento: Departamento): void {
    if (!departamento.id) {
      this.mensaje = 'No se encontró el identificador del departamento.';
      return;
    }

    const confirmar = confirm(
      `¿Seguro que desea eliminar el departamento "${departamento.nombre}"?`
    );

    if (!confirmar) {
      return;
    }

    this.servicioDepartamento.eliminarDepartamento(departamento.id).subscribe({
      next: () => {
        this.mensaje = 'Departamento eliminado correctamente.';
        this.listarDepartamentos();
        this.servicioActualizacion.notificarActualizacion('departamentos');
        this.servicioActualizacion.notificarActualizacion('tramites');
      },
      error: () => {
        this.mensaje = 'No se pudo eliminar el departamento.';
      }
    });
  }

  limpiarFormulario(): void {
    this.departamentoFormulario = {
      nombre: '',
      descripcion: ''
    };

    this.departamentoEditandoId = '';
    this.modoEdicion = false;
  }
}