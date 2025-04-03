import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-perfil-participante',
  standalone: false,
  templateUrl: './perfil-participante.component.html',
  styleUrls: ['./perfil-participante.component.css']
})
export class PerfilParticipanteComponent {
  showModal = false;
  modalImageSrc = '';
  profileImage = '/assets/perfilDefecto.png';
  editMode = false;
  perfilForm!: FormGroup; // Formulario Reactivo
  public participanteLogueado: any = null;

  userPhotos = [
    { url: "/assets/imagenPrincipal1.jpeg" }
  ];

  constructor(private route: Router, private fb: FormBuilder) {}

  ngOnInit() {
    const participanteLogueado = localStorage.getItem("participanteLogueado");

    if (!participanteLogueado) {
      this.route.navigate(['/login-user']);
    } else {
      this.participanteLogueado = JSON.parse(participanteLogueado);
      this.perfilForm = this.fb.group({
        nombre: [this.participanteLogueado.nombre],
        apellidos: [this.participanteLogueado.apellidos],
        correo: [this.participanteLogueado.correo],
        telefono: [this.participanteLogueado.telefono]
      });
    }
  }

  // Función para abrir el modal de la foto
  openModal(imageSrc: string) {
    this.modalImageSrc = imageSrc;
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  // Función para cerrar el modal
  closeModal(event?: Event) {
    if (event) event.stopPropagation();
    this.showModal = false;
    document.body.style.overflow = '';
  }

  // Función para activar/desactivar el modo edición
  toggleEditMode() {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      // Al salir del modo edición, actualizamos los valores del formulario
      this.perfilForm.patchValue({
        nombre: this.participanteLogueado.nombre,
        apellidos: this.participanteLogueado.apellidos,
        correo: this.participanteLogueado.correo,
        telefono: this.participanteLogueado.telefono
      });
    }
  }

  // Función para guardar cambios al enviar el formulario
  onSubmit() {
    if (this.perfilForm.valid) {
      this.participanteLogueado = { ...this.perfilForm.value }; // Guarda los cambios
      console.log('Participante actualizado:', this.participanteLogueado);
      this.editMode = false; // Salir del modo edición
    }
  }
}
