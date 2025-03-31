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
      password: this.loginForm.value.password
    }

    //console.log("Participante a loguear :>> ", this.participante);
    

    //Ejecutar servicio de login para participantes
    this.serviceParticipante.loguearParticipante(this.participante).subscribe(
      datos => {
        this.participante = datos;

        //Si no existen los datos, mostrar alerta de credenciales incorrectas
        if(!datos) {
          alert("Los datos introducidos son incorrectos. Debe escribrir un correo y contraseña válidos.");
        } else { //Si existen en la base de datos, mostra mensaje de satisfacción y redirigir a Home
          console.log("Participante logueado correctamente :>> ", this.participante);

          alert("Has iniciado sesión correctamente.");

          this.route.navigate(['/']);
        }
        
      }, error => console.error("Error al iniciar sesión como participante :>> ", error)
    )
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
