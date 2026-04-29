import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type TipoActualizacion =
  | 'procesos'
  | 'departamentos'
  | 'tramites'
  | 'documentos'
  | 'indicadores'
  | 'diagramas'
  | 'todo';

@Injectable({
  providedIn: 'root'
})
export class ServicioActualizacionService {

  private actualizacionSubject = new Subject<TipoActualizacion>();

  actualizacion$ = this.actualizacionSubject.asObservable();

  notificarActualizacion(tipo: TipoActualizacion): void {
    this.actualizacionSubject.next(tipo);
  }
}