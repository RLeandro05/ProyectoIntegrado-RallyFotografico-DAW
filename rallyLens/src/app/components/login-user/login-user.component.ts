import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceParticipanteService } from '../../services/service-participante.service';
import { Participante } from '../../modules/participante';
import { Router } from '@angular/router';
import { Admin } from '../../modules/admin';
import { ServiceAdminService } from '../../services/service-admin.service';

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

  participante: Participante = <Participante>{};

  admin: Admin = <Admin>{};

  constructor(private fb: FormBuilder, private serviceParticipante: ServiceParticipanteService, private serviceAdmin: ServiceAdminService ,private route: Router) {
    //Formulario para login de participante
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email, Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    //Formulario para login de admin
    this.adminLoginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email, Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")]],
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

        if (!participante) {
          alert("Los datos introducidos son incorrectos. Debe escribrir un correo y contraseña válidos.");
        } else {
          localStorage.setItem("participanteLogueado", JSON.stringify(participante));

          //console.log("Participante logueado en LocalStorage :>> ", localStorage.getItem("participanteLogueado"));

          alert("Has iniciado sesión correctamente.");

          //Recarga la página al completo
          window.location.href = "/";
          //this.route.navigate(['/']);
        }
      }, error => console.error("Error al loguear participante :>> ", error)
    );
  }

  //Lógica para iniciar sesión como admin 
  onAdminSubmit() {

    this.admin = {
      id: -1,
      nombre: "",
      apellidos: "",
      telefono: "",
      correo: this.adminLoginForm.value.correo,
      password: this.adminLoginForm.value.password
    }

    console.log("Admin a loguear :>> ", this.admin);


    //Ejecutar servicio de login para admins
    this.serviceAdmin.loginAdmin(this.admin).subscribe(
      admin => {

        console.log(admin);
        
        if (!admin) {
          alert("Los datos introducidos son incorrectos. Debe escribrir un correo y contraseña válidos.");
        } else {
          localStorage.setItem("adminLogueado", JSON.stringify(admin));

          //console.log("Admin logueado en LocalStorage :>> ", localStorage.getItem("adminLogueado"));

          alert("Has iniciado sesión correctamente.");

          //Recarga la página al completo
          window.location.href = "/";
          //this.route.navigate(['/']);
        }
      }, error => console.error("Error al loguear admin :>> ", error)
    );
  }

  //Cambia entre los formularios de participante y admin
  toggleLoginType() {
    this.isAdminLoginVisible = !this.isAdminLoginVisible;
  }
}
