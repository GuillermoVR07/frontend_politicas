import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PanelAdministradorComponent } from './paginas/panel-administrador/panel-administrador.component';
import { PanelFuncionarioComponent } from './paginas/panel-funcionario/panel-funcionario.component';
import { ProcesosComponent } from './paginas/procesos/procesos.component';
import { TramitesComponent } from './paginas/tramites/tramites.component';
import { DepartamentosComponent } from './paginas/departamentos/departamentos.component';
import { DocumentosComunicadosComponent } from './paginas/documentos-comunicados/documentos-comunicados.component';
import { IndicadoresComponent } from './paginas/indicadores/indicadores.component';
import { DiagramasComponent } from './paginas/diagramas/diagramas.component';

const routes: Routes = [
  { path: '', redirectTo: 'panel-administrador', pathMatch: 'full' },
  { path: 'panel-administrador', component: PanelAdministradorComponent },
  { path: 'panel-funcionario', component: PanelFuncionarioComponent },
  { path: 'procesos', component: ProcesosComponent },
  { path: 'tramites', component: TramitesComponent },
  { path: 'departamentos', component: DepartamentosComponent },
  { path: 'documentos-comunicados', component: DocumentosComunicadosComponent },
  { path: 'indicadores', component: IndicadoresComponent },
  { path: 'diagramas', component: DiagramasComponent },
  { path: '**', redirectTo: 'panel-administrador' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }