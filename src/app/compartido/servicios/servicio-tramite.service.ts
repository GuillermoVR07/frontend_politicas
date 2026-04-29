import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tramite } from '../modelos/tramite.modelo';
import { EstadoTramite } from '../modelos/estado-tramite.modelo';

@Injectable({
  providedIn: 'root'
})
export class ServicioTramiteService {

  private readonly urlBase = 'http://localhost:8080/api/tramites';

  constructor(private http: HttpClient) {}

  crearTramite(solicitud: any): Observable<Tramite> {
    return this.http.post<Tramite>(this.urlBase, solicitud);
  }

  listarTramites(): Observable<Tramite[]> {
    return this.http.get<Tramite[]>(this.urlBase);
  }

  buscarTramite(id: string): Observable<Tramite> {
    return this.http.get<Tramite>(`${this.urlBase}/${id}`);
  }

  buscarPorCiudadano(identificacionCiudadano: string): Observable<Tramite[]> {
    return this.http.get<Tramite[]>(`${this.urlBase}/ciudadano/${identificacionCiudadano}`);
  }

  buscarPorDepartamento(departamentoId: string): Observable<Tramite[]> {
    return this.http.get<Tramite[]>(`${this.urlBase}/departamento/${departamentoId}`);
  }

  cambiarEstado(
    tramiteId: string,
    nuevoEstado: EstadoTramite,
    observacion: string,
    visibleParaCliente: boolean
  ): Observable<Tramite> {
    return this.http.put<Tramite>(`${this.urlBase}/${tramiteId}/cambiar-estado`, {
      nuevoEstado,
      observacion,
      visibleParaCliente
    });
  }

  cambiarDepartamento(
    tramiteId: string,
    nuevoDepartamentoId: string,
    nombreNuevoDepartamento: string,
    observacion: string,
    visibleParaCliente: boolean
  ): Observable<Tramite> {
    return this.http.put<Tramite>(`${this.urlBase}/${tramiteId}/cambiar-departamento`, {
      nuevoDepartamentoId,
      nombreNuevoDepartamento,
      observacion,
      visibleParaCliente
    });
  }

  actualizarTramite(id: string, solicitud: any): Observable<Tramite> {
    return this.http.put<Tramite>(`${this.urlBase}/${id}`, solicitud);
  }

  eliminarTramite(id: string): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${id}`);
  }
}