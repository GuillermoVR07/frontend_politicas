import { Component, OnInit } from '@angular/core';
import { Proceso } from '../../compartido/modelos/proceso.modelo';
import { ServicioProcesoService } from '../../compartido/servicios/servicio-proceso.service';
import { FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-procesos',
  standalone: false,
  templateUrl: './procesos.component.html',
  styleUrls: ['./procesos.component.css']
})
export class ProcesosComponent implements OnInit {

  procesos: Proceso[] = [];

  procesoNuevo: Proceso = {
    nombre: '',
    descripcion: '',
    departamentos: []
  };

  departamentosTexto = '';
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

  crearProceso(): void {
    this.procesoNuevo.departamentos = this.departamentosTexto
      .split(',')
      .map(valor => valor.trim())
      .filter(valor => valor.length > 0);

    this.servicioProceso.crearProceso(this.procesoNuevo).subscribe({
      next: () => {
        this.mensaje = 'Proceso creado correctamente.';
        this.procesoNuevo = { nombre: '', descripcion: '', departamentos: [] };
        this.departamentosTexto = '';
        this.listarProcesos();
      },
      error: () => this.mensaje = 'No se pudo crear el proceso.'
    });
  }
}