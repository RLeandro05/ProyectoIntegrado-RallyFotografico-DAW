import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceParticipanteService } from '../../services/service-participante.service';
import { Participante } from '../../modules/participante';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-user',
  standalone: false,
  templateUrl: './register-user.component.html',
  styleUrl: './register-user.component.css'
})
export class RegisterUserComponent {
  registerForm: FormGroup;
  participante: Participante = <Participante> {};

  constructor(private fb: FormBuilder, private serviceParticipante: ServiceParticipanteService, private route: Router) {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{9,15}$')]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      console.log('Formulario válido, datos enviados:', this.registerForm.value);
      
      this.participante = {
        id: -1,
        nombre: this.registerForm.value.nombre,
        apellidos: this.registerForm.value.apellidos,
        telefono: this.registerForm.value.telefono,
        correo: this.registerForm.value.correo,
        password: this.registerForm.value.password
      };

      this.serviceParticipante.registrarParticipante(this.participante).subscribe(
        datos => {
          if (!datos) {
            alert("El correo introducido ya está registrado. Ingrese uno válido.");
          } else {
            alert("Se ha registrado correctamente.");
            this.route.navigate(['/login-user']);
          }
        },
        error => {
          console.error("Error al registrar un nuevo participante:", error);
        }
      );
    } else {
      console.log('Formulario inválido, revisa los campos.');
    }
  }
  
}
