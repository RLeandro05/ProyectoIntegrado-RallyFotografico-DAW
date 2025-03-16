import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {
    // Formulario para login de participante
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Formulario para login de admin (ahora usa los mismos nombres de campos)
    this.adminLoginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    // Lógica para iniciar sesión como participante
    console.log(this.loginForm.value);
  }

  onAdminSubmit() {
    // Lógica para iniciar sesión como admin
    console.log(this.adminLoginForm.value);
  }

  // Cambia entre los formularios de participante y admin
  toggleLoginType() {
    this.isAdminLoginVisible = !this.isAdminLoginVisible;
  }
}
