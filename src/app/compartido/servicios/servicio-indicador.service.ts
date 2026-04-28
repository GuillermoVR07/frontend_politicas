import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RespuestaIndicadores } from '../modelos/indicador.modelo';

@Injectable({
  providedIn: 'root'
})
export class ServicioIndicadorService {

  private readonly urlBase = 'http://localhost:8080/api/indicadores';

  constructor(private http: HttpClient) {}

  obtenerIndicadoresGenerales(): Observable<RespuestaIndicadores> {
    return this.http.get<RespuestaIndicadores>(`${this.urlBase}/generales`);
  }

  verificarCuelloBotella(departamentoId: string): Observable<any> {
    return this.http.get<any>(`${this.urlBase}/cuello-botella/departamento/${departamentoId}`);
  }
}