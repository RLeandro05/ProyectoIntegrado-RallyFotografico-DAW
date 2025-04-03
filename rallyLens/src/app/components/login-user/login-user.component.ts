import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceParticipanteService } from '../../services/service-participante.service';
import { Participante } from '../../modules/participante';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-user',
  standalone: false,
  templateUrl: './login-user.component.html',
  styleUrls: ['./login-user.component.css']
})
export class LoginUserComponent {
  loginForm: FormGroup;
  adminLoginForm: FormGroup;
  isAdminLoginVisible = false;

  participante: Participante = <Participante> {};

  constructor(private fb: FormBuilder, private serviceParticipante: ServiceParticipanteService, private route: Router) {
    //Formulario para login de participante
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    //Formulario para login de admin
    this.adminLoginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  //Lógica para iniciar sesión como participante
  onSubmit() {
    //console.log(this.loginForm.value);

    this.participante = {
      id: -1,
      nombre: "",
      apellidos: "",
      telefono: "",
      correo: this.loginForm.value.correo,
      password: this.loginForm.value.password,
      foto_perfil: null
    }

    //console.log("Participante a loguear :>> ", this.participante);
    

    //Ejecutar servicio de login para participantes
    this.serviceParticipante.loguearParticipante(this.participante).subscribe(
      participante => {

        if(!participante) {
          alert("Los datos introducidos son incorrectos. Debe escribrir un correo y contraseña válidos.");
        } else {
          localStorage.setItem("participanteLogueado", JSON.stringify(participante));

          //console.log("Participante logueado en LocalStorage :>> ", localStorage.getItem("participanteLogueado"));

          alert("Has iniciado sesión correctamente.");

          window.location.href = "/";
          //this.route.navigate(['/']);
        }
      }, error => console.error("Error al loguear participante :>> ", error)
    );
  }

  //Lógica para iniciar sesión como admin 
  onAdminSubmit() {
    console.log(this.adminLoginForm.value);
  }

  //Cambia entre los formularios de participante y admin
  toggleLoginType() {
    this.isAdminLoginVisible = !this.isAdminLoginVisible;
  }
}
