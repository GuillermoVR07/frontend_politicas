import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Departamento } from '../modelos/departamento.modelo';

@Injectable({
  providedIn: 'root'
})
export class ServicioDepartamentoService {

  private readonly urlBase = 'http://localhost:8080/api/departamentos';

  constructor(private http: HttpClient) {}

  crearDepartamento(departamento: Departamento): Observable<Departamento> {
    return this.http.post<Departamento>(this.urlBase, departamento);
  }

  listarDepartamentos(): Observable<Departamento[]> {
    return this.http.get<Departamento[]>(this.urlBase);
  }

  buscarDepartamento(id: string): Observable<Departamento> {
    return this.http.get<Departamento>(`${this.urlBase}/${id}`);
  }

  actualizarDepartamento(id: string, departamento: Departamento): Observable<Departamento> {
    return this.http.put<Departamento>(`${this.urlBase}/${id}`, departamento);
  }
}