import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { FooterComponent } from './components/footer/footer.component';
import { RegisterUserComponent } from './components/register-user/register-user.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginUserComponent } from './components/login-user/login-user.component';

import { HttpClientModule } from '@angular/common/http';
import { PerfilParticipanteComponent } from './components/perfil-participante/perfil-participante.component';

import { FormsModule } from '@angular/forms';
import { AdminParticipantesComponent } from './components/admin-participantes/admin-participantes.component';
import { AdminFotografiasComponent } from './components/admin-fotografias/admin-fotografias.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    FooterComponent,
    RegisterUserComponent,
    LoginUserComponent,
    PerfilParticipanteComponent,
    AdminParticipantesComponent,
    AdminFotografiasComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
