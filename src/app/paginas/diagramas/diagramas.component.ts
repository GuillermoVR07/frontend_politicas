import { Component } from '@angular/core';
import { ServicioIaService } from '../../compartido/servicios/servicio-ia.service';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
declare var window: any;

@Component({
  selector: 'app-diagramas',
  standalone: false,
  templateUrl: './diagramas.component.html',
  styleUrls: ['./diagramas.component.css']
})
export class DiagramasComponent {

  descripcionProceso = '';
  respuestaIa: any;
  mensaje = '';

  escuchandoVoz = false;

  constructor(private servicioIa: ServicioIaService) {}

  generarDiagramaConIa(): void {
    if (!this.descripcionProceso.trim()) {
      this.mensaje = 'Debe ingresar una descripción del proceso.';
      return;
    }

    this.servicioIa.generarDiagrama(this.descripcionProceso).subscribe({
      next: respuesta => {
        this.respuestaIa = respuesta;
        this.mensaje = 'Borrador generado por IA.';
      },
      error: () => {
        this.mensaje = 'No se pudo generar el diagrama con IA.';
      }
    });
  }

  iniciarReconocimientoVoz(): void {
    const ReconocimientoVoz = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!ReconocimientoVoz) {
      this.mensaje = 'El navegador no permite reconocimiento de voz.';
      return;
    }

    const reconocimiento = new ReconocimientoVoz();
    reconocimiento.lang = 'es-ES';
    reconocimiento.interimResults = false;
    reconocimiento.maxAlternatives = 1;

    this.escuchandoVoz = true;
    this.mensaje = 'Escuchando...';

    reconocimiento.start();

    reconocimiento.onresult = (evento: any) => {
      const texto = evento.results[0][0].transcript;
      this.descripcionProceso = texto;
      this.escuchandoVoz = false;
      this.mensaje = 'Texto capturado desde voz.';
    };

    reconocimiento.onerror = () => {
      this.escuchandoVoz = false;
      this.mensaje = 'No se pudo capturar la voz.';
    };

    reconocimiento.onend = () => {
      this.escuchandoVoz = false;
    };
  }
}