import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { Subscription, timeout } from 'rxjs';

import { ServicioIaService } from '../../compartido/servicios/servicio-ia.service';
import { ServicioProcesoService } from '../../compartido/servicios/servicio-proceso.service';
import { ServicioActualizacionService } from '../../compartido/servicios/servicio-actualizacion.service';

import { Proceso } from '../../compartido/modelos/proceso.modelo';

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

  procesos: Proceso[] = [];

  procesoId = '';
  descripcionProceso = '';
  respuestaIa: any;
  mensaje = '';

  escuchandoVoz = false;
  xmlActual = '';
  private esNavegador = false;

  private modeladorBpmn: any;
  private suscripcionActualizacion?: Subscription;

  constructor(
    private servicioIa: ServicioIaService,
    private servicioProceso: ServicioProcesoService,
    private servicioActualizacion: ServicioActualizacionService,
    private detectorCambios: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private plataformaId: object
  ) {
    this.esNavegador = isPlatformBrowser(this.plataformaId);
  }

  ngAfterViewInit(): void {
    if (this.esNavegador) {
      this.inicializarModelador();
    }

    this.listarProcesos();

    this.suscripcionActualizacion = this.servicioActualizacion.actualizacion$
      .subscribe(tipo => {
        if (tipo === 'procesos' || tipo === 'diagramas' || tipo === 'todo') {
          this.listarProcesos();
        }
      });
  }

  ngOnDestroy(): void {
    this.suscripcionActualizacion?.unsubscribe();

    if (this.modeladorBpmn) {
      this.modeladorBpmn.destroy();
    }
  }

  listarProcesos(): void {
    this.servicioProceso.listarProcesos().pipe(timeout(8000)).subscribe({
      next: respuesta => {
        this.procesos = respuesta;
        this.actualizarVista();
      },
      error: () => {
        this.mensaje = 'No se pudieron cargar los procesos.';
        this.actualizarVista();
      }
    });
  }

  private actualizarVista(): void {
    this.detectorCambios.detectChanges();
  }

  inicializarModelador(): void {
    this.modeladorBpmn = new BpmnModeler({
      container: this.contenedorDiagrama.nativeElement
    });

    this.cargarDiagramaBase();
  }

  cargarDiagramaBase(): void {
    if (!this.modeladorBpmn) {
      this.mensaje = 'El modelador todavía no está disponible.';
      return;
    }

    this.modeladorBpmn.importXML(this.obtenerXmlBase())
      .then(() => {
        this.mensaje = 'Diagrama base cargado correctamente.';
        this.actualizarVista();
      })
      .catch(() => {
        this.mensaje = 'No se pudo cargar el diagrama base.';
        this.actualizarVista();
      });
  }

  generarDiagramaConIa(): void {
    if (!this.descripcionProceso.trim()) {
      this.mensaje = 'Debe ingresar una descripción del proceso.';
      return;
    }

    if (!this.modeladorBpmn) {
      this.mensaje = 'El modelador BPMN todavía no está disponible.';
      return;
    }

    this.servicioIa.generarDiagrama(this.descripcionProceso).subscribe({
      next: respuesta => {
        this.respuestaIa = respuesta;

        const xmlGenerado = this.convertirRespuestaIaABpmn(respuesta);

        this.modeladorBpmn.importXML(xmlGenerado)
          .then(() => {
            this.xmlActual = xmlGenerado;
            this.mensaje = 'Diagrama generado automáticamente con IA. Puede corregirlo manualmente.';
          })
          .catch(() => {
            this.mensaje = 'La IA respondió, pero no se pudo cargar el diagrama automáticamente.';
          });
      },
      error: () => {
        this.mensaje = 'No se pudo generar el diagrama con IA.';
      }
    });
  }

  iniciarReconocimientoVoz(): void {
    if (!this.esNavegador) {
      return;
    }

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
      this.mensaje = 'Texto capturado desde voz. Generando diagrama automáticamente...';

      this.generarDiagramaConIa();
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

  guardarDiagramaEnProceso(): void {
    if (!this.procesoId.trim()) {
      this.mensaje = 'Debe seleccionar un proceso.';
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
            this.servicioActualizacion.notificarActualizacion('diagramas');
            this.servicioActualizacion.notificarActualizacion('procesos');
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
      this.mensaje = 'Debe seleccionar un proceso.';
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

  limpiarRespuestaIa(): void {
    this.respuestaIa = null;
  }

  convertirRespuestaIaABpmn(respuesta: any): string {
    const actividades = respuesta.actividades || [];
    const conexiones = respuesta.conexiones || [];

    if (actividades.length === 0) {
      return this.obtenerXmlBase();
    }

    let elementosProceso = '';
    let elementosDiagrama = '';
    let elementosLineas = '';

    const inicioId = 'Inicio';
    const finId = 'Fin';

    elementosProceso += `
      <bpmn:startEvent id="${inicioId}" name="Inicio">
        <bpmn:outgoing>Flujo_Inicio</bpmn:outgoing>
      </bpmn:startEvent>
    `;

    actividades.forEach((actividad: any, indice: number) => {
      const idActividad = this.limpiarIdBpmn(actividad.id || `Actividad_${indice + 1}`);
      const nombreActividad = this.escaparXml(actividad.nombre || `Actividad ${indice + 1}`);

      const flujoEntrada = indice === 0
        ? 'Flujo_Inicio'
        : `Flujo_${this.limpiarIdBpmn(actividades[indice - 1].id)}_${idActividad}`;

      const flujoSalida = indice === actividades.length - 1
        ? 'Flujo_Fin'
        : `Flujo_${idActividad}_${this.limpiarIdBpmn(actividades[indice + 1].id)}`;

      elementosProceso += `
        <bpmn:task id="${idActividad}" name="${nombreActividad}">
          <bpmn:incoming>${flujoEntrada}</bpmn:incoming>
          <bpmn:outgoing>${flujoSalida}</bpmn:outgoing>
        </bpmn:task>
      `;
    });

    elementosProceso += `
      <bpmn:endEvent id="${finId}" name="Finalizado">
        <bpmn:incoming>Flujo_Fin</bpmn:incoming>
      </bpmn:endEvent>
    `;

    elementosProceso += `
      <bpmn:sequenceFlow id="Flujo_Inicio" sourceRef="${inicioId}" targetRef="${this.limpiarIdBpmn(actividades[0].id)}" />
    `;

    conexiones.forEach((conexion: any) => {
      const origen = this.limpiarIdBpmn(conexion.origen);
      const destino = this.limpiarIdBpmn(conexion.destino);

      elementosProceso += `
        <bpmn:sequenceFlow id="Flujo_${origen}_${destino}" sourceRef="${origen}" targetRef="${destino}" />
      `;
    });

    const ultimaActividad = actividades[actividades.length - 1];

    elementosProceso += `
      <bpmn:sequenceFlow id="Flujo_Fin" sourceRef="${this.limpiarIdBpmn(ultimaActividad.id)}" targetRef="${finId}" />
    `;

    elementosDiagrama += `
      <bpmndi:BPMNShape id="Forma_Inicio" bpmnElement="${inicioId}">
        <dc:Bounds x="120" y="180" width="36" height="36" />
      </bpmndi:BPMNShape>
    `;

    actividades.forEach((actividad: any, indice: number) => {
      const idActividad = this.limpiarIdBpmn(actividad.id);
      const posicionX = 220 + indice * 180;

      elementosDiagrama += `
        <bpmndi:BPMNShape id="Forma_${idActividad}" bpmnElement="${idActividad}">
          <dc:Bounds x="${posicionX}" y="158" width="130" height="80" />
        </bpmndi:BPMNShape>
      `;
    });

    const posicionFinX = 220 + actividades.length * 180;

    elementosDiagrama += `
      <bpmndi:BPMNShape id="Forma_Fin" bpmnElement="${finId}">
        <dc:Bounds x="${posicionFinX}" y="180" width="36" height="36" />
      </bpmndi:BPMNShape>
    `;

    elementosLineas += `
      <bpmndi:BPMNEdge id="Linea_Flujo_Inicio" bpmnElement="Flujo_Inicio">
        <di:waypoint x="156" y="198" />
        <di:waypoint x="220" y="198" />
      </bpmndi:BPMNEdge>
    `;

    conexiones.forEach((conexion: any, indice: number) => {
      const origen = this.limpiarIdBpmn(conexion.origen);
      const destino = this.limpiarIdBpmn(conexion.destino);

      const xInicio = 350 + indice * 180;
      const xFin = 400 + indice * 180;

      elementosLineas += `
        <bpmndi:BPMNEdge id="Linea_Flujo_${origen}_${destino}" bpmnElement="Flujo_${origen}_${destino}">
          <di:waypoint x="${xInicio}" y="198" />
          <di:waypoint x="${xFin}" y="198" />
        </bpmndi:BPMNEdge>
      `;
    });

    elementosLineas += `
      <bpmndi:BPMNEdge id="Linea_Flujo_Fin" bpmnElement="Flujo_Fin">
        <di:waypoint x="${posicionFinX - 50}" y="198" />
        <di:waypoint x="${posicionFinX}" y="198" />
      </bpmndi:BPMNEdge>
    `;

    return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Definiciones_Proceso_IA"
  targetNamespace="http://politicas-negocio/proceso-ia">

  <bpmn:process id="Proceso_Generado_IA" name="${this.escaparXml(respuesta.nombreProceso || 'Proceso generado con IA')}" isExecutable="false">
    ${elementosProceso}
  </bpmn:process>

  <bpmndi:BPMNDiagram id="Diagrama_Proceso_IA">
    <bpmndi:BPMNPlane id="Plano_Proceso_IA" bpmnElement="Proceso_Generado_IA">
      ${elementosDiagrama}
      ${elementosLineas}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
  }

  limpiarIdBpmn(valor: string): string {
    if (!valor) {
      return 'Actividad';
    }

    return valor
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .replace(/Ñ/g, 'N')
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  escaparXml(valor: string): string {
    if (!valor) {
      return '';
    }

    return valor
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
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
