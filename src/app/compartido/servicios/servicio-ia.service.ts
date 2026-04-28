import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicioIaService {

  private readonly urlBase = 'http://localhost:8080/api/ia';

  constructor(private http: HttpClient) {}

  generarDiagrama(descripcionProceso: string): Observable<any> {
    return this.http.post<any>(`${this.urlBase}/generar-diagrama`, {
      descripcionProceso
    });
  }
}