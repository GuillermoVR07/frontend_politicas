import { Component, OnInit } from '@angular/core';
import { Departamento } from '../../compartido/modelos/departamento.modelo';
import { ServicioDepartamentoService } from '../../compartido/servicios/servicio-departamento.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-departamentos',
  standalone: false,
  templateUrl: './departamentos.component.html',
  styleUrls: ['./departamentos.component.css']
})
export class DepartamentosComponent implements OnInit {

  departamentos: Departamento[] = [];

  departamentoNuevo: Departamento = {
    nombre: '',
    descripcion: ''
  };

  mensaje = '';

  constructor(private servicioDepartamento: ServicioDepartamentoService) {}

  ngOnInit(): void {
    this.listarDepartamentos();
  }

  listarDepartamentos(): void {
    this.servicioDepartamento.listarDepartamentos().subscribe({
      next: respuesta => this.departamentos = respuesta,
      error: () => this.mensaje = 'No se pudieron cargar los departamentos.'
    });
  }

  crearDepartamento(): void {
    this.servicioDepartamento.crearDepartamento(this.departamentoNuevo).subscribe({
      next: () => {
        this.mensaje = 'Departamento creado correctamente.';
        this.departamentoNuevo = { nombre: '', descripcion: '' };
        this.listarDepartamentos();
      },
      error: () => this.mensaje = 'No se pudo crear el departamento.'
    });
  }
}