import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proceso } from '../modelos/proceso.modelo';

@Injectable({
  providedIn: 'root'
})
export class ServicioProcesoService {

  private readonly urlBase = 'http://localhost:8080/api/procesos';

  constructor(private http: HttpClient) {}

  crearProceso(proceso: Proceso): Observable<Proceso> {
    return this.http.post<Proceso>(this.urlBase, proceso);
  }

  listarProcesos(): Observable<Proceso[]> {
    return this.http.get<Proceso[]>(this.urlBase);
  }

  buscarProceso(id: string): Observable<Proceso> {
    return this.http.get<Proceso>(`${this.urlBase}/${id}`);
  }

  actualizarProceso(id: string, proceso: Proceso): Observable<Proceso> {
    return this.http.put<Proceso>(`${this.urlBase}/${id}`, proceso);
  }

  actualizarDiagrama(
    id: string,
    contenidoXml: string,
    contenidoJson: string,
    generadoPorIa: string
  ): Observable<Proceso> {
    return this.http.put<Proceso>(`${this.urlBase}/${id}/diagrama`, {
      contenidoXml,
      contenidoJson,
      generadoPorIa
    });
  }

  eliminarProceso(id: string): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${id}`);
  }
  
}