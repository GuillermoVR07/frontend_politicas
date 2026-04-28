import { Component, OnInit } from '@angular/core';
import { ServicioIndicadorService } from '../../compartido/servicios/servicio-indicador.service';
import { RespuestaIndicadores } from '../../compartido/modelos/indicador.modelo';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-indicadores',
  standalone: false,
  templateUrl: './indicadores.component.html',
  styleUrls: ['./indicadores.component.css']
})
export class IndicadoresComponent implements OnInit {

  indicadores?: RespuestaIndicadores;

  departamentoId = '';
  resultadoCuelloBotella: any;
  mensaje = '';

  constructor(private servicioIndicador: ServicioIndicadorService) {}

  ngOnInit(): void {
    this.obtenerIndicadores();
  }

  obtenerIndicadores(): void {
    this.servicioIndicador.obtenerIndicadoresGenerales().subscribe({
      next: respuesta => this.indicadores = respuesta,
      error: () => this.mensaje = 'No se pudieron cargar los indicadores.'
    });
  }

  verificarCuelloBotella(): void {
    this.servicioIndicador.verificarCuelloBotella(this.departamentoId).subscribe({
      next: respuesta => this.resultadoCuelloBotella = respuesta,
      error: () => this.mensaje = 'No se pudo verificar el cuello de botella.'
    });
  }
}