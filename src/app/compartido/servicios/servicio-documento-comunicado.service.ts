import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentoComunicado } from '../modelos/documento-comunicado.modelo';

@Injectable({
  providedIn: 'root'
})
export class ServicioDocumentoComunicadoService {

  private readonly urlBase = 'http://localhost:8080/api/documentos-comunicados';

  constructor(private http: HttpClient) {}

  crearDocumentoComunicado(documentoComunicado: DocumentoComunicado): Observable<DocumentoComunicado> {
    return this.http.post<DocumentoComunicado>(this.urlBase, documentoComunicado);
  }

  listarPorTramite(tramiteId: string): Observable<DocumentoComunicado[]> {
    return this.http.get<DocumentoComunicado[]>(`${this.urlBase}/tramite/${tramiteId}`);
  }

  listarVisiblesParaCliente(tramiteId: string): Observable<DocumentoComunicado[]> {
    return this.http.get<DocumentoComunicado[]>(`${this.urlBase}/tramite/${tramiteId}/visibles-cliente`);
  }
}