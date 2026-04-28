import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MenuPrincipalComponent } from './componentes/menu-principal/menu-principal.component';
import { PanelAdministradorComponent } from './paginas/panel-administrador/panel-administrador.component';
import { PanelFuncionarioComponent } from './paginas/panel-funcionario/panel-funcionario.component';
import { ProcesosComponent } from './paginas/procesos/procesos.component';
import { TramitesComponent } from './paginas/tramites/tramites.component';
import { DepartamentosComponent } from './paginas/departamentos/departamentos.component';
import { DocumentosComunicadosComponent } from './paginas/documentos-comunicados/documentos-comunicados.component';
import { IndicadoresComponent } from './paginas/indicadores/indicadores.component';
import { DiagramasComponent } from './paginas/diagramas/diagramas.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuPrincipalComponent,
    PanelAdministradorComponent,
    PanelFuncionarioComponent,
    ProcesosComponent,
    TramitesComponent,
    DepartamentosComponent,
    DocumentosComunicadosComponent,
    IndicadoresComponent,
    DiagramasComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    AppRoutingModule,
    CommonModule,
    FormsModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

