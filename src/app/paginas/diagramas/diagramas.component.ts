import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';

import { ServicioIaService } from '../../compartido/servicios/servicio-ia.service';
import { ServicioProcesoService } from '../../compartido/servicios/servicio-proceso.service';

import BpmnModeler from 'bpmn-js/lib/Modeler';

declare var window: any;

@Component({
  selector: 'app-diagramas',
  standalone: false,
  templateUrl: './diagramas.component.html',
  styleUrls: ['./diagramas.component.css']
})
export class DiagramasComponent implements AfterViewInit, OnDestroy {

  @ViewChild('contenedorDiagrama', { static: true })
  contenedorDiagrama!: ElementRef;

  procesoId = '';
  descripcionProceso = '';
  respuestaIa: any;
  mensaje = '';

  escuchandoVoz = false;
  
  xmlActual = '';

  private modeladorBpmn: any;

  constructor(
    private servicioIa: ServicioIaService,
    private servicioProceso: ServicioProcesoService
  ) {}

  ngAfterViewInit(): void {
    this.inicializarModelador();
  }

  ngOnDestroy(): void {
    if (this.modeladorBpmn) {
      this.modeladorBpmn.destroy();
    }
  }

  inicializarModelador(): void {
    this.modeladorBpmn = new BpmnModeler({
      container: this.contenedorDiagrama.nativeElement
    });

    this.cargarDiagramaBase();
  }

  cargarDiagramaBase(): void {
    this.modeladorBpmn.importXML(this.obtenerXmlBase())
      .then(() => {
        this.mensaje = 'Diagrama base cargado correctamente.';
      })
      .catch(() => {
        this.mensaje = 'No se pudo cargar el diagrama base.';
      });
  }

  generarDiagramaConIa(): void {
    if (!this.descripcionProceso.trim()) {
      this.mensaje = 'Debe ingresar una descripción del proceso.';
      return;
    }

    this.servicioIa.generarDiagrama(this.descripcionProceso).subscribe({
      next: respuesta => {
        this.respuestaIa = respuesta;
        this.mensaje = 'Borrador generado por IA. Revise la respuesta y ajuste el diagrama manualmente.';
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

  obtenerXmlDelDiagrama(): void {
    if (!this.modeladorBpmn) {
      this.mensaje = 'El modelador todavía no está disponible.';
      return;
    }

    this.modeladorBpmn.saveXML({ format: true })
      .then((resultado: any) => {
        this.xmlActual = resultado.xml;
        this.mensaje = 'XML del diagrama obtenido correctamente.';
      })
      .catch(() => {
        this.mensaje = 'No se pudo obtener el XML del diagrama.';
      });
  }

  limpiarRespuestaIa(): void {
    this.respuestaIa = null;
  }

  guardarDiagramaEnProceso(): void {
    if (!this.procesoId.trim()) {
      this.mensaje = 'Debe ingresar el identificador del proceso.';
      return;
    }

    if (!this.modeladorBpmn) {
      this.mensaje = 'El modelador todavía no está disponible.';
      return;
    }

    this.modeladorBpmn.saveXML({ format: true })
      .then((resultado: any) => {
        const xml = resultado.xml;
        this.xmlActual = xml;

        this.servicioProceso.actualizarDiagrama(
          this.procesoId,
          xml,
          '',
          this.respuestaIa ? JSON.stringify(this.respuestaIa) : ''
        ).subscribe({
          next: () => {
            this.mensaje = 'Diagrama guardado correctamente en el proceso.';
          },
          error: () => {
            this.mensaje = 'No se pudo guardar el diagrama en el proceso.';
          }
        });
      })
      .catch(() => {
        this.mensaje = 'No se pudo obtener el XML para guardar.';
      });
  }

  cargarDiagramaDesdeProceso(): void {
    if (!this.procesoId.trim()) {
      this.mensaje = 'Debe ingresar el identificador del proceso.';
      return;
    }

    this.servicioProceso.buscarProceso(this.procesoId).subscribe({
      next: proceso => {
        if (proceso.diagrama && proceso.diagrama.contenidoXml) {
          this.modeladorBpmn.importXML(proceso.diagrama.contenidoXml)
            .then(() => {
              this.xmlActual = proceso.diagrama?.contenidoXml || '';
              this.mensaje = 'Diagrama cargado desde el proceso.';
            })
            .catch(() => {
              this.mensaje = 'No se pudo cargar el XML guardado del proceso.';
            });
        } else {
          this.mensaje = 'El proceso no tiene un diagrama guardado.';
        }
      },
      error: () => {
        this.mensaje = 'No se pudo buscar el proceso.';
      }
    });
  }

  obtenerXmlBase(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Definiciones_Proceso_Demostracion"
  targetNamespace="http://politicas-negocio/proceso">

  <bpmn:process id="Proceso_Tramite_Empresarial" name="Solicitud de trámite empresarial" isExecutable="false">
    <bpmn:startEvent id="Inicio" name="Inicio">
      <bpmn:outgoing>Flujo_1</bpmn:outgoing>
    </bpmn:startEvent>

    <bpmn:task id="AtencionCliente" name="Atención al cliente">
      <bpmn:incoming>Flujo_1</bpmn:incoming>
      <bpmn:outgoing>Flujo_2</bpmn:outgoing>
    </bpmn:task>

    <bpmn:task id="Evaluacion" name="Evaluación">
      <bpmn:incoming>Flujo_2</bpmn:incoming>
      <bpmn:outgoing>Flujo_3</bpmn:outgoing>
    </bpmn:task>

    <bpmn:task id="Legal" name="Legal">
      <bpmn:incoming>Flujo_3</bpmn:incoming>
      <bpmn:outgoing>Flujo_4</bpmn:outgoing>
    </bpmn:task>

    <bpmn:task id="Almacen" name="Almacén">
      <bpmn:incoming>Flujo_4</bpmn:incoming>
      <bpmn:outgoing>Flujo_5</bpmn:outgoing>
    </bpmn:task>

    <bpmn:endEvent id="Fin" name="Finalizado">
      <bpmn:incoming>Flujo_5</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="Flujo_1" sourceRef="Inicio" targetRef="AtencionCliente" />
    <bpmn:sequenceFlow id="Flujo_2" sourceRef="AtencionCliente" targetRef="Evaluacion" />
    <bpmn:sequenceFlow id="Flujo_3" sourceRef="Evaluacion" targetRef="Legal" />
    <bpmn:sequenceFlow id="Flujo_4" sourceRef="Legal" targetRef="Almacen" />
    <bpmn:sequenceFlow id="Flujo_5" sourceRef="Almacen" targetRef="Fin" />
  </bpmn:process>

  <bpmndi:BPMNDiagram id="Diagrama_Proceso_Tramite_Empresarial">
    <bpmndi:BPMNPlane id="Plano_Proceso_Tramite_Empresarial" bpmnElement="Proceso_Tramite_Empresarial">

      <bpmndi:BPMNShape id="Forma_Inicio" bpmnElement="Inicio">
        <dc:Bounds x="120" y="180" width="36" height="36" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Forma_AtencionCliente" bpmnElement="AtencionCliente">
        <dc:Bounds x="210" y="158" width="130" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Forma_Evaluacion" bpmnElement="Evaluacion">
        <dc:Bounds x="390" y="158" width="120" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Forma_Legal" bpmnElement="Legal">
        <dc:Bounds x="560" y="158" width="120" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Forma_Almacen" bpmnElement="Almacen">
        <dc:Bounds x="730" y="158" width="120" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Forma_Fin" bpmnElement="Fin">
        <dc:Bounds x="910" y="180" width="36" height="36" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNEdge id="Linea_Flujo_1" bpmnElement="Flujo_1">
        <di:waypoint x="156" y="198" />
        <di:waypoint x="210" y="198" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Linea_Flujo_2" bpmnElement="Flujo_2">
        <di:waypoint x="340" y="198" />
        <di:waypoint x="390" y="198" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Linea_Flujo_3" bpmnElement="Flujo_3">
        <di:waypoint x="510" y="198" />
        <di:waypoint x="560" y="198" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Linea_Flujo_4" bpmnElement="Flujo_4">
        <di:waypoint x="680" y="198" />
        <di:waypoint x="730" y="198" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Linea_Flujo_5" bpmnElement="Flujo_5">
        <di:waypoint x="850" y="198" />
        <di:waypoint x="910" y="198" />
      </bpmndi:BPMNEdge>

    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
  }
}