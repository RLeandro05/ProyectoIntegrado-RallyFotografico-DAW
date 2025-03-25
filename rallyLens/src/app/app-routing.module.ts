import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RegisterUserComponent } from './components/register-user/register-user.component';
import { LoginUserComponent } from './components/login-user/login-user.component';
import { PerfilParticipanteComponent } from './components/perfil-participante/perfil-participante.component';

const routes: Routes = [
  {path: "", component: HomeComponent},
  {path: "register-user", component: RegisterUserComponent},
  {path: "login-user", component: LoginUserComponent},
  {path: "perfil-participante", component: PerfilParticipanteComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
